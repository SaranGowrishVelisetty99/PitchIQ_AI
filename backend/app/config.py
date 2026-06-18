from pydantic_settings import BaseSettings
from pathlib import Path
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "PitchIQ Backend"
    app_version: str = "0.1.0"
    debug: bool = False
    log_level: str = "INFO"

    # LLM Provider
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    llm_model: str = "nvidia/nemotron-3-super-120b-a12b:free"

    # Local alternative
    ollama_base_url: str = "http://localhost:11434"

    # RAG / Vector store
    chroma_db_url: str = "http://localhost:8000"
    chroma_mode: str = "auto"  # "http" | "persistent" | "auto" (try http, fallback to persistent)
    chroma_persist_dir: str = ""
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    # Chroma collection names (must match existing TS project)
    chroma_fifa_laws: str = "fifa-laws"
    chroma_tactical: str = "tactical-knowledge"
    chroma_coaching: str = "coaching-documents"
    chroma_referee: str = "referee-guidelines"
    chroma_formation: str = "formation-patterns"
    chroma_momentum: str = "momentum-patterns"

    # Chunking
    chunk_size: int = 500
    chunk_overlap: int = 100

    # RAG top-K
    rag_top_k: int = 5

    # CORS — allow the Next.js frontend
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = {"env_file": [".env", "backend/.env"], "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def chroma_collections(self) -> list[str]:
        return [
            self.chroma_fifa_laws,
            self.chroma_tactical,
            self.chroma_coaching,
            self.chroma_referee,
            self.chroma_formation,
            self.chroma_momentum,
        ]

    @property
    def data_dir(self) -> Path:
        return Path(__file__).resolve().parent.parent / "data"

    @property
    def chroma_persist_path(self) -> Path:
        if self.chroma_persist_dir:
            return Path(self.chroma_persist_dir)
        return self.data_dir / "chroma"


@lru_cache
def get_settings() -> Settings:
    return Settings()
