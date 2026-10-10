"""
Diagnosis service — orchestrates redaction → AI call → response.
"""
from __future__ import annotations

import logging

from ..schemas.diagnosis import DiagnosisRequest, DiagnosisResponse
from ..services.redaction import redact_credentials
from ..services.ai_provider import (
    get_diagnosis,
    ProviderTimeoutError,
    ProviderUnavailableError,
    ProviderRateLimitError,
    ProviderResponseError,
)

logger = logging.getLogger(__name__)


class DiagnosisError(Exception):
    def __init__(self, message: str, http_status: int = 502):
        super().__init__(message)
        self.http_status = http_status


async def run_diagnosis(request: DiagnosisRequest) -> DiagnosisResponse:
    """
    1. Redact credentials from all user-supplied fields.
    2. Call the AI provider.
    3. Return a validated DiagnosisResponse.

    Never logs raw source code or user payloads.
    """
    # Build a redacted copy — do not mutate the original request object
    redacted = DiagnosisRequest(
        error_message=redact_credentials(request.error_message),
        stack_trace=redact_credentials(request.stack_trace) or None,
        code_snippet=redact_credentials(request.code_snippet),
        language=request.language,
        expected_behavior=redact_credentials(request.expected_behavior) or None,
    )

    logger.info(
        "Diagnosis requested",
        extra={"language": redacted.language},
    )

    try:
        return await get_diagnosis(redacted)
    except ProviderTimeoutError as exc:
        logger.warning("AI provider timeout: %s", exc)
        raise DiagnosisError("The AI service took too long to respond. Please try again.", 503) from exc
    except ProviderRateLimitError as exc:
        logger.warning("AI provider rate limit: %s", exc)
        raise DiagnosisError("Too many requests to the AI service. Please wait and try again.", 429) from exc
    except ProviderUnavailableError as exc:
        logger.warning("AI provider unavailable: %s", exc)
        raise DiagnosisError("The AI service is currently unavailable.", 503) from exc
    except ProviderResponseError as exc:
        logger.warning("AI provider bad response: %s", exc)
        raise DiagnosisError("The AI service returned an unexpected response.", 502) from exc
