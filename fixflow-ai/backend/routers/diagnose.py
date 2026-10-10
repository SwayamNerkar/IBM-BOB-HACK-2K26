"""
/api/diagnose router.
"""
from __future__ import annotations

import json
import logging
import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request
from pydantic import ValidationError

from ..config import get_settings
from ..schemas.diagnosis import DiagnosisRequest, DiagnosisResponse
from ..services.diagnosis_service import run_diagnosis, DiagnosisError

logger = logging.getLogger(__name__)
router = APIRouter()

_rate_store: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(client_ip: str) -> None:
    settings = get_settings()
    now = time.monotonic()
    window = settings.rate_limit_window_seconds
    limit = settings.rate_limit_requests
    _rate_store[client_ip] = [t for t in _rate_store[client_ip] if now - t < window]
    if len(_rate_store[client_ip]) >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Maximum {limit} per {window}s.",
        )
    _rate_store[client_ip].append(now)


def _clear_rate_store() -> None:
    """For testing only — clears the in-memory rate store."""
    _rate_store.clear()


@router.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose(request: Request) -> DiagnosisResponse:
    settings = get_settings()

    # 1. Content-Type — checked before body parsing so we can return 415
    content_type = request.headers.get("content-type", "")
    if "application/json" not in content_type:
        raise HTTPException(status_code=415, detail="Content-Type must be application/json")

    # 2. Read raw body
    raw_body = await request.body()

    # 3. Body size limit
    if len(raw_body) > settings.max_body_bytes:
        raise HTTPException(status_code=413, detail="Request body exceeds 32 KiB maximum.")

    # 4. Parse + validate
    try:
        data = json.loads(raw_body)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail=f"Invalid JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise HTTPException(status_code=422, detail="Request body must be a JSON object")

    try:
        body = DiagnosisRequest(**data)
    except ValidationError as exc:
        # Serialize errors to plain strings — Pydantic v2 ctx may contain non-serializable objects
        safe_errors = [
            {"loc": e["loc"], "msg": e["msg"], "type": e["type"]}
            for e in exc.errors()
        ]
        raise HTTPException(status_code=422, detail=safe_errors) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # 5. Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    # 6. Diagnosis
    try:
        return await run_diagnosis(body)
    except DiagnosisError as exc:
        raise HTTPException(status_code=exc.http_status, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error during diagnosis")
        raise HTTPException(status_code=500, detail="An internal error occurred.") from exc
