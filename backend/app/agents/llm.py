"""LLM configuration — OpenRouter (or local Ollama) via LangChain.

Keeps the same provider as the TS backend for consistency.
"""

from functools import lru_cache
from langchain_openai import ChatOpenAI
from langchain.schema.language_model import BaseLanguageModel
from app.config import get_settings


@lru_cache
def get_chat_model(
    temperature: float = 0.3,
    max_tokens: int = 2000,
    response_format: str | None = "json",
) -> BaseLanguageModel:
    """Create a LangChain ChatOpenAI instance pointed at OpenRouter."""
    settings = get_settings()
    kwargs = dict(
        model=settings.llm_model,
        temperature=temperature,
        max_tokens=max_tokens,
        api_key=settings.openrouter_api_key,
        base_url=settings.openrouter_base_url,
    )
    if response_format == "json":
        kwargs["model_kwargs"] = {"response_format": {"type": "json_object"}}
    return ChatOpenAI(**kwargs)


def get_streaming_chat_model(temperature: float = 0.3) -> BaseLanguageModel:
    """Streaming variant for chat/orchestration endpoints."""
    return get_chat_model(temperature=temperature, response_format=None, max_tokens=4000)
