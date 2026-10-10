"""
Shared pytest fixtures.

Forces demo mode during tests so no real AI provider calls are made.
This means tests run fast, free, and deterministically.
"""
import os
import pytest

# Override env before any app module is imported by tests
os.environ.setdefault("AI_PROVIDER", "demo")
os.environ["AI_PROVIDER"] = "demo"  # force — tests must never call real AI

from backend.routers.diagnose import _clear_rate_store
from backend.config import get_settings


@pytest.fixture(autouse=True)
def reset_rate_store():
    """Reset the in-memory rate limiter before every test."""
    _clear_rate_store()
    yield
    _clear_rate_store()


@pytest.fixture(autouse=True)
def force_demo_mode(monkeypatch):
    """
    Ensure the app uses demo mode during every test.
    Prevents real API calls and rate limit bleed.
    """
    monkeypatch.setenv("AI_PROVIDER", "demo")
    monkeypatch.setenv("AI_API_KEY", "")
    # Bust the lru_cache so settings re-read the patched env
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
