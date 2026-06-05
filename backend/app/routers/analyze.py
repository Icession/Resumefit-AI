"""/analyze endpoints (JSON text + file upload)."""
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.extract import extract_text
from app.services.gemini import analyze_resume

router = APIRouter(tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Analyze pasted resume text against a job description."""
    return _run(payload)


@router.post("/analyze/file", response_model=AnalyzeResponse)
async def analyze_file(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...),
) -> AnalyzeResponse:
    """Analyze an uploaded resume file (.pdf or .txt) against a job description."""
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")

    data = await resume_file.read()
    try:
        resume_text = extract_text(resume_file.filename or "", data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return _run(AnalyzeRequest(resume=resume_text, job_description=job_description))


def _run(payload: AnalyzeRequest) -> AnalyzeResponse:
    try:
        return analyze_resume(payload)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {exc}")