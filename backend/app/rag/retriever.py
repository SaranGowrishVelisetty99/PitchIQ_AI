"""LangChain-based retrievers for PitchIQ RAG.

Provides collection-aware retrieval with fallback when ChromaDB is unavailable.
Uses the shared ChromaDB client from chroma_client.py (supports HTTP + embedded).
"""

from typing import Optional
from loguru import logger
from langchain_chroma import Chroma
from langchain.schema import Document
from app.config import get_settings
from app.rag.embeddings import LangChainEmbeddingFunction
from app.rag.chroma_client import get_client as _get_chroma_client
from app.schemas.base import SourceCitation


def _get_vector_store(collection_name: str) -> Optional[Chroma]:
    """Get a LangChain Chroma vector store for the given collection."""
    try:
        embedding_fn = LangChainEmbeddingFunction()
        chroma_client = _get_chroma_client()
        vector_store = Chroma(
            collection_name=collection_name,
            embedding_function=embedding_fn,
            client=chroma_client,
        )
        return vector_store
    except Exception as exc:
        logger.warning(f"Could not connect to Chroma for collection '{collection_name}': {exc}")
        return None


def retrieve_context(
    query: str,
    collection_name: str,
    top_k: Optional[int] = None,
) -> tuple[list[str], list[SourceCitation]]:
    """Retrieve relevant context documents from a Chroma collection.

    Returns (documents, citations).
    """
    k = top_k or get_settings().rag_top_k
    try:
        vs = _get_vector_store(collection_name)
        if vs is None:
            return [], []

        docs_with_scores = vs.similarity_search_with_relevance_scores(query, k=k)

        documents = []
        citations = []
        for doc, score in docs_with_scores:
            documents.append(doc.page_content)
            citations.append(
                SourceCitation(
                    title=doc.metadata.get("title", "Knowledge Base"),
                    section=doc.metadata.get("section", ""),
                    similarity=float(score) if score is not None else 0.0,
                    excerpt=doc.page_content[:300],
                )
            )
        return documents, citations
    except Exception as exc:
        logger.error(f"Retrieval error ({collection_name}): {exc}")
        return [], []


def retrieve_multi_collection(
    query: str,
    collections: list[str],
    top_k: int = 3,
) -> list[dict]:
    """Retrieve from multiple collections, returning combined results."""
    results = []
    for name in collections:
        docs, _ = retrieve_context(query, name, top_k)
        if docs:
            results.append({"collection": name, "documents": docs})
    return results
