# Presentation Guide — FixFlow AI

## 30-Second Pitch

"Most developers copy-paste errors into ChatGPT and get code back. They apply it, it works, but they still don't know *why* it failed or how to avoid it next time. FixFlow AI changes that. You paste an error and code, and instead of just getting a fix, you get the root cause, a plain-English explanation, a before-and-after diff, suggested tests, and a quiz to reinforce the concept. One workflow — from error to understanding to fix."

---

## 1-Minute Technical Explanation

FixFlow AI is a React + TypeScript frontend calling a Python FastAPI backend. The backend validates all input with Pydantic, redacts credentials from submitted code using regex, then calls a real AI API — OpenAI or Groq — with a structured system prompt requesting JSON output. The response is validated against a strict schema before it reaches the browser. The frontend renders all five sections as plain text — no HTML injection possible. Security is built in from day one: API keys never leave the server, submitted code is never executed, and every result is clearly labelled as an AI proposal requiring human verification.

---

## 3-Minute Live Demo Script

1. **(0:00)** Open the app. Show the clean input form with the four fields and privacy notice.
2. **(0:20)** Paste from `demo/demo_input.json` — a Python `TypeError` from adding an int to a string.
3. **(0:30)** Click Analyze. Show the loading state.
4. **(0:45)** Scroll to **Diagnosis** — point out the red "Likely Cause" block and explanation.
5. **(1:00)** Show **Learn the Concept** — "Type Coercion and String Formatting".
6. **(1:15)** Show **Suggested Fix** — the side-by-side diff. Point out the "AI Proposal" badge.
7. **(1:35)** Show **Verification** — the suggested pytest code. Read the "run these yourself" notice out loud.
8. **(1:55)** Show the **Quiz** — answer a question wrong, then correct. Show the feedback.
9. **(2:15)** Switch to the terminal. Run `pytest backend/tests/ -v`. Show 66 tests passing.
10. **(2:35)** Explain: "All AI keys are backend-only, code is never executed, and credentials in submitted code are redacted before it reaches the AI."
11. **(2:50)** Show the DEMO MODE banner — explain what it means and how to enable a real key.

---

## Technology Explanations

| Technology | Simple explanation |
|---|---|
| React + TypeScript | The UI framework. TypeScript catches type errors before they reach users. |
| Vite | Fast frontend build tool — hot reload during development, optimized bundles for production. |
| Tailwind CSS | Utility-first CSS framework — consistent spacing and colors without a large CSS file. |
| FastAPI | Python web framework. Built-in validation via Pydantic, async request handling. |
| Pydantic | Data validation library — defines the exact shape and limits of every API request and response. |
| HTTPX | Async HTTP client used by the backend to call the AI provider. |
| Pytest + anyio | Python test runner with async support — 66 automated tests. |
| highlight.js | Syntax highlighting library — renders code as colored text in the browser. |

---

## Likely Judge Questions

**Q: Is this just a ChatGPT wrapper?**
A: No. The AI is one component in a structured pipeline. The backend validates input, redacts credentials, enforces strict field limits, validates the AI response schema, and the frontend breaks the output into five distinct learning sections. A generic chatbot has none of that structure.

**Q: Is the AI output reliable?**
A: Every result is labelled "AI Proposal — Not Verified." The verification section provides generated tests for the user to run. We never claim the fix is correct without the user running the tests themselves.

**Q: How do you handle security?**
A: API keys stay server-side. User input has 32 KiB body limit and field-level character limits. Credential patterns are redacted before the AI call. Rate limiting is in place. Code is never executed. All AI output is rendered as plain text.

**Q: What happens without an API key?**
A: Demo mode activates automatically, returning a deterministic response clearly labelled "DEMO MODE." The demo banner is visible in the header and in the results panel.

**Q: Can a user inject prompt instructions into the code field?**
A: The system prompt instructs the model to analyze code as data, not follow instructions within it. AI output is validated against a strict schema. This reduces but does not eliminate the risk — we document this honestly in SECURITY.md.

**Q: Does this store user code?**
A: No. Code exists only in process memory during the request. There is no database, no logging of code snippets.

**Q: What AI providers do you support?**
A: OpenAI (gpt-4o-mini, gpt-4o) and Groq (llama3, mixtral) out of the box. The adapter is isolated so adding a new provider requires only one new function.

**Q: How would you scale this for production?**
A: Add authentication, replace in-memory rate limiting with Redis, serve over HTTPS, add request logging with PII filtering, and consider streaming responses for large analyses.

**Q: Why FastAPI over Django or Flask?**
A: FastAPI gives async support, automatic OpenAPI docs, and native Pydantic integration — ideal for a JSON API with strict input validation.

**Q: What would you add with more time?**
A: Language-specific static analysis, streaming AI responses, diff highlighting character-by-character, user history with localStorage, and CI pipeline.

**Q: What is the biggest known limitation?**
A: The in-memory rate limiter and the regex redaction. Both are documented honestly. We don't claim either provides complete protection.

**Q: How does this help developers learn, specifically?**
A: It always explains *why* — the concept behind the error — not just what to change. The quiz reinforces the concept immediately after the explanation. A developer who uses FixFlow repeatedly builds understanding, not just a collection of copy-pasted fixes.

---

## Feature Status

| Feature | Status |
|---|---|
| Input form with validation | ✅ Complete |
| Diagnosis section | ✅ Complete |
| Concept explanation | ✅ Complete |
| Suggested fix with diff | ✅ Complete |
| Verification block | ✅ Complete |
| Learning quiz | ✅ Complete |
| Demo mode | ✅ Complete |
| Credential redaction | ✅ Complete |
| 66 automated tests | ✅ Complete |
| OpenAI + Groq adapters | ✅ Complete |
| Responsive layout | ✅ Complete |
| Authentication | ❌ Not built |
| Persistent history | ❌ Not built |
| Streaming responses | ❌ Not built |
| Character-level diff highlighting | ❌ Not built |
