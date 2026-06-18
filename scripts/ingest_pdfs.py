"""
PitchIQ AI - PDF Ingestion Script
===================================
Processes all 6 PDFs from data/pdfs/, chunks them, creates embeddings with
sentence-transformers, and stores them in a persistent ChromaDB vector store.

Also exports a JSON knowledge base for TypeScript fallback.

Usage:
    python scripts/ingest_pdfs.py

Prerequisites:
    pip install pymupdf chromadb sentence-transformers numpy
"""

import json
import os
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("ERROR: sentence-transformers not installed. Run: pip install sentence-transformers")
    sys.exit(1)

try:
    import chromadb
except ImportError:
    print("ERROR: chromadb not installed. Run: pip install chromadb")
    sys.exit(1)

# --- Paths ---
REPO_ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = REPO_ROOT / "data" / "pdfs"
CHROMA_DIR = REPO_ROOT / "backend" / "data" / "chroma"
KB_JSON_PATH = REPO_ROOT / "data" / "knowledge-base.json"

# Each PDF maps to a Chroma collection
PDF_COLLECTIONS: list[dict] = [
    {"filename": "fifa-laws-of-the-game.pdf",   "collection": "fifa-laws",        "title": "FIFA Laws of the Game"},
    {"filename": "tactical-analysis-guide.pdf",  "collection": "tactical-knowledge","title": "Tactical Analysis Guide"},
    {"filename": "soccer-coaching-manual.pdf",   "collection": "coaching-documents","title": "Soccer Coaching Manual"},
    {"filename": "referee-guidelines.pdf",       "collection": "referee-guidelines","title": "Referee Guidelines"},
    {"filename": "formation-patterns..pdf",       "collection": "formation-patterns","title": "Formation Patterns"},
    {"filename": "momentum-patterns.pdf",        "collection": "momentum-patterns","title": "Momentum Patterns"},
]

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100


