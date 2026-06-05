"""Pydantic models for request and response bodies."""
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    resume: str = Field(..., min_length=1, description="The candidate's resume text.")
    job_description: str = Field(
        ..., min_length=1, description="The target job description text."
    )


class Suggestion(BaseModel):
    original: str = Field(..., description="A weak bullet/line from the resume.")
    improved: str = Field(..., description="A stronger, tailored rewrite.")


class AnalyzeResponse(BaseModel):
    match_score: int = Field(..., ge=0, le=100, description="Overall fit, 0-100.")
    missing_keywords: list[str] = Field(
        default_factory=list, description="Skills/keywords the resume should add."
    )
    suggestions: list[Suggestion] = Field(
        default_factory=list, description="Rewrite suggestions for weak bullets."
    )
    summary: str = Field(..., description="One-paragraph overall assessment.")
