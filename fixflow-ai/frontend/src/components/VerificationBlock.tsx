import { useState } from 'react';
import type { DiagnosisResponse } from '../types/diagnosis';
import { SectionCard } from './SectionCard';

interface Props {
  data: Pick<DiagnosisResponse, 'test_suggestion' | 'verification_status'>;
}

export function VerificationBlock({ data }: Props) {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data.test_suggestion);
      setState('ok');
      setTimeout(() => setState('idle'), 1800);
    } catch {
      setState('err');
      setTimeout(() => setState('idle'), 1800);
    }
  }

  return (
    <SectionCard num={4} title="Verify the solution" label="Suggested — not verified" labelColor="warn">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Notice */}
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6 }}>
          Copy these tests and run them in your local environment. The server never executes submitted code.
        </p>

        {/* Code block */}
        <div style={{
          background: 'var(--surface-code)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}>
          {/* Block header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '7px 12px',
            borderBottom: '1px solid #2A2A2A',
          }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}>
              Suggested tests
            </span>
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
              {state === 'ok' ? 'Copied' : state === 'err' ? 'Failed' : 'Copy tests'}
            </button>
          </div>

          <pre
            className="code-scroll"
            style={{
              margin: 0,
              padding: '14px',
              color: 'var(--code-text)',
              fontSize: '12px',
              lineHeight: 1.65,
              overflow: 'auto',
              maxHeight: '260px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <code>{data.test_suggestion}</code>
          </pre>
        </div>

      </div>
    </SectionCard>
  );
}
