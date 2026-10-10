// Supported programming languages
export const SUPPORTED_LANGUAGES = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'Other',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Request shape matching backend schema
export interface DiagnosisRequest {
  error_message: string;
  stack_trace?: string;
  code_snippet: string;
  language: SupportedLanguage;
  expected_behavior?: string;
}

// Field limits mirroring backend validation
export const FIELD_LIMITS = {
  error_message: 2000,
  stack_trace: 6000,
  code_snippet: 8000,
  expected_behavior: 1000,
} as const;

// Quiz option shape
export interface QuizOption {
  key: string;
  text: string;
}

// Full diagnosis response from backend
export interface DiagnosisResponse {
  likely_cause: string;
  explanation: string;
  evidence: string;
  concept_name: string;
  concept_explanation: string;
  original_code: string;
  fixed_code: string;
  diff_summary: string;
  test_suggestion: string;
  quiz_question: string;
  quiz_options: QuizOption[];
  quiz_answer: string;
  uncertainty_notes: string;
  // Backend-controlled — never set by model
  verification_status: 'suggested_not_verified';
  demo_mode?: boolean;
}

// Error response from backend
export interface ApiErrorResponse {
  detail: string;
  error_code?: string;
}
