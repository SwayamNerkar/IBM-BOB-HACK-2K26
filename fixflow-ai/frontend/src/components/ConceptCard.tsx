import type { DiagnosisResponse } from '../types/diagnosis';
import { SectionCard } from './SectionCard';

interface Props {
  data: Pick<DiagnosisResponse, 'concept_name' | 'concept_explanation'>;
}

export function ConceptCard({ data }: Props) {
  return (
    <SectionCard num={2} title="Understand the error">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Concept name pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
            marginRight: '2px',
          }}>
            Concept
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text)',
            background: 'var(--surface-dim)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '2px 8px',
          }}>
            {data.concept_name}
          </span>
        </div>

        {/* Explanation */}
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: 1.75 }}>
          {data.concept_explanation}
        </p>

      </div>
    </SectionCard>
  );
}
