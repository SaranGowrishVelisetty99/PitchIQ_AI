"""Health check endpoint — system status with component checks."""

from fastapi import APIRouter
from pydantic import BaseModel
from app.rag.chroma_client import get_client as get_chroma_client, is_available as chroma_available
from app.rag.embeddings import get_embedding_dimension
from app.config import get_settings

router = APIRouter(prefix="/health", tags=["health"])


class ComponentStatus(BaseModel):
    name: str
    healthy: bool
    detail: str | None = None


class HealthResponse(BaseModel):
    status: str
    version: str
    components: list[ComponentStatus]


@router.get("", response_model=HealthResponse)
async def health_check():
    components = []

    # ChromaDB check
    try:
        avail = chroma_available()
        client = get_chroma_client()
        coll_count = len(client.list_collections())
        components.append(ComponentStatus(name="chromadb", healthy=avail, detail=f"Available={avail}, collections={coll_count}"))
    except Exception as exc:
        components.append(ComponentStatus(name="chromadb", healthy=False, detail=str(exc)))

    # Embeddings check
    try:
        dim = get_embedding_dimension()
        components.append(ComponentStatus(name="embeddings", healthy=True, detail=f"Dim={dim}"))
    except Exception as exc:
        components.append(ComponentStatus(name="embeddings", healthy=False, detail=str(exc)))

    # LLM check (lazy — just check config, don't instantiate)
    try:
        settings = get_settings()
        components.append(ComponentStatus(name="llm", healthy=bool(settings.openrouter_api_key), detail=f"Model={settings.llm_model}"))
    except Exception as exc:
        components.append(ComponentStatus(name="llm", healthy=False, detail=str(exc)))

    all_healthy = all(c.healthy for c in components)

    return HealthResponse(
        status="healthy" if all_healthy else "degraded",
        version="1.0.0",
        components=components,
    )
