"""
Credential redaction utility.

Detects and replaces common credential patterns before sending user content to any
external service.

LIMITATION: Regular-expression matching cannot detect every secret pattern. Secrets
stored in custom variable names, encrypted values, or unusual formats will not be
detected. Users must remove credentials before submitting code.
"""
from __future__ import annotations

import re

# Each pattern: (compiled_regex, replacement_string)
_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    # Password / secret assignments:  password = "abc123"
    (
        re.compile(
            r'(?i)(password|passwd|pwd|secret|api_secret|client_secret)\s*[=:]\s*["\']?([^\s\'";\n]{3,})["\']?',
            re.IGNORECASE,
        ),
        r"\1=[REDACTED]",
    ),
    # API key assignments:  api_key = "sk-..."  or  apiKey: "..."
    (
        re.compile(
            r'(?i)(api[_\-]?key|apikey|access[_\-]?key|auth[_\-]?key|private[_\-]?key)\s*[=:]\s*["\']?([^\s\'";\n]{4,})["\']?',
            re.IGNORECASE,
        ),
        r"\1=[REDACTED]",
    ),
    # Bearer tokens:  Bearer eyJ...  or  Authorization: Bearer abc
    (
        re.compile(
            r"(?i)(Bearer\s+)([A-Za-z0-9\-._~+/=]{10,})",
            re.IGNORECASE,
        ),
        r"Bearer [REDACTED]",
    ),
    # Authorization headers:  Authorization: Basic ...  / Token ...
    (
        re.compile(
            r"(?i)(Authorization\s*[=:]\s*(?:Basic|Token|Bearer|Digest)\s+)([^\s\n\"']{4,})",
            re.IGNORECASE,
        ),
        r"Authorization: [REDACTED]",
    ),
    # Database URLs with credentials:  postgres://user:pass@host
    (
        re.compile(
            r"(?i)((?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|sqlite)\:\/\/)([^@\s]+:[^@\s]+)(@)",
            re.IGNORECASE,
        ),
        r"\1[REDACTED]\3",
    ),
    # Generic access tokens:  access_token = "..."  / token: "..."
    (
        re.compile(
            r'(?i)(access[_\-]?token|auth[_\-]?token|refresh[_\-]?token|id[_\-]?token)\s*[=:]\s*["\']?([^\s\'";\n]{4,})["\']?',
            re.IGNORECASE,
        ),
        r"\1=[REDACTED]",
    ),
    # Private key material: BEGIN RSA PRIVATE KEY / BEGIN EC PRIVATE KEY etc.
    (
        re.compile(
            r"-----BEGIN[A-Z\s]*PRIVATE KEY-----.*?-----END[A-Z\s]*PRIVATE KEY-----",
            re.DOTALL | re.IGNORECASE,
        ),
        "[PRIVATE_KEY_REDACTED]",
    ),
    # AWS-style secret keys (40-char base64-looking strings after a known prefix)
    (
        re.compile(
            r"(?i)(aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[=:]\s*([A-Za-z0-9/+]{20,})",
        ),
        r"\1=[REDACTED]",
    ),
]


def redact_credentials(text: str | None) -> str:
    """
    Apply all redaction patterns to *text* and return the sanitized result.
    Returns an empty string for None input.
    """
    if text is None:
        return ""
    result = text
    for pattern, replacement in _PATTERNS:
        result = pattern.sub(replacement, result)
    return result
