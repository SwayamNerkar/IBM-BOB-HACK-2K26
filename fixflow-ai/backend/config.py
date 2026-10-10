"""
Application configuration — loads from environment variables.
Real credentials must be in a local .env file that is never committed.
"""
from __future__ import annotations

import os
from functools import lru_cache
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv()

# Allowed URL prefixes for the AI provider endpoint.
# Prevents arbitrary SSRF by restricting outbound calls to known HTTPS endpoints.
_ALLOWED_AI_URL_PREFIXES = (
    "https://api.openai.com/",
    "https://api.groq.com/",
)


def _validate_ai_url(url: str) -> str:
    """
    Validate that the AI_API_URL is an HTTPS URL pointing to a known provider.
    Raises ValueError if the URL is unsafe or points to an unexpected host.
    Empty string is allowed (means demo mode).
    """
    if not url:
        return url
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise ValueError(
            f"AI_API_URL must use HTTPS. Got scheme: '{parsed.scheme}'"
        )
    if not any(url.startswith(prefix) for prefix in _ALLOWED_AI_URL_PREFIXES):
        allowed = ", ".join(_ALLOWED_AI_URL_PREFIXES)
        raise ValueError(
            f"AI_API_URL '{url}' is not in the allowed provider list. "
            f"Allowed prefixes: {allowed}"
        )
    return url


class Settings:
    # AI provider
    ai_provider: str = os.getenv("AI_PROVIDER", "demo")
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    ai_api_url: str = _validate_ai_url(os.getenv("AI_API_URL", ""))
    ai_model: str = os.getenv("AI_MODEL", "")

    # App
    app_env: str = os.getenv("APP_ENV", "development")
    allowed_origins: list[str] = [
        o.strip()
        for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
        if o.strip()
    ]

    # Limits
    max_body_bytes: int = 32 * 1024  # 32 KiB
    ai_timeout_seconds: float = 30.0

    # Rate limiting (in-memory, per-process only — not distributed)
    rate_limit_requests: int = 20
    rate_limit_window_seconds: int = 60

    @property
    def is_demo_mode(self) -> bool:
        """True when no real API key is configured or provider is explicitly 'demo'."""
        return self.ai_provider.lower() == "demo" or not self.ai_api_key.strip()

    @property
    def debug(self) -> bool:
        return self.app_env.lower() == "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
