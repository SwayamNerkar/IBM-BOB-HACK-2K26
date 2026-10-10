interface Props {
  demoMode?: boolean;
}

export function Header({ demoMode }: Props) {
  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.2px',
          }}>
            {/* Small geometric mark */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect width="18" height="18" rx="4" fill="var(--text)" />
              <path d="M5 6h5M5 9h8M5 12h3" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            FixFlow
            <span style={{ fontWeight: 400, color: 'var(--text-2)' }}>AI</span>
          </span>

          <span style={{
            fontSize: '12px',
            color: 'var(--text-3)',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--border)',
          }}>
            Debugging workspace
          </span>
        </div>

        {/* Right side status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {demoMode ? (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--warn)',
              background: 'var(--warn-bg)',
              border: '1px solid var(--warn-border)',
              borderRadius: 'var(--r-sm)',
              padding: '2px 8px',
            }}>
              Demo mode
            </span>
          ) : (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--ok)',
              background: 'var(--ok-bg)',
              border: '1px solid var(--ok-border)',
              borderRadius: 'var(--r-sm)',
              padding: '2px 8px',
            }}>
              Live AI
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
