"""LangFlow integration helpers — export CrewAI flows as LangFlow JSON."""

import json
from typing import Any

from app.agents.registry import KEYWORD_MAP, AGENT_DEFINITIONS
from app.config import get_settings
from urllib.parse import urlparse

settings = get_settings()


def build_langflow_json() -> dict[str, Any]:
    """Build a LangFlow-compatible JSON export for the PitchIQ agent flow.

    The flow connects:
      1. Input (chat/analysis request)
      2. Agent Router — maps keywords to agent(s)
      3. Parallel Agent Execution (Formation, Momentum, VAR, Story)
      4. Explanation Agent (runs after all agents)
      5. RAG Retriever (feeds context to agents)
      6. Output (synthesized response)

    Returns a dict that can be imported into LangFlow.
    """
    return {
        "description": "PitchIQ AI — multi-agent soccer intelligence flow",
        "name": "PitchIQ AI Flow",
        "data": {
            "nodes": _build_nodes(),
            "edges": _build_edges(),
        },
    }


def _build_nodes() -> list[dict]:
    nodes = []

    # 1. Chat Input node
    nodes.append(_text_input_node("chat_input", "Chat Input", "input"))
    nodes.append(_chat_output_node("chat_output", "Chat Output", "output"))

    # 2. LLM node (OpenRouter)
    nodes.append(_openrouter_node("llm", "LLM (OpenRouter)", model=settings.llm_model))

    # 3. RAG Retriever
    nodes.append(_rag_retriever_node("retriever", "RAG Retriever"))

    # 4. Agent Runner nodes (one per agent)
    for i, (name, _) in enumerate(AGENT_DEFINITIONS.items()):
        nodes.append(_crewai_agent_node(f"agent_{name}", f"Agent: {name}", name))

    # 5. Router (keyword → agent)
    nodes.append(_router_node("router", "Agent Router"))

    # 6. Synthesizer (combine agent outputs)
    nodes.append(_synthesizer_node("synthesizer", "Response Synthesizer"))

    return nodes


def _build_edges() -> list[dict]:
    edges = []

    # Input → Router
    edges.append(_edge("chat_input", "router", "text", "input"))

    # Router → each agent
    for name in AGENT_DEFINITIONS:
        edges.append(_edge("router", f"agent_{name}", name, "input"))

    # Retriever → each agent (context)
    for name in AGENT_DEFINITIONS:
        edges.append(_edge("retriever", f"agent_{name}", "context", "context"))

    # All agents → Synthesizer
    for name in AGENT_DEFINITIONS:
        edges.append(_edge(f"agent_{name}", "synthesizer", "output", name))

    # Synthesizer → LLM
    edges.append(_edge("synthesizer", "llm", "text", "input"))

    # LLM → Output
    edges.append(_edge("llm", "chat_output", "text", "input"))

    return edges


def _text_input_node(id_: str, label: str, field: str) -> dict:
    return {
        "id": id_,
        "type": "TextInput",
        "position": {"x": 100, "y": 100},
        "data": {
            "nodeName": label,
            "nodeType": "Input",
            "template": {field: {"value": ""}},
        },
    }


def _chat_output_node(id_: str, label: str, field: str) -> dict:
    return {
        "id": id_,
        "type": "TextOutput",
        "position": {"x": 900, "y": 400},
        "data": {
            "nodeName": label,
            "nodeType": "Output",
            "template": {field: {"value": ""}},
        },
    }


def _openrouter_node(id_: str, label: str, model: str) -> dict:
    return {
        "id": id_,
        "type": "ChatOpenAI",
        "position": {"x": 700, "y": 300},
        "data": {
            "nodeName": label,
            "nodeType": "LLM",
            "template": {
                "model_name": {"value": model},
                "openai_api_key": {"value": settings.openrouter_api_key},
                "openai_api_base": {"value": settings.openrouter_base_url},
                "temperature": {"value": 0.3},
            },
        },
    }


def _rag_retriever_node(id_: str, label: str) -> dict:
    parsed = urlparse(settings.chroma_db_url)
    host = parsed.hostname or "localhost"
    port = parsed.port or 8000
    return {
        "id": id_,
        "type": "ChromaDB",
        "position": {"x": 300, "y": 50},
        "data": {
            "nodeName": label,
            "nodeType": "VectorStore",
            "template": {
                "host": {"value": host},
                "port": {"value": port},
                "collection_name": {"value": "tactical-knowledge"},
                "number_of_results": {"value": 5},
            },
        },
    }


def _crewai_agent_node(id_: str, label: str, agent_name: str) -> dict:
    return {
        "id": id_,
        "type": "CustomComponent",
        "position": {"x": 500, "y": 150 + _agent_y_offset(agent_name)},
        "data": {
            "nodeName": label,
            "nodeType": "Agent",
            "agentName": agent_name,
            "template": {
                "agent_name": {"value": agent_name, "display_name": "Agent Name"},
                "role": {"value": AGENT_DEFINITIONS.get(agent_name, {}).get("role", "")},
                "goal": {"value": AGENT_DEFINITIONS.get(agent_name, {}).get("goal", "")},
            },
        },
    }


def _router_node(id_: str, label: str) -> dict:
    kw_list = ", ".join(f"{k}: {v}" for k, v in KEYWORD_MAP.items())
    return {
        "id": id_,
        "type": "Router",
        "position": {"x": 300, "y": 300},
        "data": {
            "nodeName": label,
            "nodeType": "Router",
            "template": {
                "text": {"value": ""},
                "keywords": {"value": kw_list, "display_name": "Keyword→Agent Map"},
            },
        },
    }


def _synthesizer_node(id_: str, label: str) -> dict:
    return {
        "id": id_,
        "type": "Prompt",
        "position": {"x": 700, "y": 100},
        "data": {
            "nodeName": label,
            "nodeType": "Prompt",
            "template": {
                "template": {
                    "value": (
                        "Synthesize the following agent outputs into a single coherent response. "
                        "Include relevant citations and explanations.\n\n{agent_outputs}"
                    )
                }
            },
        },
    }


def _edge(source: str, target: str, source_handle: str, target_handle: str) -> dict:
    return {
        "source": source,
        "target": target,
        "sourceHandle": source_handle,
        "targetHandle": target_handle,
    }


def _agent_y_offset(name: str) -> int:
    offsets = {
        "formation": 0,
        "momentum": 80,
        "var": 160,
        "story": 240,
        "explanation": 320,
    }
    return offsets.get(name, 0)
