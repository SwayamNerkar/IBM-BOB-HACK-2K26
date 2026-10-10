import { useState } from 'react';
import type { DiagnosisResponse, QuizOption } from '../types/diagnosis';
import { SectionCard } from './SectionCard';

interface Props {
  data: Pick<DiagnosisResponse, 'quiz_question' | 'quiz_options' | 'quiz_answer'>;
}

export function QuizBlock({ data }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === data.quiz_answer;

  return (
    <SectionCard num={5} title="Check your understanding">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.6 }}>
          {data.quiz_question}
        </p>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '10px', display: 'block' }}>
            Choose an answer
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.quiz_options.map((opt: QuizOption) => {
              const isSelected = selected === opt.key;
              const isAnswer = opt.key === data.quiz_answer;
              const revealed = selected !== null;

              let bg = 'var(--surface)';
              let border = 'var(--border)';
              let textColor = 'var(--text)';

              if (revealed) {
                if (isAnswer) { bg = 'var(--ok-bg)'; border = 'var(--ok-border)'; textColor = 'var(--ok)'; }
                else if (isSelected) { bg = 'var(--error-bg)'; border = 'var(--error-border)'; textColor = 'var(--error)'; }
                else { textColor = 'var(--text-3)'; }
              }

              return (
                <label key={opt.key} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '9px 12px',
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: 'var(--r-md)',
                  cursor: revealed ? 'default' : 'pointer',
                  color: textColor,
                  transition: 'background 0.1s, border-color 0.1s',
                }}>
                  <input
                    type="radio"
                    name="quiz"
                    value={opt.key}
                    checked={isSelected}
                    onChange={() => selected === null && setSelected(opt.key)}
                    disabled={revealed}
                    style={{ marginTop: '3px', flexShrink: 0, accentColor: 'var(--text)' }}
                  />
                  <span style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    <strong style={{ marginRight: '5px', fontVariantNumeric: 'tabular-nums' }}>{opt.key}.</strong>
                    {opt.text}
                    {revealed && isAnswer && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--ok)' }}>✓ Correct</span>
                    )}
                    {revealed && isSelected && !isAnswer && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--error)' }}>✗</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {selected !== null && (
          <div style={{
            padding: '10px 12px',
            background: isCorrect ? 'var(--ok-bg)' : 'var(--error-bg)',
            border: `1px solid ${isCorrect ? 'var(--ok-border)' : 'var(--error-border)'}`,
            borderRadius: 'var(--r-md)',
            fontSize: '13px',
            color: isCorrect ? 'var(--ok)' : 'var(--error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <span>
              {isCorrect
                ? 'Correct — you understand the concept behind this error.'
                : <>Not quite. The correct answer is <strong>{data.quiz_answer}</strong>.</>}
            </span>
            <button
              onClick={() => setSelected(null)}
              style={{
                padding: '3px 10px',
                background: 'transparent',
                border: `1px solid ${isCorrect ? 'var(--ok-border)' : 'var(--error-border)'}`,
                borderRadius: 'var(--r-sm)',
                fontSize: '11px',
                fontWeight: 600,
                color: isCorrect ? 'var(--ok)' : 'var(--error)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Try again
            </button>
          </div>
        )}

      </div>
    </SectionCard>
  );
}
