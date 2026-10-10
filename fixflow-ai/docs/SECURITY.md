# Security — FixFlow AI

## Protected Assets
- AI API credentials
- User-submitted source code and error messages
- Application internals (stack traces, file paths, config values)

## Trust Boundaries
- **Frontend → Backend**: All input is untrusted. Backend re-validates everything.
- **Backend → AI provider**: All user content is redacted before sending.
- **AI response → Application**: Treated as untrusted data; validated against schema.

## Implemented Controls

| Control | Implementation |
|---|---|
| Secret management | API key in `.env` only; never sent to browser or logged |
| Input validation | Pydantic models with field-level length limits + language allowlist |
| Body size limit | 32 KiB enforced in middleware before buffering |
| Credential redaction | 8 regex patterns covering passwords, API keys, Bearer tokens, DB URLs, PEM keys |
| CORS | Explicit origin allowlist via `ALLOWED_ORIGINS` env var |
| Rate limiting | 20 req/60s per IP, in-memory |
| AI output validation | Pydantic schema applied to model response; malformed responses return 502 |
| Verification status | Always set by backend; stripped from AI output |
| XSS prevention | React text rendering only; no `dangerouslySetInnerHTML` anywhere |
| No code execution | Submitted code is never executed; only analyzed by AI |
| Error response safety | Internal exceptions caught; only safe messages returned to client |
| Content-Type enforcement | Non-JSON requests rejected with 415 |

## Redaction Limitations
Regex patterns detect common credential formats but cannot detect:
- Secrets stored in custom variable names not matching known patterns
- Encrypted or encoded secret values
- Secrets in unusual formats or dialects

Users must manually remove all sensitive data before submitting.

## Prompt Injection Limitations
The system prompt instructs the model to analyze code rather than follow embedded instructions. This reduces but does not eliminate prompt injection risk. A determined attacker may still be able to manipulate model output through crafted input. Mitigations:
- Model output is validated against a strict schema
- The model is not given tools, shell access, or application privileges
- `verification_status` is always backend-controlled

## Data Retention
Submitted code is not stored after the request completes. It exists only in process memory during the request lifecycle.

## Rate Limiting Limitation
The in-memory rate limiter resets when the process restarts. It is not distributed and provides no protection across multiple instances or after a restart.

## Test Evidence
- 12 redaction tests covering 8 patterns + benign code preservation
- 4 unsupported-language rejection tests
- 4 oversized field/body rejection tests
- 4 provider error mapping tests (timeout, unavailable, rate-limit, bad response)
- 2 internal error non-leakage tests
- 2 prompt-injection input handling tests
- 2 secret non-leakage tests
- 2 redaction-before-provider-call tests
- Full: 66 tests, all passing

## Residual Risks
- No authentication or authorization
- No persistent audit log
- No HTTPS enforcement (must be configured at deployment)
- No distributed rate limiting
- Demo mode deterministic responses could confuse users if not clearly labelled
