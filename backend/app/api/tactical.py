"""Tactical endpoint — dual-agent (Formation + Momentum) analysis."""

from fastapi import APIRouter, HTTPException
from app.agents.registry import run_agent
from app.schemas.base import AgentInput, AgentName

router = APIRouter(prefix="/tactical", tags=["tactical"])


@router.post("")
async def tactical_analysis(body: AgentInput):
    """Run Formation + Momentum agents together for a tactical overview."""
    try:
        events_str = _format_events(body)
        formation_result = run_agent(AgentName.formation, events_str)
        momentum_result = run_agent(AgentName.momentum, events_str)
        return {
            "formation": formation_result,
            "momentum": momentum_result,
        }
    except Exception as exc:
        raise HTTPException(500, f"Tactical analysis failed: {exc}")


def _format_events(body: AgentInput) -> str:
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
