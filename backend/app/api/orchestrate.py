"""Orchestration + streaming endpoint."""

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.orchestration.flow import orchestrate
from app.schemas.base import AgentInput

router = APIRouter(prefix="/orchestrate", tags=["orchestrate"])


@router.post("")
async def orchestrate_endpoint(body: AgentInput):
    try:
        result = await orchestrate(
            message=body.message,
            match_data=body.match_data.model_dump() if body.match_data else None,
            incident=body.incident.model_dump() if body.incident else None,
            expertise_level=body.expertise_level.value if body.expertise_level else "intermediate",
            history=[],
            agent_names=[n.value for n in body.agent_names] if body.agent_names else None,
            stream=False,
        )
        return result.model_dump()
    except Exception as exc:
        raise HTTPException(500, f"Orchestration failed: {exc}")


@router.post("/stream")
async def orchestrate_stream(body: AgentInput):
    """SSE streaming orchestration endpoint."""

    async def event_stream():
        token_buffer = []

        def on_token(token: str):
            token_buffer.append(token)

        try:
            result = await orchestrate(
                message=body.message,
                match_data=body.match_data.model_dump() if body.match_data else None,
                incident=body.incident.model_dump() if body.incident else None,
                expertise_level=body.expertise_level.value if body.expertise_level else "intermediate",
                history=[],
                agent_names=[n.value for n in body.agent_names] if body.agent_names else None,
                stream=True,
                on_token=on_token,
            )
            full_text = "".join(token_buffer)
        except Exception as exc:
            full_text = f"Orchestration failed: {exc}"

        yield f"data: {json.dumps({'type': 'full', 'content': full_text})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
