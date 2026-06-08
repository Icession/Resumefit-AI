"""/analyze endpoints (text + file upload) and saved-history retrieval."""
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user, get_optional_user
from app.models import Analysis, User
from app.schemas import (
    AnalysisRead,
    AnalyzeRequest,
    AnalyzeResponse,
    CoverLetterRequest,
    CoverLetterResponse,
    LinkItem,
)
from app.services.extract import extract_text
from app.services.gemini import analyze_resume, generate_cover_letter

router = APIRouter(tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(
    payload: AnalyzeRequest,
    session: Session = Depends(get_session),
    user: User | None = Depends(get_optional_user),
) -> AnalyzeResponse:
    """Analyze pasted resume text. Saves to history if logged in."""
    return _run(payload, session, user)


@router.post("/analyze/file", response_model=AnalyzeResponse)
async def analyze_file(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...),
    session: Session = Depends(get_session),
    user: User | None = Depends(get_optional_user),
) -> AnalyzeResponse:
    """Analyze an uploaded resume file. Saves to history if logged in."""
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")

    data = await resume_file.read()
    try:
        resume_text = extract_text(resume_file.filename or "", data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    payload = AnalyzeRequest(resume=resume_text, job_description=job_description)
    return _run(payload, session, user)


@router.get("/history", response_model=list[AnalysisRead], tags=["history"])
def history(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> list[Analysis]:
    """Return the logged-in user's saved analyses, newest first."""
    return session.exec(
        select(Analysis)
        .where(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
    ).all()


@router.post("/cover-letter", response_model=CoverLetterResponse, tags=["cover-letter"])
def cover_letter(payload: CoverLetterRequest) -> CoverLetterResponse:
    """Generate a tailored cover letter from pasted resume text + job description."""
    return _make_cover_letter(payload)


@router.post(
    "/cover-letter/file", response_model=CoverLetterResponse, tags=["cover-letter"]
)
async def cover_letter_file(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...),
    full_name: str | None = Form(None),
    email: str | None = Form(None),
    phone: str | None = Form(None),
    location: str | None = Form(None),
    link_labels: list[str] = Form(default=[]),
    link_urls: list[str] = Form(default=[]),
    company_name: str | None = Form(None),
    role_title: str | None = Form(None),
    hiring_manager: str | None = Form(None),
) -> CoverLetterResponse:
    """Generate a tailored cover letter from an uploaded resume file + job description."""
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")

    data = await resume_file.read()
    try:
        resume_text = extract_text(resume_file.filename or "", data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    payload = CoverLetterRequest(
        resume=resume_text,
        job_description=job_description,
        full_name=full_name,
        email=email,
        phone=phone,
        location=location,
        links=[
            LinkItem(label=label, url=url)
            for label, url in zip(link_labels, link_urls)
        ],
        company_name=company_name,
        role_title=role_title,
        hiring_manager=hiring_manager,
    )
    return _make_cover_letter(payload)


def _make_cover_letter(payload: CoverLetterRequest) -> CoverLetterResponse:
    try:
        return generate_cover_letter(payload)
    except Exception as exc:  # surface a clean error to the frontend
        raise HTTPException(
            status_code=502, detail=f"Cover letter generation failed: {exc}"
        )


def _run(
    payload: AnalyzeRequest, session: Session, user: User | None
) -> AnalyzeResponse:
    try:
        result = analyze_resume(payload)
    except Exception as exc:  # surface a clean error to the frontend
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {exc}")

    # Persist to history only when the request is authenticated.
    if user is not None:
        record = Analysis(
            user_id=user.id,
            job_description=payload.job_description,
            resume_text=payload.resume,
            match_score=result.match_score,
            missing_keywords=result.missing_keywords,
            suggestions=[s.model_dump() for s in result.suggestions],
            summary=result.summary,
        )
        session.add(record)
        session.commit()

    return result