"""Orchestration flow — coordinates multiple CrewAI agents with RAG context.

Mirrors the TS orchestrator.ts but uses downstream Python agent calls.
"""

import json
from typing import AsyncGenerator, Optional
from loguru import logger
from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.registry import run_agent, detect_relevant_agents
from app.agents.llm import get_chat_model, get_streaming_chat_model
from app.rag.retriever import retrieve_context
from app.schemas.base import (
    AgentName,
    AgentInput,
    AgentOutput,
    OrchestratedResponse,
    SourceCitation,
    ExpertiseLevel,
)


CHAT_SYSTEM_PROMPT = """You are PitchIQ AI — an explainable soccer intelligence assistant powered by a multi-agent system.
You have access to five specialized agents: Formation, Momentum, VAR, Story, and Explanation.

Adapt your explanations based on the user's expertise level:
- beginner: Use simple analogies, avoid jargon, explain basics like teaching a new fan
- intermediate: Use proper terminology, discuss tactics, reference rules
- expert: Deep tactical analysis, specific law citations, advanced concepts
- child: Use storytelling, fun metaphors, simple language

Determine which agent context is most relevant and incorporate it.
Use RAG context when provided. If you don't know something, say so clearly.
Always explain your reasoning with evidence."""


async def orchestrate(
    message: str,
    match_data: Optional[dict] = None,
    incident: Optional[dict] = None,
    expertise_level: str = "intermediate",
    history: list[dict] | None = None,
    agent_names: list[str] | None = None,
    stream: bool = False,
    on_token=None,
) -> OrchestratedResponse:
    """Run the multi-agent orchestration pipeline.

    Steps:
    1. Detect or select relevant agents
    2. Retrieve RAG context
    3. Run each agent sequentially
    4. Append explanation agent
    5. Synthesize final response
    """
    try:
        level = ExpertiseLevel(expertise_level)
    except ValueError:
        level = ExpertiseLevel.intermediate

    names = (
        [AgentName(n) for n in agent_names]
        if agent_names
        else detect_relevant_agents(message)
    )

    # 1. RAG retrieval
    collection = "fifa-laws" if AgentName.var in names else "tactical-knowledge"
    rag_docs, rag_citations = await _retrieve_rag_sync(message, collection)

    # 2. Run agents sequentially
    agent_outputs: list[AgentOutput] = []
    for name in names:
        try:
            context_str = "\n".join(rag_docs) if rag_docs else ""
            task_input = _build_agent_input(name, message, match_data, incident, context_str)
            result = run_agent(name, task_input, context=context_str if context_str else None)
            output = _parse_agent_result(name, result)
            agent_outputs.append(output)
        except Exception as exc:
            logger.error(f"Agent {name} error: {exc}")
            agent_outputs.append(
                AgentOutput(
                    agent=name,
                    output={"summary": f"{name} analysis could not be completed."},
                    confidence=0.0,
                    reasoning=f"Agent processing failed: {exc}",
                    sources=[],
                )
            )

    # 3. Add explanation agent if not already present
    if AgentName.explanation not in names and agent_outputs:
        try:
            combined = json.dumps([o.output for o in agent_outputs])
            exp_input = _build_explanation_input(combined, level)
            exp_result = run_agent(AgentName.explanation, exp_input, temperature=0.4)
            exp_output = _parse_agent_result(AgentName.explanation, exp_result)
            agent_outputs.append(exp_output)
        except Exception as exc:
            logger.warning(f"Explanation agent skipped: {exc}")

    # 4. Synthesize final response
    combined_context = _build_combined_context(rag_docs, agent_outputs)
    history_text = _format_history(history or [])

    chat_model = get_streaming_chat_model()
    prompt = _build_chat_prompt(message, history_text, level.value, [n.value for n in names], combined_context)

    if stream and on_token:
        full = ""
        async for chunk in chat_model.astream([SystemMessage(content=CHAT_SYSTEM_PROMPT), HumanMessage(content=prompt)]):
            token = chunk.content if hasattr(chunk, "content") else str(chunk)
            full += token
            on_token(token)
        combined_response = full
    else:
        response = chat_model.invoke(
            [SystemMessage(content=CHAT_SYSTEM_PROMPT), HumanMessage(content=prompt)]
        )
        combined_response = response.content if hasattr(response, "content") else str(response)

    return OrchestratedResponse(
        query=message,
        primary_agent=names[0] if names else AgentName.formation,
        agents=agent_outputs,
        combined=combined_response,
        sources=rag_citations,
    )


