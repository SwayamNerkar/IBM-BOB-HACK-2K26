"""
Tests for the /health endpoint.
"""
import pytest
from httpx import AsyncClient, ASGITransport

from backend.main import app


@pytest.mark.anyio
async def test_health_returns_ok():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "fixflow-ai"
