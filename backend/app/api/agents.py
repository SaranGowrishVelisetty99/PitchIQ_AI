"""Individual agent endpoints — one route per agent."""

from hashlib import sha256
from fastapi import APIRouter, HTTPException
from app.agents.registry import run_agent
from app.schemas.base import AgentInput, AgentName
from app.utils.cache import agent_cache

router = APIRouter(prefix="/agents", tags=["agents"])


def _cached_run(
    agent: AgentName,
    task: str,
    temperature: float = 0.3,
    query_for_rag: str | None = None,
):
    key = sha256(f"{agent.value}:{task}:{temperature}".encode()).hexdigest()
    cached = agent_cache.get(key)
    if cached:
        return cached
    result = run_agent(agent, task, temperature=temperature, query_for_rag=query_for_rag)
    agent_cache.set(key, result)
    return result


@router.post("/formation")
async def formation_agent(body: AgentInput):
    try:
        events_str = _format_events(body)
        result = _cached_run(AgentName.formation, events_str, query_for_rag=events_str)
        return {"agent": "formation", "output": result}
    except Exception as exc:
        raise HTTPException(500, f"Formation analysis failed: {exc}")


@router.post("/momentum")
async def momentum_agent(body: AgentInput):
    try:
        events_str = _format_events(body)
        result = _cached_run(AgentName.momentum, events_str, query_for_rag=events_str)
        return {"agent": "momentum", "output": result}
    except Exception as exc:
        raise HTTPException(500, f"Momentum analysis failed: {exc}")


@router.post("/var")
async def var_agent(body: AgentInput):
    try:
        incident_type = body.incident.type.value if body.incident else "general"
        description = body.incident.description if body.incident else body.message
        query = f"{incident_type} {description}"
        result = _cached_run(AgentName.var, f"Incident type: {incident_type}\nDescription: {description}", query_for_rag=query)
        return {"agent": "var", "output": result}
    except Exception as exc:
        raise HTTPException(500, f"VAR analysis failed: {exc}")


@router.post("/story")
async def story_agent(body: AgentInput):
    try:
        events_str = _format_events(body)
        result = _cached_run(AgentName.story, events_str, temperature=0.4, query_for_rag=events_str)
        return {"agent": "story", "output": result}
    except Exception as exc:
        raise HTTPException(500, f"Story generation failed: {exc}")


@router.post("/explanation")
async def explanation_agent(body: AgentInput):
    try:
        mode = body.expertise_level.value if body.expertise_level else "intermediate"
        task = (
            f"Technical analysis: {body.message}\n\n"
            f"Expertise mode: {mode}\n\n"
            f"Transform this technical soccer analysis into an explanation "
            f"suitable for '{mode}' level."
        )
        result = _cached_run(AgentName.explanation, task, temperature=0.4, query_for_rag=body.message)
        return {"agent": "explanation", "output": result}
    except Exception as exc:
        raise HTTPException(500, f"Explanation failed: {exc}")


def _format_events(body: AgentInput) -> str:
    """Format match data into a readable string for agent input."""
    if body.match_data:
        md = body.match_data
        lines = []
        for e in md.events:
            team_name = md.home_team if e.team == "home" else md.away_team
            player = f" ({e.player})" if e.player else ""
            lines.append(f"{e.minute}' - {team_name} {e.type}{player}: {e.description}")
        stats = md.stats
        lines.append(
            f"\nStats: Possession {stats.possession.home}%-{stats.possession.away}% | "
            f"Shots {stats.shots.home}-{stats.shots.away}"
        )
        return "\n".join(lines)
    return body.message
