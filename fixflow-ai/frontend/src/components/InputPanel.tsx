import { useState, type FormEvent } from 'react';
import type { DiagnosisRequest } from '../types/diagnosis';
import { SUPPORTED_LANGUAGES, FIELD_LIMITS, type SupportedLanguage } from '../types/diagnosis';

interface Props {
  onSubmit: (req: DiagnosisRequest) => void;
  onReset: () => void;
  isLoading: boolean;
  hasResults: boolean;
}

// ── Small helpers ──────────────────────────────────────────────

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}
    >
      {children}
    </label>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const ratio = current / max;
  const color = ratio > 0.9 ? 'var(--error)' : ratio > 0.75 ? 'var(--warn)' : 'var(--text-3)';
  return (
    <span style={{ fontSize: '11px', color, fontVariantNumeric: 'tabular-nums' }}>
      {current}/{max}
    </span>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p role="alert" style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--error)' }}>
      {msg}
    </p>
  );
}

function FieldRow({
  label, htmlFor, counter, children, error,
}: {
  label: string;
  htmlFor: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
        <Label htmlFor={htmlFor}>{label}</Label>
        {counter}
      </div>
      {children}
      {error && <FieldError msg={error} />}
    </div>
  );
}

// ── Shared textarea/select styles ──────────────────────────────

const baseTextarea: React.CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
  fontSize: '13px',
  lineHeight: '1.6',
  display: 'block',
};

const codeTextarea: React.CSSProperties = {
  ...baseTextarea,
  fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code",ui-monospace,monospace',
  fontSize: '12.5px',
  lineHeight: '1.65',
  background: 'var(--surface-code)',
  color: 'var(--code-text)',
  borderColor: '#2A2A2A',
};

// ── Component ──────────────────────────────────────────────────

