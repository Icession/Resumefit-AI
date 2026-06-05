"""/analyze endpoint."""
from fastapi import APIRouter

from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.gemini import analyze_resume

router = APIRouter(tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Analyze a resume against a job description and return a match report."""
    return analyze_resume(payload)
