interface Props {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '11px 14px',
        background: 'var(--error-bg)',
        border: '1px solid var(--error-border)',
        borderRadius: 'var(--r-lg)',
      }}
    >
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--error)', lineHeight: 1.5 }}>
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--error)',
            fontSize: '16px',
            lineHeight: 1,
            padding: '0 2px',
            flexShrink: 0,
            opacity: 0.7,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
