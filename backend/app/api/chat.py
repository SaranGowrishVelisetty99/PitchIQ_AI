"""Chat endpoint — streaming conversation with orchestration."""

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.agents.registry import detect_relevant_agents
from app.schemas.base import AgentInput, AgentOutput, OrchestratedResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat_endpoint(body: AgentInput):
    """Chat with full context, returning complete response."""
    from app.orchestration.flow import orchestrate

    try:
        result = await orchestrate(
            message=body.message,
            match_data=body.match_data.model_dump() if body.match_data else None,
            incident=body.incident.model_dump() if body.incident else None,
            expertise_level=body.expertise_level.value if body.expertise_level else "intermediate",
            history=body.history or [],
            agent_names=[n.value for n in body.agent_names] if body.agent_names else None,
            stream=False,
        )
        return result.model_dump()
    except Exception as exc:
        raise HTTPException(500, f"Chat failed: {exc}")


@router.post("/stream")
async def chat_stream(body: AgentInput):
    """Streaming chat with SSE."""

    async def event_stream():
        from app.orchestration.flow import orchestrate

        token_buffer = []

        def on_token(token: str):
            token_buffer.append(token)

        try:
            result = await orchestrate(
                message=body.message,
                match_data=body.match_data.model_dump() if body.match_data else None,
                incident=body.incident.model_dump() if body.incident else None,
                expertise_level=body.expertise_level.value if body.expertise_level else "intermediate",
                history=body.history or [],
                agent_names=[n.value for n in body.agent_names] if body.agent_names else None,
                stream=True,
                on_token=on_token,
            )
            full_text = "".join(token_buffer)
        except Exception as exc:
            full_text = f"Chat failed: {exc}"

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
