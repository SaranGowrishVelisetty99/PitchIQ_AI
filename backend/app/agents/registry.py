"""Agent registry — maps agent names to their CrewAI agent + task factories."""

import json
import re
from crewai import Agent, Task
from typing import Any
from app.agents.llm import get_chat_model
from app.agents.formation import create_formation_agent
from app.agents.momentum import create_momentum_agent
from app.agents.var import create_var_agent
from app.agents.story import create_story_agent
from app.agents.explanation import create_explanation_agent
from app.schemas.base import AgentName
from app.rag.retriever import retrieve_context


_agent_factories = {
    AgentName.formation: create_formation_agent,
    AgentName.momentum: create_momentum_agent,
    AgentName.var: create_var_agent,
    AgentName.story: create_story_agent,
    AgentName.explanation: create_explanation_agent,
}

AGENT_DEFINITIONS: dict[str, dict] = {
    name.value: factory() for name, factory in _agent_factories.items()
}

# Map each agent to its relevant RAG collections
AGENT_RAG_COLLECTIONS: dict[AgentName, list[str]] = {
    AgentName.formation: ["formation-patterns", "tactical-knowledge"],
    AgentName.momentum: ["momentum-patterns", "tactical-knowledge"],
    AgentName.var: ["fifa-laws", "referee-guidelines"],
    AgentName.story: ["tactical-knowledge", "momentum-patterns", "formation-patterns"],
    AgentName.explanation: ["tactical-knowledge", "coaching-documents", "fifa-laws"],
}


def get_agent_factory(name: AgentName):
    return _agent_factories[name]


def _parse_crewai_output(raw: Any) -> dict:
    """Try to parse CrewAI task output into a dict.

    CrewAI returns a string (usually JSON). Parse it and return a dict.
    """
    if isinstance(raw, dict):
        return raw
    text = str(raw).strip()
    # Try direct JSON parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try extracting JSON from markdown fences
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass
    # Try finding {...} or [...] block
    brace = text.find("{")
    if brace >= 0:
        try:
            return json.loads(text[brace : text.rfind("}") + 1])
        except (json.JSONDecodeError, ValueError):
            pass
    return {"summary": text[:500], "raw": text[:2000]}


def _retrieve_agent_context(name: AgentName, query: str) -> str:
    """Retrieve RAG context relevant to a specific agent."""
    collections = AGENT_RAG_COLLECTIONS.get(name, ["tactical-knowledge"])
    all_docs = []
    for coll in collections:
        docs, _ = retrieve_context(query, coll, top_k=3)
        all_docs.extend(docs)
    if all_docs:
        return "\n\n---\n\n".join(all_docs)
    return ""


def run_agent(
    name: AgentName,
    task_description: str,
    context: str | None = None,
    temperature: float = 0.3,
    query_for_rag: str | None = None,
) -> Any:
    """Run a single CrewAI agent with a task and return the result.

    Automatically retrieves RAG context relevant to the agent type
    and injects it into the task description.
    """
    factory = get_agent_factory(name)
    agent_def = factory()
    llm = get_chat_model(temperature=temperature)

    # Retrieve RAG context for this agent type
    rag_context = _retrieve_agent_context(name, query_for_rag or task_description)
    if rag_context:
        enriched_task = (
            f"{task_description}\n\n"
            f"=== RETRIEVED KNOWLEDGE ===\n"
            f"{rag_context}\n"
            f"=== END RETRIEVED KNOWLEDGE ===\n\n"
            f"Use the above retrieved knowledge to inform your analysis. "
            f"Cite specific rules, patterns, or concepts where applicable."
        )
    else:
        enriched_task = task_description

    agent = Agent(
        role=agent_def["role"],
        goal=agent_def["goal"],
        backstory=agent_def["backstory"],
        llm=llm,
        verbose=False,
    )
    task = Task(
        description=enriched_task,
        expected_output=agent_def["expected_output"],
        agent=agent,
        context=[{"description": context}] if context else None,
    )
    raw = task.execute()
    return _parse_crewai_output(raw)


def run_agent_with_tools(
    name: AgentName,
    task_description: str,
    tools: list | None = None,
    temperature: float = 0.3,
) -> Any:
    """Run a single CrewAI agent with custom tools."""
    factory = get_agent_factory(name)
    agent_def = factory()
    llm = get_chat_model(temperature=temperature)

    # Retrieve RAG context for this agent type
    rag_context = _retrieve_agent_context(name, task_description)
    if rag_context:
        enriched_task = (
            f"{task_description}\n\n"
            f"=== RETRIEVED KNOWLEDGE ===\n"
            f"{rag_context}\n"
            f"=== END RETRIEVED KNOWLEDGE ===\n\n"
            f"Use the above retrieved knowledge to inform your analysis. "
            f"Cite specific rules, patterns, or concepts where applicable."
        )
    else:
        enriched_task = task_description

    agent = Agent(
        role=agent_def["role"],
        goal=agent_def["goal"],
        backstory=agent_def["backstory"],
        llm=llm,
        tools=tools or [],
        verbose=False,
    )
    task = Task(
        description=enriched_task,
        expected_output=agent_def["expected_output"],
        agent=agent,
    )
    raw = task.execute()
    return _parse_crewai_output(raw)


KEYWORD_MAP: dict[AgentName, list[str]] = {
    AgentName.formation: ["formation", "tactic", "pressing", "defensive", "attacking", "shape", "4-3-3", "4-4-2", "lineup"],
    AgentName.momentum: ["momentum", "shift", "turning point", "dominant", "pressure", "comeback"],
    AgentName.var: ["offside", "handball", "penalty", "red card", "foul", "var", "referee", "fifa law", "rule", "decision"],
    AgentName.story: ["story", "narrative", "tale", "chapter", "drama", "recap", "what happened"],
}


def detect_relevant_agents(message: str) -> list[AgentName]:
    """Detect which agents are relevant based on message keywords."""
    lower = message.lower()
    matched: list[AgentName] = []
    for agent_name, keywords in KEYWORD_MAP.items():
        if any(kw in lower for kw in keywords):
            matched.append(agent_name)
    if not matched:
        matched = [AgentName.formation, AgentName.momentum]
    return matched