export function InputPanel({ onSubmit, onReset, isLoading, hasResults }: Props) {
  const [language, setLanguage] = useState<SupportedLanguage>('Python');
  const [errorMessage, setErrorMessage] = useState('');
  const [stackTrace, setStackTrace] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!errorMessage.trim()) errs.error_message = 'Required.';
    else if (errorMessage.length > FIELD_LIMITS.error_message)
      errs.error_message = `Max ${FIELD_LIMITS.error_message} characters.`;
    if (!codeSnippet.trim()) errs.code_snippet = 'Required.';
    else if (codeSnippet.length > FIELD_LIMITS.code_snippet)
      errs.code_snippet = `Max ${FIELD_LIMITS.code_snippet} characters.`;
    if (stackTrace.length > FIELD_LIMITS.stack_trace)
      errs.stack_trace = `Max ${FIELD_LIMITS.stack_trace} characters.`;
    if (expectedBehavior.length > FIELD_LIMITS.expected_behavior)
      errs.expected_behavior = `Max ${FIELD_LIMITS.expected_behavior} characters.`;
    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    setValidationErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({
      error_message: errorMessage.trim(),
      stack_trace: stackTrace.trim() || undefined,
      code_snippet: codeSnippet.trim(),
      language,
      expected_behavior: expectedBehavior.trim() || undefined,
    });
  }

  function handleReset() {
    setErrorMessage('');
    setStackTrace('');
    setCodeSnippet('');
    setExpectedBehavior('');
    setValidationErrors({});
    onReset();
  }

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Page heading (shown when no results) ── */}
      {!hasResults && (
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.3px',
            margin: '0 0 4px',
          }}>
            Debug an error
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', margin: 0 }}>
            Paste an error and code snippet to get a diagnosis, explanation, and suggested fix.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Language */}
        <FieldRow label="Language" htmlFor="language">
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px 11px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              fontSize: '13px',
              background: 'var(--surface)',
              color: 'var(--text)',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%235C5C5C' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              paddingRight: '30px',
            }}
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </FieldRow>

        <hr className="divider" />

        {/* Error message */}
        <FieldRow
          label="Error message *"
          htmlFor="error_message"
          counter={<CharCounter current={errorMessage.length} max={FIELD_LIMITS.error_message} />}
          error={validationErrors.error_message}
        >
          <textarea
            id="error_message"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            placeholder="TypeError: unsupported operand type(s) for +: 'int' and 'str'"
            rows={3}
            disabled={isLoading}
            style={{
              ...baseTextarea,
              borderColor: validationErrors.error_message ? 'var(--error)' : 'var(--border)',
              fontFamily: '"JetBrains Mono","Fira Code",ui-monospace,monospace',
              fontSize: '12.5px',
            }}
          />
        </FieldRow>

        {/* Stack trace */}
        <FieldRow
          label="Stack trace"
          htmlFor="stack_trace"
          counter={<CharCounter current={stackTrace.length} max={FIELD_LIMITS.stack_trace} />}
          error={validationErrors.stack_trace}
        >
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              fontSize: '10px',
              color: 'var(--text-3)',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              pointerEvents: 'none',
            }}>optional</span>
            <textarea
              id="stack_trace"
              value={stackTrace}
              onChange={(e) => setStackTrace(e.target.value)}
              placeholder={"Traceback (most recent call last):\n  File \"app.py\", line 3..."}
              rows={4}
              disabled={isLoading}
              style={{
                ...codeTextarea,
                borderColor: validationErrors.stack_trace ? 'var(--error)' : '#2A2A2A',
                paddingRight: '60px',
              }}
            />
          </div>
        </FieldRow>

        {/* Code snippet */}
        <FieldRow
          label="Code snippet *"
          htmlFor="code_snippet"
          counter={<CharCounter current={codeSnippet.length} max={FIELD_LIMITS.code_snippet} />}
          error={validationErrors.code_snippet}
        >
          <textarea
            id="code_snippet"
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder={"# Paste the relevant code here\ndef format_age(age):\n    return 'Age: ' + age"}
            rows={9}
            disabled={isLoading}
            className="code-input"
            style={{
              ...codeTextarea,
              borderColor: validationErrors.code_snippet ? 'var(--error)' : '#2A2A2A',
            }}
          />
        </FieldRow>

        {/* Expected behavior */}
        <FieldRow
          label="Expected behavior"
          htmlFor="expected_behavior"
          counter={<CharCounter current={expectedBehavior.length} max={FIELD_LIMITS.expected_behavior} />}
          error={validationErrors.expected_behavior}
        >
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              fontSize: '10px',
              color: 'var(--text-3)',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              pointerEvents: 'none',
            }}>optional</span>
            <textarea
              id="expected_behavior"
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              placeholder="What did you expect to happen?"
              rows={2}
              disabled={isLoading}
              style={{
                ...baseTextarea,
                borderColor: validationErrors.expected_behavior ? 'var(--error)' : 'var(--border)',
                paddingRight: '60px',
              }}
            />
          </div>
        </FieldRow>

        <hr className="divider" />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '9px 16px',
              background: isLoading ? 'var(--text-3)' : 'var(--action)',
              color: 'var(--action-text)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              transition: 'background var(--t)',
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner" style={{ borderTopColor: 'var(--action-text)', borderColor: 'rgba(255,255,255,0.3)' }} />
                Analyzing…
              </>
            ) : (
              'Analyze error'
            )}
          </button>

          {hasResults && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              style={{
                padding: '9px 14px',
                background: 'var(--surface)',
                color: 'var(--text-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'border-color var(--t)',
                whiteSpace: 'nowrap',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Inline validation summary */}
        {hasErrors && (
          <p role="alert" style={{ fontSize: '12px', color: 'var(--error)', margin: 0 }}>
            Fix the highlighted fields above before submitting.
          </p>
        )}

        {/* Privacy notice */}
        <p style={{ fontSize: '11px', color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>
          Your code is sent to an AI model and is not stored after the request. Remove credentials and tokens before submitting.
        </p>

      </div>
    </form>
  );
}
