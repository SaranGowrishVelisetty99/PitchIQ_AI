"""Main FastAPI application — ties together all routes, middleware, and config."""

import time
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from app.config import get_settings
from app.api.health import router as health_router
from app.api.agents import router as agents_router
from app.api.orchestrate import router as orchestrate_router
from app.api.chat import router as chat_router
from app.api.tactical import router as tactical_router
from app.api.ingest import router as ingest_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    logger.info(f"Starting PitchIQ AI backend — version={settings.app_version}")
    logger.info(f"  CORS origins={settings.cors_origins}")
    logger.info(f"  ChromaDB URL={settings.chroma_db_url}")
    logger.info(f"  LLM model={settings.llm_model}")

    # Warm embedding model in background thread — don't block server start
    def _warm_embeddings():
        t0 = time.perf_counter()
        try:
            from app.rag.embeddings import embed_text
            embed_text("warmup")
            logger.info(f"Embedding model warmed in {time.perf_counter()-t0:.1f}s")
        except Exception as exc:
            logger.warning(f"Embedding warmup failed: {exc}")

    threading.Thread(target=_warm_embeddings, daemon=True).start()

    t0 = time.perf_counter()
    try:
        from app.rag.chroma_client import is_available
        avail = is_available()
        logger.info(f"ChromaDB available={avail} ({time.perf_counter()-t0:.1f}s)")
    except Exception as exc:
        logger.warning(f"ChromaDB check failed: {exc}")

    yield
    logger.info("Shutting down PitchIQ AI backend")


app = FastAPI(
    title="PitchIQ AI Backend",
    version=settings.app_version,
    description="Multi-agent explainable soccer intelligence platform",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────────────────
app.include_router(health_router)
app.include_router(agents_router)
app.include_router(orchestrate_router)
app.include_router(chat_router)
app.include_router(tactical_router)
app.include_router(ingest_router)


@app.get("/")
async def root():
    return {
        "name": "PitchIQ AI Backend",
        "version": app.version,
        "docs": "/docs",
        "health": "/health",
    }
