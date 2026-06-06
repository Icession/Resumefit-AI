"""AI analysis service backed by the Google Gemini API."""
import os
import time
from functools import lru_cache

from dotenv import load_dotenv
from google import genai
from google.genai import errors

from app.schemas import AnalyzeRequest, AnalyzeResponse

load_dotenv()

MODEL = "gemini-2.5-flash"

RETRYABLE_CODES = {429, 500, 502, 503, 504}
MAX_ATTEMPTS = 3

PROMPT_TEMPLATE = """You are an expert technical recruiter and resume coach.
Compare the candidate's RESUME against the JOB DESCRIPTION and produce a fit report.

Integrity rules (these matter most):
- Base every suggestion strictly on experience already present in the RESUME.
- Never invent roles, employers, skills, metrics, dates, or accomplishments the
  candidate did not state. "Stronger" means clearer wording, not new facts.
- Treat skills the job needs but the resume lacks as honest gaps to address,
  never as content to fabricate.

Guidelines:
- match_score: an integer from 0 to 100 for how well the resume fits this role.
- missing_keywords: important skills, tools, or qualifications named in the job
  description that are absent or underrepresented in the resume. These are honest
  gaps - surface them only if the candidate genuinely has them, or treat them as
  things to learn. Never as things to fake.
- suggestions: pick 2 to 5 weak or vague lines from the resume and rewrite each to
  be stronger and tailored to this job (specific, quantified, action-oriented),
  using only information the candidate already provided.
- summary: one short paragraph on the overall fit and the single most important
  thing the candidate should genuinely improve.

RESUME:
{resume}

JOB DESCRIPTION:
{job_description}
"""


@lru_cache
def _client() -> genai.Client:
    """Create the Gemini client once, reusing it across requests."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Copy backend/.env.example to backend/.env "
            "and add your key from https://aistudio.google.com/apikey"
        )
    return genai.Client(api_key=api_key)


def analyze_resume(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Call Gemini to analyze a resume, retrying briefly on transient errors."""
    prompt = PROMPT_TEMPLATE.format(
        resume=payload.resume,
        job_description=payload.job_description,
    )

    for attempt in range(MAX_ATTEMPTS):
        try:
            response = _client().models.generate_content(
                model=MODEL,
                contents=prompt,
                config={
                    "temperature": 0.2,
                    "response_mime_type": "application/json",
                    "response_schema": AnalyzeResponse,
                },
            )
            
            result = response.parsed
            if result is None:
                result = AnalyzeResponse.model_validate_json(response.text)
            return result

        except errors.APIError as exc:
            is_last_attempt = attempt == MAX_ATTEMPTS - 1
            if exc.code in RETRYABLE_CODES:
                if not is_last_attempt:
                    time.sleep(2 ** attempt)
                    continue
                raise RuntimeError(
                    "The AI service is busy right now. Please try again in a moment."
                ) from exc
            raise

    raise RuntimeError("Gemini request failed after retries.")