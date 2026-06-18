"""Embedding function using sentence-transformers.

Replaces the previous JS hash-based embedding with proper semantic embeddings.
Falls back to a simple hash if sentence-transformers is unavailable.
"""

from typing import Optional
from functools import lru_cache
import numpy as np
from loguru import logger
from app.config import get_settings


# Lazy-loaded model so we don't download at import time
_model: Optional["SentenceTransformer"] = None


def _get_model():
    global _model
    if _model is not None:
        return _model
    try:
        from sentence_transformers import SentenceTransformer

        model_name = get_settings().embedding_model
        logger.info(f"Loading embedding model: {model_name}")
        _model = SentenceTransformer(model_name)
        logger.info(f"Embedding model loaded (dim={_model.get_embedding_dimension()})")
    except Exception as exc:
        logger.warning(f"Failed to load sentence-transformers: {exc}. Falling back to hash embedding.")
        _model = None
    return _model


def get_embedding_dimension() -> int:
    model = _get_model()
    if model is not None:
        return model.get_embedding_dimension()
    return 384  # MiniLM default


@lru_cache(maxsize=1024)
def _cached_encode(text: str) -> bytes:
    model = _get_model()
    if model is not None:
        emb = model.encode(text, normalize_embeddings=True)
        return emb.tobytes()
    return _hash_fallback(text).tobytes()


def _hash_fallback(text: str) -> np.ndarray:
    """Simple hash-based embedding fallback (same algorithm as JS)."""
    dim = 384
    vec = np.zeros(dim, dtype=np.float32)
    for i, ch in enumerate(text):
        vec[i % dim] += ord(ch) * 0.01
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec


def embed_text(text: str) -> list[float]:
    """Embed a single text string into a float vector."""
    model = _get_model()
    if model is not None:
        emb = model.encode(text, normalize_embeddings=True)
        return emb.tolist()
    return _hash_fallback(text).tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of text strings."""
    model = _get_model()
    if model is not None:
        embs = model.encode(texts, normalize_embeddings=True)
        return [e.tolist() for e in embs]
    return [embed_text(t) for t in texts]


class LangChainEmbeddingFunction:
    """Wrapper for LangChain's Chroma vector store."""

    def __init__(self):
        self.dim = get_embedding_dimension()

    def name(self) -> str:
        return "sentence-transformers/all-MiniLM-L6-v2"

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return embed_texts(texts)

    def embed_query(self, text: str) -> list[float]:
        return embed_text(text)

    def __call__(self, input: list[str]) -> list[list[float]]:
        return embed_texts(input)