# --- Text Extraction ---
def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract all text from a PDF using PyMuPDF."""
    doc = fitz.open(str(pdf_path))
    pages = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        if text.strip():
            pages.append(text)
    doc.close()
    return "\n\n".join(pages)


def clean_text(text: str) -> str:
    """Normalize whitespace and remove excessive blank lines."""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


# --- Chunking ---
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[dict]:
    """Split text into overlapping word-level chunks."""
    words = text.split()
    chunks = []
    step = chunk_size - overlap
    for i in range(0, len(words), step):
        chunk_words = words[i:i + chunk_size]
        if not chunk_words:
            continue
        chunk = " ".join(chunk_words)
        chunks.append({
            "text": chunk,
            "metadata": {
                "index": len(chunks),
                "word_count": len(chunk_words),
            }
        })
    return chunks


# --- Embedding ---
class EmbeddingFunction:
    """ChromaDB-compatible embedding function using sentence-transformers."""
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        print(f"  Loading embedding model: {model_name} ...")
        self.model = SentenceTransformer(model_name)
        self.dim = self.model.get_embedding_dimension()
        self._name = model_name
        print(f"  Model loaded (dim={self.dim})")

    def __call__(self, input: list[str]) -> list[list[float]]:
        embs = self.model.encode(input, normalize_embeddings=True)
        return [e.tolist() for e in embs]

    def name(self) -> str:
        return self._name


# --- ChromaDB Storage ---
def process_all_pdfs() -> dict[str, list[dict]]:
    """Process all PDFs and return {collection_name: [chunks]}."""
    all_collections: dict[str, list[dict]] = {}

    for cfg in PDF_COLLECTIONS:
        pdf_path = PDF_DIR / cfg["filename"]
        if not pdf_path.exists():
            print(f"  WARNING: PDF not found: {pdf_path.name}, skipping.")
            continue

        print(f"\n  [{cfg['filename']}] -> {cfg['collection']}")
        print(f"  Extracting text...")
        raw_text = extract_text_from_pdf(pdf_path)
        text = clean_text(raw_text)
        word_count = len(text.split())
        print(f"  Extracted {word_count} words")

        print(f"  Chunking...")
        chunks = chunk_text(text)
        print(f"  Created {len(chunks)} chunks")

        # Add source metadata to each chunk
        for chunk in chunks:
            chunk["metadata"]["source"] = cfg["title"]
            chunk["metadata"]["filename"] = cfg["filename"]

        all_collections[cfg["collection"]] = chunks

    return all_collections


def store_in_chromadb(all_collections: dict[str, list[dict]]):
    """Store all chunks in persistent ChromaDB."""
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    emb_fn = EmbeddingFunction()

    total_stored = 0
    for collection_name, chunks in all_collections.items():
        print(f"\n  Storing {len(chunks)} chunks -> '{collection_name}' ...")

        # Get or create collection
        collection = client.get_or_create_collection(
            name=collection_name,
            embedding_function=emb_fn,
        )

        # Prepare data
        ids = [f"{collection_name}-{i}" for i in range(len(chunks))]
        texts = [c["text"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]

        # Batch to avoid memory issues
        batch_size = 100
        for batch_start in range(0, len(texts), batch_size):
            batch_end = min(batch_start + batch_size, len(texts))
            batch_ids = ids[batch_start:batch_end]
            batch_texts = texts[batch_start:batch_end]
            batch_metadatas = metadatas[batch_start:batch_end]
            batch_embeddings = emb_fn(batch_texts)

            collection.add(
                ids=batch_ids,
                embeddings=batch_embeddings,
                metadatas=batch_metadatas,
                documents=batch_texts,
            )

        count = collection.count()
        total_stored += count
        print(f"  Collection '{collection_name}' now has {count} documents")

    print(f"\n  Total stored across all collections: {total_stored} chunks")


def export_knowledge_base_json(all_collections: dict[str, list[dict]]):
    """Export a JSON knowledge base for TypeScript fallback."""
    kb = {}
    for collection_name, chunks in all_collections.items():
        kb[collection_name] = [
            {
                "text": c["text"],
                "metadata": c["metadata"],
            }
            for c in chunks
        ]

    KB_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(KB_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(kb, f, ensure_ascii=False, indent=1)

    total_chunks = sum(len(v) for v in kb.values())
    print(f"\nExported {total_chunks} chunks to {KB_JSON_PATH}")


# --- Main ---
def main():
    print("=" * 60)
    print("  PitchIQ AI - Knowledge Base Ingestion")
    print("=" * 60)
    print(f"\nPDF directory: {PDF_DIR}")
    print(f"ChromaDB directory: {CHROMA_DIR}")
    print()

    if not PDF_DIR.exists():
        print(f"ERROR: PDF directory not found at {PDF_DIR}")
        sys.exit(1)

    # Step 1: Process all PDFs
    print("Step 1: Extracting text from PDFs...")
    all_collections = process_all_pdfs()

    if not all_collections:
        print("\nNo PDFs were processed. Check data/pdfs/ directory.")
        sys.exit(1)

    # Step 2: Store in ChromaDB
    print("\nStep 2: Storing in ChromaDB (persistent mode)...")
    store_in_chromadb(all_collections)

    # Step 3: Export JSON fallback for TypeScript
    print("\nStep 3: Exporting JSON knowledge base for TypeScript...")
    export_knowledge_base_json(all_collections)

    print("\n" + "=" * 60)
    print("  Ingestion complete!")
    print("=" * 60)
    print(f"\n  ChromaDB data: {CHROMA_DIR}")
    print(f"  JSON fallback: {KB_JSON_PATH}")
    print(f"\n  Collections created:")
    for cfg in PDF_COLLECTIONS:
        print(f"    - {cfg['collection']} ({cfg['title']})")
    print(f"\n  Now restart your backend to use the updated knowledge base:")
    print(f"    cd backend && python -m uvicorn app.main:app --reload")
    print(f"\n  Or for TypeScript, the JSON fallback will be loaded automatically.")


if __name__ == "__main__":
    main()
