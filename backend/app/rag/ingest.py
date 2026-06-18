"""Ingestion pipeline for seeding the RAG knowledge base.

Handles chunking text, embedding, and storing in Chroma collections.
"""

from typing import Optional
from loguru import logger
from app.config import get_settings
from app.rag.chroma_client import get_or_create_collection, is_available
from app.rag.embeddings import embed_texts


def chunk_text(text: str, chunk_size: Optional[int] = None, overlap: Optional[int] = None) -> list[dict]:
    """Split text into overlapping word-level chunks."""
    cs = chunk_size or get_settings().chunk_size
    ov = overlap or get_settings().chunk_overlap
    words = text.split()
    chunks = []
    step = cs - ov
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + cs])
        if chunk.strip():
            chunks.append(
                {
                    "text": chunk,
                    "metadata": {"index": len(chunks), "word_count": len(chunk.split())},
                }
            )
    return chunks


def ingest_text(
    collection_name: str,
    texts: list[str],
    metadatas: list[dict] | None = None,
) -> int:
    all_chunks = []
    for i, text in enumerate(texts):
        chunks = chunk_text(text)
        for chunk in chunks:
            if metadatas and i < len(metadatas):
                chunk["metadata"].update(metadatas[i])
        all_chunks.extend(chunks)
    result = ingest_chunks(collection_name, all_chunks)
    if not result.get("success"):
        raise RuntimeError(result.get("error", "Ingestion failed"))
    return result["count"]


def ingest_chunks(
    collection_name: str,
    chunks: list[dict],
) -> dict:
    """Embed and store chunks into a Chroma collection."""
    if not is_available():
        return {"success": False, "error": "ChromaDB not available"}
    try:
        coll = get_or_create_collection(collection_name)
        texts = [c["text"] for c in chunks]
        metadatas = [c.get("metadata", {}) for c in chunks]
        ids = [f"{collection_name}-{i}" for i in range(len(chunks))]

        embeddings = embed_texts(texts)

        coll.add(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=texts)
        logger.info(f"Ingested {len(chunks)} chunks into '{collection_name}'")
        return {"success": True, "count": len(chunks)}
    except Exception as exc:
        logger.error(f"Ingestion error ({collection_name}): {exc}")
        return {"success": False, "error": str(exc)}
