// A clean section container with a number, title, and optional right-side label.
// No card box — uses a top border separator for visual rhythm.

interface Props {
  num: number;
  title: string;
  label?: string;
  labelColor?: 'warn' | 'ok' | 'muted';
  children: React.ReactNode;
}

const LABEL_COLORS = {
  warn: { color: 'var(--warn)', bg: 'var(--warn-bg)', border: 'var(--warn-border)' },
  ok:   { color: 'var(--ok)',   bg: 'var(--ok-bg)',   border: 'var(--ok-border)'   },
  muted:{ color: 'var(--text-3)', bg: 'var(--surface-dim)', border: 'var(--border)' },
};

export function SectionCard({ num, title, label, labelColor = 'muted', children }: Props) {
  const lc = LABEL_COLORS[labelColor];
  return (
    <section style={{ paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
      {/* Section header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '14px',
      }}>
        {/* Section number */}
        <span style={{
          width: '20px',
          height: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-3)',
          background: 'var(--surface-dim)',
          borderRadius: '50%',
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {num}
        </span>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          {title}
        </h2>
        {label && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: lc.color,
            background: lc.bg,
            border: `1px solid ${lc.border}`,
            borderRadius: 'var(--r-sm)',
            padding: '2px 7px',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}
