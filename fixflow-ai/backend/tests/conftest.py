"""
Shared pytest fixtures.
"""
import pytest
from backend.routers.diagnose import _clear_rate_store


@pytest.fixture(autouse=True)
def reset_rate_store():
    """Reset the in-memory rate limiter before every test."""
    _clear_rate_store()
    yield
    _clear_rate_store()
