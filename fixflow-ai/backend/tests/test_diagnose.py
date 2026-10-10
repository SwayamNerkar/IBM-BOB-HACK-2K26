"""
Tests for /api/diagnose endpoint.
Runs in demo mode (no real AI calls needed).
Uses HTTPX AsyncClient with ASGI transport.
"""
from __future__ import annotations

import json
import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport

from backend.main import app
from backend.services.ai_provider import (
    ProviderTimeoutError,
    ProviderUnavailableError,
    ProviderRateLimitError,
    ProviderResponseError,
)

VALID_BODY = {
    "error_message": "TypeError: unsupported operand type(s) for +: 'int' and 'str'",
    "code_snippet": "age = 25\nresult = 'Age: ' + age\nprint(result)",
    "language": "Python",
}


async def post_diagnose(client: AsyncClient, body: dict) -> object:
    return await client.post(
        "/api/diagnose",
        content=json.dumps(body),
        headers={"Content-Type": "application/json"},
    )


# ---------------------------------------------------------------------------
# Happy path — demo mode
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_diagnose_success_demo_mode():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, VALID_BODY)
    assert response.status_code == 200
    data = response.json()
    assert "likely_cause" in data
    assert "explanation" in data
    assert "quiz_question" in data
    assert data["verification_status"] == "suggested_not_verified"
    assert data["demo_mode"] is True


@pytest.mark.anyio
async def test_diagnose_response_has_all_required_fields():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, VALID_BODY)
    data = response.json()
    required = [
        "likely_cause", "explanation", "evidence", "concept_name",
        "concept_explanation", "original_code", "fixed_code", "diff_summary",
        "test_suggestion", "quiz_question", "quiz_options", "quiz_answer",
        "uncertainty_notes", "verification_status",
    ]
    for field in required:
        assert field in data, f"Missing field: {field}"


# ---------------------------------------------------------------------------
# Validation — missing required fields
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_missing_error_message_returns_422():
    body = {"code_snippet": "print('hi')", "language": "Python"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, body)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_missing_code_snippet_returns_422():
    body = {"error_message": "NameError: name 'x' is not defined", "language": "Python"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, body)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_missing_language_returns_422():
    body = {"error_message": "err", "code_snippet": "x = 1"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, body)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Validation — field limits
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_oversized_error_message_returns_422():
    body = {**VALID_BODY, "error_message": "e" * 2001}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, body)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_oversized_code_snippet_returns_422():
    body = {**VALID_BODY, "code_snippet": "x" * 8001}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, body)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_oversized_stack_trace_returns_422():
    body = {**VALID_BODY, "stack_trace": "t" * 6001}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, body)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_oversized_request_body_returns_413():
    # Build a body that is > 32 KiB
    oversized = {**VALID_BODY, "code_snippet": "x" * 8000, "stack_trace": "t" * 6000}
    big_json = json.dumps(oversized)
    # Pad with extra field to push past 32 KiB
    oversized["expected_behavior"] = "e" * (33 * 1024)
    big_json = json.dumps(oversized)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/diagnose",
            content=big_json,
            headers={"Content-Type": "application/json"},
        )
    assert response.status_code in (413, 422)  # 413 from middleware, 422 from pydantic field limit


# ---------------------------------------------------------------------------
# Validation — unsupported language
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_unsupported_language_returns_422():
    body = {**VALID_BODY, "language": "COBOL"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, body)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Validation — wrong content type
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_wrong_content_type_returns_415():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/diagnose",
            content=json.dumps(VALID_BODY),
            headers={"Content-Type": "text/plain"},
        )
    assert response.status_code == 415


# ---------------------------------------------------------------------------
# Provider error handling
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_provider_timeout_returns_503():
    with patch(
        "backend.services.diagnosis_service.get_diagnosis",
        new_callable=AsyncMock,
        side_effect=ProviderTimeoutError("timeout"),
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await post_diagnose(client, VALID_BODY)
    assert response.status_code == 503


@pytest.mark.anyio
async def test_provider_unavailable_returns_503():
    with patch(
        "backend.services.diagnosis_service.get_diagnosis",
        new_callable=AsyncMock,
        side_effect=ProviderUnavailableError("down"),
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await post_diagnose(client, VALID_BODY)
    assert response.status_code == 503


@pytest.mark.anyio
async def test_provider_rate_limit_returns_429():
    with patch(
        "backend.services.diagnosis_service.get_diagnosis",
        new_callable=AsyncMock,
        side_effect=ProviderRateLimitError("rate limited"),
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await post_diagnose(client, VALID_BODY)
    assert response.status_code == 429


@pytest.mark.anyio
async def test_provider_bad_response_returns_502():
    with patch(
        "backend.services.diagnosis_service.get_diagnosis",
        new_callable=AsyncMock,
        side_effect=ProviderResponseError("bad json"),
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await post_diagnose(client, VALID_BODY)
    assert response.status_code == 502


# ---------------------------------------------------------------------------
# Security — no secret leakage in error responses
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_error_response_does_not_contain_internal_details():
    with patch(
        "backend.services.diagnosis_service.get_diagnosis",
        new_callable=AsyncMock,
        side_effect=Exception("internal db connection string: postgres://admin:password@host"),
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await post_diagnose(client, VALID_BODY)
    assert response.status_code == 500
    body = response.json()
    assert "postgres" not in body.get("detail", "").lower()
    assert "password" not in body.get("detail", "").lower()


# ---------------------------------------------------------------------------
# Schema consistency — quiz answer must be a valid option key
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_quiz_answer_in_options():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, VALID_BODY)
    data = response.json()
    option_keys = {opt["key"] for opt in data["quiz_options"]}
    assert data["quiz_answer"] in option_keys


# ---------------------------------------------------------------------------
# Security — verification_status is backend-controlled
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_verification_status_is_backend_controlled():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await post_diagnose(client, VALID_BODY)
    assert response.json()["verification_status"] == "suggested_not_verified"
