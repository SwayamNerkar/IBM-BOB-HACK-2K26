import type { DiagnosisResponse } from '../types/diagnosis';
import { DiagnosisCard } from './DiagnosisCard';
import { ConceptCard } from './ConceptCard';
import { DiffView } from './DiffView';
import { VerificationBlock } from './VerificationBlock';
import { QuizBlock } from './QuizBlock';

interface Props {
  data: DiagnosisResponse;
  language: string;
  onReset: () => void;
}

export function ResultsPanel({ data, language, onReset }: Props) {
  return (
    <div>
      {/* Results header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: '0 0 3px', letterSpacing: '-0.2px' }}>
            Analysis complete
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-2)', margin: 0 }}>
            Review each section. All AI output is a suggestion — verify before applying.
          </p>
        </div>
        <button
          onClick={onReset}
          style={{
            padding: '6px 12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-2)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'border-color var(--t)',
          }}
        >
          New analysis
        </button>
      </div>

      {/* Demo mode notice */}
      {data.demo_mode && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--warn-bg)',
          border: '1px solid var(--warn-border)',
          borderRadius: 'var(--r-lg)',
          fontSize: '12px',
          color: 'var(--warn)',
          marginBottom: '20px',
          lineHeight: 1.5,
        }}>
          <strong>Demo mode</strong> — These results are pre-generated. Configure{' '}
          <code style={{ fontSize: '11px', background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '3px' }}>
            AI_API_KEY
          </code>{' '}
          in your backend <code style={{ fontSize: '11px', background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '3px' }}>.env</code>{' '}
          for live analysis.
        </div>
      )}

      {/* Five sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <DiagnosisCard data={data} />
        <ConceptCard data={data} />
        <DiffView data={data} language={language} />
        <VerificationBlock data={data} />
        <QuizBlock data={data} />
      </div>

      {/* Footer note */}
      <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '24px', lineHeight: 1.5 }}>
        AI results are based on pattern recognition. Always review, test, and apply professional judgment before using any suggested fix.
      </p>
    </div>
  );
}