async def retrieve_rag_stream(
    message: str,
    agent_names: list[AgentName] | None = None,
) -> AsyncGenerator[str, None]:
    """Streaming equivalent — yields agent progress tokens."""
    from app.utils.streaming import async_token_stream
    # Simplified: run orchestrate with on_token yielding
    tokens: list[str] = []

    def collect(t: str):
        tokens.append(t)

    await orchestrate(
        message=message,
        agent_names=[n.value for n in agent_names] if agent_names else None,
        stream=True,
        on_token=collect,
    )

    async def gen():
        for t in tokens:
            yield t

    return gen()


# ── Internal helpers ──────────────────────────────────────────────────────


async def _retrieve_rag_sync(query: str, collection: str):
    """Retrieve RAG context synchronously inside async context."""
    docs, citations = retrieve_context(query, collection)
    return docs, citations


def _build_agent_input(
    name: AgentName,
    message: str,
    match_data: dict | None,
    incident: dict | None,
    rag_context: str,
) -> str:
    parts = [f"User query: {message}"]
    if match_data:
        parts.append(f"Match data: {json.dumps(match_data, indent=2)}")
    if incident:
        parts.append(f"Incident: {json.dumps(incident, indent=2)}")
    if rag_context:
        parts.append(f"Retrieved context:\n{rag_context}")
    parts.append("Provide your analysis in the expected JSON format with confidence scores.")
    return "\n\n".join(parts)


def _build_explanation_input(technical_output: str, level: ExpertiseLevel) -> str:
    return json.dumps({
        "technicalAnalysis": technical_output,
        "expertiseMode": level.value,
        "instruction": f"Transform this technical soccer analysis into an explanation suitable for '{level.value}' level. Adapt vocabulary and depth accordingly.",
    })


def _parse_agent_result(name: AgentName, result) -> AgentOutput:
    """Try to parse agent output as JSON; wrap in AgentOutput."""
    try:
        if isinstance(result, str):
            parsed = json.loads(result)
        elif hasattr(result, "content"):
            parsed = json.loads(result.content)
        else:
            parsed = {"summary": str(result)}
    except (json.JSONDecodeError, TypeError):
        parsed = {"summary": str(result)[:500]}

    raw_conf = parsed.get("confidence", 70) if isinstance(parsed, dict) else 70
    confidence = raw_conf if raw_conf > 1 else raw_conf * 100

    return AgentOutput(
        agent=name,
        output=parsed if isinstance(parsed, dict) else {"summary": str(parsed)},
        confidence=float(confidence),
        reasoning=parsed.get("reasoning", "") if isinstance(parsed, dict) else "",
        sources=[],
    )


def _build_combined_context(rag_docs: list[str], outputs: list[AgentOutput]) -> str:
    parts = list(rag_docs)
    for o in outputs:
        parts.append(json.dumps(o.output))
    return "\n\n".join(parts)


def _format_history(history: list[dict]) -> str:
    recent = history[-10:] if history else []
    return "\n".join(f"{m.get('role', 'user')}: {m.get('content', '')}" for m in recent)


def _build_chat_prompt(
    message: str,
    history: str,
    expertise: str,
    agents: list[str],
    context: str,
) -> str:
    return json.dumps({
        "message": message,
        "conversationHistory": history,
        "expertiseLevel": expertise,
        "context": ", ".join(agents),
        "retrievedKnowledge": context or "No specific context retrieved.",
        "instruction": "Respond to the user's soccer question appropriately for their expertise level. If relevant rules or context were retrieved, cite them.",
    })
