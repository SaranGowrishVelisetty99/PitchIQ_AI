"""Ingest endpoint — seed RAG collections with text documents."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.rag.ingest import ingest_text

router = APIRouter(prefix="/ingest", tags=["ingest"])


class IngestRequest(BaseModel):
    collection: str
    texts: list[str]
    metadatas: list[dict] | None = None


class IngestResponse(BaseModel):
    collection: str
    ingested: int
    message: str


@router.post("", response_model=IngestResponse)
async def ingest_documents(body: IngestRequest):
    valid_collections = {
        "fifa-laws", "tactical-knowledge", "coaching-documents",
        "referee-guidelines", "formation-patterns", "momentum-patterns",
    }
    if body.collection not in valid_collections:
        raise HTTPException(
            400,
            f"Invalid collection '{body.collection}'. "
            f"Valid: {', '.join(sorted(valid_collections))}",
        )
    try:
        count = ingest_text(body.collection, body.texts, body.metadatas)
        return IngestResponse(
            collection=body.collection,
            ingested=count,
            message=f"Successfully ingested {count} document(s) into '{body.collection}'.",
        )
    except Exception as exc:
        raise HTTPException(500, f"Ingestion failed: {exc}")
