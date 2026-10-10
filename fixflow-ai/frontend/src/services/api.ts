import type { DiagnosisRequest, DiagnosisResponse, ApiErrorResponse } from '../types/diagnosis';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  status: number;
  detail: string;
  errorCode?: string;

  constructor(status: number, detail: string, errorCode?: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.errorCode = errorCode;
  }
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const body: ApiErrorResponse = await res.json();
    return new ApiError(res.status, body.detail ?? 'Request failed', body.error_code);
  } catch {
    return new ApiError(res.status, `Request failed with status ${res.status}`);
  }
}

export async function analyzeDiagnosis(
  request: DiagnosisRequest,
  signal?: AbortSignal,
): Promise<DiagnosisResponse> {
  const res = await fetch(`${API_BASE}/api/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  return res.json() as Promise<DiagnosisResponse>;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
