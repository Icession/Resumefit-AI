"""Pydantic models for request and response bodies."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


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
    missing_keywords: list[str] = Field(default_factory=list)
    suggestions: list[Suggestion] = Field(default_factory=list)
    summary: str = Field(..., description="One-paragraph overall assessment.")


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    created_at: datetime
    
class AnalysisRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_description: str
    match_score: int
    missing_keywords: list[str]
    suggestions: list[Suggestion]
    summary: str
    created_at: datetime