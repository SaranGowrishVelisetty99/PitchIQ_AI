"""ChromaDB client wrapper for PitchIQ.

Supports two modes:
  http        — connect to a running ChromaDB server (Docker or standalone)
  persistent  — embedded ChromaDB storing data on disk (no Docker needed)
  auto        — try HTTP, fall back to persistent if unavailable
"""

from typing import Optional
import chromadb
from chromadb.api import ClientAPI
from pathlib import Path
from loguru import logger
from app.config import get_settings
from app.rag.embeddings import LangChainEmbeddingFunction


_client: Optional[ClientAPI] = None
_available: Optional[bool] = None


def _get_chroma_url() -> str:
    return get_settings().chroma_db_url


def _create_http_client() -> ClientAPI:
    url = _get_chroma_url()
    logger.info(f"Connecting to ChromaDB via HTTP at {url}")
    return chromadb.HttpClient(
        host=url.split("://")[1].split(":")[0],
        port=int(url.split(":")[-1]),
    )


def _create_persistent_client() -> ClientAPI:
    persist_dir = get_settings().chroma_persist_path
    persist_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Starting embedded ChromaDB at {persist_dir}")
    return chromadb.PersistentClient(path=str(persist_dir))


def is_available() -> bool:
    global _available
    if _available is not None:
        return _available
    settings = get_settings()

    if settings.chroma_mode == "persistent":
        _available = True
        return True

    try:
        import httpx
        url = _get_chroma_url().rstrip("/") + "/heartbeat"
        resp = httpx.get(url, timeout=3)
        _available = resp.is_success
        if _available:
            logger.info(f"ChromaDB HTTP server available at {_get_chroma_url()}")
        else:
            logger.warning(f"ChromaDB HTTP returned status {resp.status_code}")
    except Exception as exc:
        if settings.chroma_mode == "http":
            logger.error(f"ChromaDB HTTP mode failed: {exc}")
            _available = False
        else:
            logger.warning(f"ChromaDB HTTP not available ({exc}), falling back to persistent mode")
            _available = True

    return _available


def get_client() -> ClientAPI:
    global _client
    if _client is not None:
        return _client

    settings = get_settings()

    if settings.chroma_mode == "persistent":
        _client = _create_persistent_client()
        return _client

    try:
        _client = _create_http_client()
    except Exception as exc:
        if settings.chroma_mode == "http":
            logger.error(f"HTTP ChromaDB connection failed: {exc}")
            raise
        logger.warning(f"HTTP ChromaDB unavailable ({exc}), using persistent")
        _client = _create_persistent_client()

    return _client


def get_or_create_collection(name: str):
    """Get or create a Chroma collection with the custom embedding function."""
    client = get_client()
    emb_fn = LangChainEmbeddingFunction()
    try:
        return client.get_or_create_collection(name=name, embedding_function=emb_fn)
    except Exception as exc:
        logger.error(f"Failed to get/create collection '{name}': {exc}")
        raise


def collection_stats(name: str) -> dict:
    """Return basic stats for a collection."""
    try:
        if not is_available():
            return {"name": name, "count": 0}
        coll = get_or_create_collection(name)
        count = coll.count()
        return {"name": name, "count": count}
    except Exception:
        return {"name": name, "count": 0}


def all_collections_stats() -> dict[str, dict]:
    """Return stats for every configured collection."""
    from app.config import get_settings
    return {
        name: collection_stats(name)
        for name in get_settings().chroma_collections
    }
