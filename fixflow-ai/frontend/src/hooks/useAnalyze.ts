import { useState, useRef, useCallback } from 'react';
import { analyzeDiagnosis, ApiError } from '../services/api';
import type { DiagnosisRequest, DiagnosisResponse } from '../types/diagnosis';

export type AnalyzeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: DiagnosisResponse }
  | { status: 'error'; message: string; statusCode?: number };

export function useAnalyze() {
  const [state, setState] = useState<AnalyzeState>({ status: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async (request: DiagnosisRequest) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: 'loading' });

    try {
      const data = await analyzeDiagnosis(request, controller.signal);
      setState({ status: 'success', data });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // cancelled — keep previous state
      }
      if (err instanceof ApiError) {
        const userMessage = friendlyError(err);
        setState({ status: 'error', message: userMessage, statusCode: err.status });
      } else {
        setState({ status: 'error', message: 'An unexpected error occurred. Please try again.' });
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: 'idle' });
  }, []);

  return { state, analyze, reset };
}

function friendlyError(err: ApiError): string {
  switch (err.status) {
    case 413:
      return 'Your submission is too large. Please shorten the code snippet or stack trace.';
    case 422:
      return err.detail ?? 'Invalid input. Please check the form fields.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 502:
      return 'The AI service returned an unexpected response. Please try again.';
    case 503:
      return 'The AI service is temporarily unavailable. Please try again shortly.';
    default:
      return err.detail ?? 'Something went wrong. Please try again.';
  }
}
