# Architecture — FixFlow AI

## Request Flow

```
Browser (React)
    │  POST /api/diagnose  (JSON)
    ▼
FastAPI (Python)
    ├── Body size check (32 KiB)
    ├── Content-Type check
    ├── Pydantic validation (field limits + language allowlist)
    ├── Rate limiter (in-memory, per IP)
    ├── Credential redaction (regex, 8 patterns)
    ├── AI Provider Adapter
    │       ├── Demo Provider (deterministic, no network)
    │       ├── OpenAI adapter (chat/completions, json_object mode)
    │       └── Groq adapter  (same OpenAI-compatible format)
    ├── Response validation (Pydantic DiagnosisResponse schema)
    └── verification_status = "suggested_not_verified"  ← backend sets this
    │
    ▼
Browser renders 5 sections as plain text (no dangerouslySetInnerHTML)
```

## Component Responsibilities

| File | Responsibility |
|---|---|
| `backend/main.py` | App factory, CORS, body-size middleware, global exception handler |
| `backend/config.py` | Environment variable loading via `Settings` dataclass |
| `backend/routers/diagnose.py` | Route handler, content-type/rate-limit/body-size/validation |
| `backend/schemas/diagnosis.py` | Pydantic request + response models, quiz consistency validator |
| `backend/services/redaction.py` | Regex-based credential redaction utility |
| `backend/services/ai_provider.py` | Provider adapter, demo provider, structured AI output parsing |
| `backend/services/diagnosis_service.py` | Orchestrates redaction → AI call → error mapping |
| `frontend/src/services/api.ts` | Typed fetch wrapper, `ApiError` class |
| `frontend/src/hooks/useAnalyze.ts` | React state machine: idle / loading / success / error |
| `frontend/src/components/InputPanel.tsx` | Controlled form with char counters and client-side validation |
| `frontend/src/components/ResultsPanel.tsx` | Renders all 5 result sections |
| `frontend/src/components/DiffView.tsx` | Before/after code blocks with `highlight.js` |
| `frontend/src/components/QuizBlock.tsx` | Multiple-choice quiz with local state |
| `frontend/src/components/VerificationBlock.tsx` | Copyable test suggestion with "not verified" label |

## Verification Status

The field `verification_status` is always `"suggested_not_verified"`.
It is set in the backend's `DiagnosisResponse` schema default and stripped from any AI output before building the response.
The frontend renders this label on the Verification section so users always know the fix has not been automatically tested.

## AI Provider Integration

The provider adapter in `ai_provider.py`:
1. Reads `AI_PROVIDER`, `AI_API_KEY`, `AI_API_URL`, `AI_MODEL` from environment.
2. If `is_demo_mode` is true, returns the hardcoded `_DEMO_RESPONSE` immediately.
3. Otherwise calls the configured provider endpoint with a structured system prompt.
4. The system prompt explicitly instructs the model to analyze code, not follow instructions embedded in it.
5. The raw response is parsed as JSON and validated against `DiagnosisResponse` before returning.
6. Any `verification_status` or `demo_mode` fields from the AI are stripped.
