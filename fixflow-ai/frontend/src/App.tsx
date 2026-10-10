import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { ErrorBanner } from './components/ErrorBanner';
import { useAnalyze } from './hooks/useAnalyze';
import type { DiagnosisRequest } from './types/diagnosis';
import { useState } from 'react';

export default function App() {
  const { state, analyze, reset } = useAnalyze();
  const [lastLanguage, setLastLanguage] = useState('Python');

  function handleSubmit(req: DiagnosisRequest) {
    setLastLanguage(req.language);
    analyze(req);
  }

  const isLoading = state.status === 'loading';
  const hasResults = state.status === 'success';
  const demoMode = state.status === 'success' && state.data.demo_mode === true;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header demoMode={demoMode} />

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: hasResults ? '400px 1fr' : '560px',
        justifyContent: hasResults ? 'stretch' : 'center',
        gap: '0',
        minHeight: 'calc(100vh - 48px)',
        alignItems: 'start',
      }} className="workspace">

        {/* ── Left column: input ── */}
        <div style={{
          borderRight: hasResults ? '1px solid var(--border)' : 'none',
          paddingTop: '32px',
          paddingBottom: '48px',
          paddingRight: hasResults ? '32px' : '0',
          position: hasResults ? 'sticky' : 'static',
          top: '48px',
          maxHeight: hasResults ? 'calc(100vh - 48px)' : 'auto',
          overflowY: hasResults ? 'auto' : 'visible',
        }}>
          <InputPanel
            onSubmit={handleSubmit}
            onReset={reset}
            isLoading={isLoading}
            hasResults={hasResults}
          />

          {/* Loading state */}
          {isLoading && (
            <div style={{
              marginTop: '16px',
              padding: '14px 16px',
              background: 'var(--info-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span className="spinner" />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: 0 }}>
                  Analyzing error…
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', margin: '2px 0 0' }}>
                  AI diagnosis in progress
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {state.status === 'error' && (
            <div style={{ marginTop: '16px' }}>
              <ErrorBanner message={state.message} onDismiss={reset} />
            </div>
          )}
        </div>

        {/* ── Right column: results or empty state ── */}
        {hasResults && state.status === 'success' ? (
          <div style={{
            paddingTop: '32px',
            paddingBottom: '48px',
            paddingLeft: '32px',
          }} className="fade-in">
            <ResultsPanel
              data={state.data}
              language={lastLanguage}
              onReset={reset}
            />
          </div>
        ) : !isLoading && state.status !== 'error' && (
          /* Empty state — only shown in single-column (no results yet) */
          <></>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .workspace {
            grid-template-columns: 1fr !important;
            padding: 0 16px !important;
          }
          .workspace > div:first-child {
            border-right: none !important;
            padding-right: 0 !important;
            position: static !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
          .workspace > div:last-child {
            padding-left: 0 !important;
            border-top: 1px solid var(--border);
            padding-top: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
