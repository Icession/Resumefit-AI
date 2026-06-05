"""AI analysis service.

NOTE (Sprint 0): this returns a hardcoded response so the whole stack can run
end to end. In Sprint 1 we replace `analyze_resume` with a real Gemini API call.
"""
from app.schemas import AnalyzeRequest, AnalyzeResponse, Suggestion


def analyze_resume(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Return a match report for a resume + job description.

    TODO (Sprint 1): call the Gemini API instead of returning mock data.
    """
    return AnalyzeResponse(
        match_score=72,
        missing_keywords=["Docker", "CI/CD", "unit testing", "Agile"],
        suggestions=[
            Suggestion(
                original="Worked on the backend.",
                improved=(
                    "Built and maintained REST APIs in Python/FastAPI, "
                    "reducing average response time by 30%."
                ),
            ),
            Suggestion(
                original="Helped with the database.",
                improved=(
                    "Designed PostgreSQL schemas and optimized queries "
                    "serving 10k+ daily requests."
                ),
            ),
        ],
        summary=(
            "Solid foundational match. Strengthen the resume by adding the "
            "missing keywords above and quantifying impact in your bullets. "
            "(This is placeholder data \u2014 real AI analysis arrives in Sprint 1.)"
        ),
    )
