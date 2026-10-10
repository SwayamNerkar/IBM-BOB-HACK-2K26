# FixFlow AI

**From Error to Understanding. From Understanding to Fix.**

An AI-powered debugging and learning copilot that helps developers understand programming errors, identify root causes, see proposed fixes, and learn the underlying concept — all in one workflow.

---

## Features

| Feature | Description |
|---|---|
| Smart Diagnosis | AI identifies likely root cause with supporting evidence |
| Concept Explanation | Explains the underlying programming concept clearly |
| Suggested Fix | Side-by-side before/after code comparison |
| Verification | Generated tests with "run it yourself" instructions |
| Learning Quiz | Multiple-choice question to reinforce understanding |
| Credential Redaction | Strips API keys, passwords, tokens before any AI call |
| Demo Mode | Works fully offline with deterministic responses |

---

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Python + FastAPI + Pydantic + HTTPX
- **AI**: OpenAI or Groq (configurable); deterministic demo mode when no key present
- **Tests**: Pytest + anyio (66 tests, all passing)

---

## Prerequisites

- Node.js 18+
- Python 3.9+

---

## Setup

### 1. Clone and configure

```bash
cd fixflow-ai
cp .env.example .env        # then edit .env with your AI key if you have one
```

### 2. Backend

```bash
cd fixflow-ai
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd fixflow-ai/frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AI_PROVIDER` | Yes | `openai`, `groq`, or `demo` |
| `AI_API_KEY` | For live mode | Your provider API key |
| `AI_API_URL` | For live mode | Provider endpoint URL |
| `AI_MODEL` | For live mode | Model name |
| `ALLOWED_ORIGINS` | Optional | Comma-separated CORS origins (default: `http://localhost:5173`) |
| `APP_ENV` | Optional | `development` or `production` |

**OpenAI example:**
```
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
```

**Groq example:**
```
AI_PROVIDER=groq
AI_API_KEY=gsk_...
AI_API_URL=https://api.groq.com/openai/v1/chat/completions
AI_MODEL=llama3-8b-8192
```

**Demo mode (no key needed):**
```
AI_PROVIDER=demo
```

---

## Running Tests

```bash
cd fixflow-ai
.venv\Scripts\activate   # or source .venv/bin/activate
python -m pytest backend/tests/ -v
```

Expected: **66 passed**

---

## Demo

Use the sample in `demo/demo_input.json`:

1. Start the backend and frontend
2. Paste from `demo/demo_input.json` into the form
3. Click **Analyze**
4. Walk through the 5 result sections

---

## Security Controls

- All AI API keys are server-side only — never sent to the browser
- Credential patterns redacted from all user input before AI call
- Request body capped at 32 KiB
- Field-level character limits enforced server-side
- Rate limiting: 20 req/60s per IP (in-memory, single-process)
- CORS restricted to configured origins
- AI output rendered as text — no `dangerouslySetInnerHTML`
- Verification status always set by backend, not the AI model
- No code execution of submitted snippets

---

## Known Limitations

- In-memory rate limiter resets on process restart; not suitable for distributed deployment
- Regex redaction cannot detect every secret pattern
- System prompts reduce but do not eliminate prompt injection risk
- Demo mode responses are static and do not reflect live AI analysis
- No authentication or multi-user session management
