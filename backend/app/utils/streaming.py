"""SSE (Server-Sent Events) streaming helpers."""

import json
from typing import AsyncGenerator


async def token_stream(tokens: list[str]) -> AsyncGenerator[str, None]:
    """Yield tokens as SSE data events."""
    for token in tokens:
        yield f"data: {json.dumps({'token': token})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"


async def async_token_stream(async_gen) -> AsyncGenerator[str, None]:
    """Stream tokens from an async generator as SSE events."""
    async for token in async_gen:
        yield f"data: {json.dumps({'token': token})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"
