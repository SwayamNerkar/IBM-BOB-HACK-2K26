import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import type { DiagnosisResponse } from '../types/diagnosis';
import { SectionCard } from './SectionCard';

interface Props {
  data: Pick<DiagnosisResponse, 'original_code' | 'fixed_code' | 'diff_summary'>;
  language: string;
}

// ── Copy button ─────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('ok');
      setTimeout(() => setState('idle'), 1800);
    } catch {
      setState('err');
      setTimeout(() => setState('idle'), 1800);
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: '3px 9px',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 'var(--r-sm)',
        fontSize: '11px',
        fontWeight: 500,
        color: state === 'ok' ? '#4ade80' : state === 'err' ? '#f87171' : 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        transition: 'color 0.12s',
        fontFamily: 'inherit',
      }}
    >
      {state === 'ok' ? 'Copied' : state === 'err' ? 'Failed' : 'Copy'}
    </button>
  );
}

// ── Code pane ───────────────────────────────────────────────

function CodePane({
  code, side, lang,
}: {
  code: string;
  side: 'original' | 'fixed';
  lang: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.removeAttribute('data-highlighted');
      hljs.highlightElement(ref.current);
    }
  }, [code, lang]);

  const isFixed = side === 'fixed';

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Pane header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 12px',
        background: isFixed ? '#1A2A1A' : '#2A1A1A',
        borderBottom: `1px solid ${isFixed ? '#2A3A2A' : '#3A2A2A'}`,
        borderRadius: 'var(--r-md) var(--r-md) 0 0',
      }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: isFixed ? '#4ade80' : '#f87171',
        }}>
          {isFixed ? 'Proposed fix' : 'Original'}
        </span>
        <CopyButton text={code} />
      </div>

      {/* Code block */}
      <div style={{
        background: 'var(--surface-code)',
        borderRadius: '0 0 var(--r-md) var(--r-md)',
        overflow: 'hidden',
        flex: 1,
      }}>
        <pre
          className="code-scroll"
          style={{
            margin: 0,
            padding: '14px',
            overflow: 'auto',
            maxHeight: '280px',
            fontSize: '12px',
            lineHeight: 1.65,
          }}
        >
          <code ref={ref} className={`language-${lang.toLowerCase()}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────

export function DiffView({ data, language }: Props) {
  return (
    <SectionCard num={3} title="Suggested fix" label="Proposal — not verified" labelColor="warn">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Side-by-side panes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }} className="diff-grid">
          <CodePane code={data.original_code} side="original" lang={language} />
          <CodePane code={data.fixed_code} side="fixed" lang={language} />
        </div>

        {/* What changed */}
        {data.diff_summary && (
          <div style={{
            padding: '10px 12px',
            background: 'var(--info-bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
          }}>
            <p className="t-label" style={{ marginBottom: '5px' }}>What changed and why</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: 1.65 }}>
              {data.diff_summary}
            </p>
          </div>
        )}

      </div>

      <style>{`
        @media (max-width: 680px) {
          .diff-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </SectionCard>
  );
}
