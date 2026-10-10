import type { DiagnosisResponse } from '../types/diagnosis';
import { SectionCard } from './SectionCard';

interface Props {
  data: Pick<DiagnosisResponse, 'likely_cause' | 'explanation' | 'evidence' | 'uncertainty_notes'>;
}

export function DiagnosisCard({ data }: Props) {
  return (
    <SectionCard num={1} title="Likely cause">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Root cause — visually distinct */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--error-bg)',
          border: '1px solid var(--error-border)',
          borderLeft: '3px solid var(--error)',
          borderRadius: 'var(--r-md)',
        }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
            {data.likely_cause}
          </p>
        </div>

        {/* Explanation */}
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>
          {data.explanation}
        </p>

        {/* Evidence */}
        {data.evidence && (
          <div>
            <p className="t-label" style={{ marginBottom: '6px' }}>Evidence</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.6, fontStyle: 'italic' }}>
              {data.evidence}
            </p>
          </div>
        )}

        {/* Uncertainty */}
        {data.uncertainty_notes && (
          <div style={{
            padding: '10px 12px',
            background: 'var(--warn-bg)',
            border: '1px solid var(--warn-border)',
            borderRadius: 'var(--r-md)',
          }}>
            <p className="t-label" style={{ marginBottom: '4px', color: 'var(--warn)' }}>Alternative explanations</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--warn)', lineHeight: 1.6 }}>
              {data.uncertainty_notes}
            </p>
          </div>
        )}

      </div>
    </SectionCard>
  );
}
