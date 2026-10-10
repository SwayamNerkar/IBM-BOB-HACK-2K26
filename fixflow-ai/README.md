# FixFlow AI 🔍

**From Error to Understanding. From Understanding to Fix.**

An AI-powered debugging and learning copilot built for the IBM SkillsBuild Hackathon 2K26.

---

## What it does

FixFlow AI takes a programming error and code snippet, then returns:

| # | Section | What you get |
|---|---|---|
| 1 | **Diagnosis** | Likely root cause with supporting evidence |
| 2 | **Understand the error** | Plain-English concept explanation |
| 3 | **Suggested fix** | Side-by-side before/after code diff |
| 4 | **Verify the solution** | Copyable test code to run yourself |
| 5 | **Check your understanding** | Multiple-choice quiz on the concept |

---

## Demo

![FixFlow AI Screenshot](docs/screenshot.png)

Paste this into the form to try it instantly (no API key needed in demo mode):

```
Language:      Python
Error message: TypeError: unsupported operand type(s) for +: 'int' and 'str'
Stack trace:   Traceback (most recent call last):
                 File "app.py", line 3, in <module>
                   result = "Age: " + age
               TypeError: can only concatenate str (not "int") to str
Code snippet:  age = 25
               result = "Age: " + age
               print(result)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Backend | Python 3.9 + FastAPI + Pydantic v2 |
| AI | Groq (Llama 3) or OpenAI — configurable |
| HTTP client | HTTPX (async) |
| Tests | Pytest + anyio — 120 tests |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+

### 1. Clone
```bash
git clone https://github.com/SwayamNerkar/IBM-BOB-HACK-2K26.git
cd IBM-BOB-HACK-2K26/fixflow-ai
```

### 2. Backend setup
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r backend/requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env` — for demo mode (no key needed):
```
AI_PROVIDER=demo
AI_API_KEY=
AI_API_URL=
AI_MODEL=
ALLOWED_ORIGINS=http://localhost:5173
APP_ENV=development
```

For live Groq AI:
```
AI_PROVIDER=groq
AI_API_KEY=your_groq_key_here
AI_API_URL=https://api.groq.com/openai/v1/chat/completions
AI_MODEL=llama3-8b-8192
ALLOWED_ORIGINS=http://localhost:5173
APP_ENV=development
```

### 4. Start backend
```bash
uvicorn backend.main:app --reload --port 8000
```

### 5. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 6. Open
```
http://localhost:5173
```

The header shows **🟡 Demo mode** or **🟢 Live AI** depending on your `.env`.

---

## Run Tests

```bash
# From fixflow-ai/
python -m pytest backend/tests/ -v
```

Expected: **120 passed**

Test coverage includes:
- Input validation (field limits, language allowlist, empty fields)
- Body size enforcement (32 KiB limit)
- Credential redaction (passwords, API keys, Bearer tokens, DB URLs, PEM keys)
- Redacted data verified to reach mocked provider
- Provider timeout, rate limit, and failure handling
- Safe error responses (no key/trace leakage)
- Prompt-injection handling
- SSRF protection on AI provider URL
- `verification_status` always backend-controlled

---

## Project Structure

```
fixflow-ai/
├── frontend/
│   └── src/
│       ├── components/     # Header, InputPanel, ResultsPanel, DiffView, QuizBlock…
│       ├── hooks/          # useAnalyze (state machine)
│       ├── services/       # api.ts (typed fetch)
│       └── types/          # diagnosis.ts (shared types)
├── backend/
│   ├── main.py             # FastAPI app, CORS, body-size middleware
│   ├── config.py           # Settings + SSRF-safe URL validation
│   ├── routers/            # diagnose.py (POST /api/diagnose)
│   ├── schemas/            # Pydantic request + response models
│   ├── services/           # ai_provider, diagnosis_service, redaction
│   └── tests/              # 120 automated tests
├── demo/
│   └── demo_input.json     # Ready-to-paste demo error
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   └── PRESENTATION.md
├── .env.example
└── README.md
```

---

## Security Controls

- **No AI keys in frontend** — all credentials are server-side only
- **Credential redaction** — 8 regex patterns strip keys/passwords before AI call
- **32 KiB body limit** — enforced before unbounded buffering
- **SSRF protection** — `AI_API_URL` validated against HTTPS + known provider allowlist
- **CORS** — explicit origin allowlist only
- **Rate limiting** — 20 req/60s per IP (in-memory)
- **No code execution** — submitted code is analyzed, never run
- **Schema validation** — AI response validated against Pydantic model; backend controls `verification_status`
- **XSS prevention** — AI content rendered as React text nodes, never HTML

---

## AI Providers

| Provider | `AI_PROVIDER` | `AI_API_URL` | Recommended model |
|---|---|---|---|
| Groq (free tier) | `groq` | `https://api.groq.com/openai/v1/chat/completions` | `llama3-8b-8192` |
| OpenAI | `openai` | `https://api.openai.com/v1/chat/completions` | `gpt-4o-mini` |
| Demo (no key) | `demo` | *(leave empty)* | *(leave empty)* |

---

## Supported Languages

Python · JavaScript · TypeScript · Java · C++ · Other

---

## Known Limitations

- In-memory rate limiter resets on process restart
- Regex redaction cannot detect every secret pattern
- System prompt separation reduces but does not eliminate prompt injection risk
- No authentication or user sessions
- No persistent storage

---

## Hackathon

**Event:** IBM SkillsBuild Hackathon 2K26  
**Problem Statement 01:** Build an AI solution that helps people learn faster, work smarter, or become more productive while building or understanding technology.

**Our answer:** A developer who uses FixFlow AI doesn't just get a fix — they understand *why* the error happened and learn the concept behind it, so they don't repeat the same mistake.

---

## License

MIT
