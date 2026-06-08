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


class ATSRequest(BaseModel):
    resume: str = Field(..., min_length=1, description="The candidate's resume text.")


class ATSCheckItem(BaseModel):
    category: str = Field(..., description="Short label for the area checked.")
    status: str = Field(..., description='One of "good", "warning", or "issue".')
    detail: str = Field(..., description="What was found in this resume.")
    fix: str = Field(default="", description="How to fix it (empty when status is good).")


class ATSAIReport(BaseModel):
    """The content checks the model fills in (no score; we compute that)."""

    checks: list[ATSCheckItem] = Field(default_factory=list)
    summary: str = Field(default="", description="One-sentence overall assessment.")


class ATSReport(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    checks: list[ATSCheckItem] = Field(default_factory=list)
    summary: str = Field(default="")


class CoverLetterDraft(BaseModel):
    """Internal structure Gemini fills in; assembled into the final letter text."""

    greeting: str = Field(..., description='Salutation line, e.g. "Dear Hiring Team,"')
    body_paragraphs: list[str] = Field(
        ...,
        description="2-4 paragraphs. Each item is one paragraph with no line breaks.",
    )
    closing: str = Field(..., description='Sign-off phrase, e.g. "Sincerely,"')
    signature: str = Field(
        ..., description="Candidate's full name from the resume, or [Your Name]."
    )
    contact_line: str | None = Field(
        default=None,
        description=(
            "Optional single line of profile links under the name, e.g. "
            "'GitHub: github.com/x | LinkedIn: linkedin.com/in/x'. Only include links "
            "the candidate actually provided; leave null if none."
        ),
    )


class CoverLetterRequest(BaseModel):
    resume: str = Field(..., min_length=1, description="The candidate's resume text.")
    job_description: str = Field(
        ..., min_length=1, description="The target job description text."
    )
    extras: str | None = Field(
        default=None,
        description=(
            "Optional links/notes the candidate wants considered: GitHub, LinkedIn, "
            "portfolio, project links, the hiring manager's name, etc."
        ),
    )


class CoverLetterResponse(BaseModel):
    cover_letter: str = Field(
        ..., description="The full, formatted cover letter text, greeting through sign-off."
    )


class LinkItem(BaseModel):
    """A single labelled link, e.g. label='GitHub', url='github.com/you'."""

    label: str = ""
    url: str = ""


class CoverLetterRequest(BaseModel):
    resume: str = Field(..., min_length=1, description="The candidate's resume text.")
    job_description: str = Field(
        ..., min_length=1, description="The target job description text."
    )

    # Applicant identity + links (optional). Rendered into the signature by our code,
    # never passed through the model, so URLs are always exact.
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    links: list[LinkItem] = Field(default_factory=list)

    # Targeting (optional). Safe to feed the model to sharpen the greeting and hook.
    company_name: str | None = None
    role_title: str | None = None
    hiring_manager: str | None = None


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


class ProfileWrite(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    links: list[LinkItem] = Field(default_factory=list)


class ProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    links: list[LinkItem] = Field(default_factory=list)