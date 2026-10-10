"""
Pydantic schemas for the /api/diagnose endpoint.
Field limits mirror the frontend constants and are enforced server-side.
"""
from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

SUPPORTED_LANGUAGES = {"Python", "JavaScript", "TypeScript", "Java", "C++", "Other"}


class DiagnosisRequest(BaseModel):
    error_message: str = Field(..., min_length=1, max_length=2000)
    stack_trace: Optional[str] = Field(default=None, max_length=6000)
    code_snippet: str = Field(..., min_length=1, max_length=8000)
    language: str = Field(...)
    expected_behavior: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        if v not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported language '{v}'. Supported: {sorted(SUPPORTED_LANGUAGES)}"
            )
        return v

    @field_validator("error_message", "stack_trace", "code_snippet", "expected_behavior", mode="before")
    @classmethod
    def coerce_none_strings(cls, v: object) -> object:
        if v is None:
            return None
        if isinstance(v, str):
            stripped = v.strip()
            if not stripped:
                return None  # whitespace-only treated as absent
            return stripped
        return v


class QuizOption(BaseModel):
    key: str = Field(..., min_length=1, max_length=10)
    text: str = Field(..., min_length=1, max_length=500)


class DiagnosisResponse(BaseModel):
    likely_cause: str = Field(..., max_length=1000)
    explanation: str = Field(..., max_length=3000)
    evidence: str = Field(default="", max_length=2000)
    concept_name: str = Field(..., max_length=200)
    concept_explanation: str = Field(..., max_length=3000)
    original_code: str = Field(default="", max_length=8000)
    fixed_code: str = Field(default="", max_length=8000)
    diff_summary: str = Field(default="", max_length=2000)
    test_suggestion: str = Field(default="", max_length=4000)
    quiz_question: str = Field(..., max_length=500)
    quiz_options: list[QuizOption] = Field(..., min_length=2, max_length=5)
    quiz_answer: str = Field(..., max_length=10)
    uncertainty_notes: str = Field(default="", max_length=1000)
    # Backend-controlled — never derived from AI output
    verification_status: Literal["suggested_not_verified"] = "suggested_not_verified"
    demo_mode: bool = False

    @model_validator(mode="after")
    def validate_quiz_answer_in_options(self) -> "DiagnosisResponse":
        option_keys = {opt.key for opt in self.quiz_options}
        if self.quiz_answer not in option_keys:
            raise ValueError(
                f"quiz_answer '{self.quiz_answer}' is not one of the option keys: {option_keys}"
            )
        return self


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
