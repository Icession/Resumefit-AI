"""AI analysis service backed by the Google Gemini API."""
import os
import time
from functools import lru_cache

from dotenv import load_dotenv
from google import genai
from google.genai import errors

from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    ATSAIReport,
    CoverLetterDraft,
    CoverLetterRequest,
    CoverLetterResponse,
)

# Load variables from backend/.env into the environment.
load_dotenv()

MODEL = "gemini-2.5-flash"

# Transient failures worth retrying: rate limits (429) and server overload (5xx).
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

COVER_LETTER_PROMPT = """You are an expert career writer helping a candidate apply for a
specific job. Write a tailored, professional cover letter for the person described in the
RESUME, applying to the role in the JOB DESCRIPTION.

TARGETING (use only if provided below; never invent these):
{targeting}

Integrity rules (these matter most):
- Use only real experience, skills, and achievements found in the RESUME.
- Never invent employers, job titles, dates, metrics, degrees, or accomplishments the
  candidate did not state, and never claim skills the resume does not support.
- If the job asks for something the candidate lacks, do not fake it. Lean on genuine,
  related strengths and a sincere willingness to learn.
- Do NOT write any URLs, email addresses, phone numbers, links, or a contact block.
  Those are added automatically afterward. Output prose only.

Style rules:
- Sound like a real person, not a template. Avoid cliches and generic filler such as
  "I am writing to express my interest", "team player", "fast-paced environment", or
  "I believe I would be a great fit". Generic AI phrasing gets flagged, so be specific.
- If a company or role is given in TARGETING, reference it naturally in the opening hook.
  Otherwise open with a concrete hook tied to the work itself, not the job title.
- In the body, connect 2-3 of the candidate's most relevant real accomplishments to what
  this job actually needs. Show, don't assert.
- Keep it tight: 3 to 4 short paragraphs, roughly 250-350 words. Confident, warm, direct.
- Close with a clear, low-pressure call to action.

Output structure:
- greeting: a simple salutation, e.g. "Dear Hiring Team," (the exact addressee is set
  separately, so a generic greeting is fine here).
- body_paragraphs: 2 to 4 paragraphs, each as a separate item. No blank lines, numbering,
  greeting, sign-off, or contact details inside these.
- closing: a short sign-off phrase such as "Sincerely," or "Best regards,".
- signature: the candidate's full name from the RESUME, or "[Your Name]" if absent. Do
  not add titles, links, or contact lines.

RESUME:
{resume}

JOB DESCRIPTION:
{job_description}
"""


ATS_PROMPT = """You are an expert on Applicant Tracking Systems (ATS). Assess how well the
RESUME below would be parsed and understood by an ATS. Judge only the text content and
structure you can see — do NOT comment on images, colours, fonts, or file format, which are
checked separately.

For each area below, return a check object with:
- category: a short label.
- status: exactly one of "good", "warning", or "issue".
- detail: one sentence on what you actually found in THIS resume (specific, not generic).
- fix: one sentence on how to improve it (use "" when status is "good").

Assess these areas:
- Contact information: a clearly written name, email, and phone number.
- Section headings: standard, conventional headings (e.g., Experience, Education, Skills).
- Chronology and dates: reverse-chronological history with consistent, clear dates.
- Skills: present and reasonably concise, not an overstuffed keyword dump.
- Readability: short bullet points and plain text, no walls of text or unusual symbols.
- Quantified impact: concrete results in bullets where appropriate.

Rules:
- Base every detail strictly on what is actually in the RESUME. Do not invent problems or
  praise that the text does not support.
- Keep each detail and fix to a single sentence.
- Also write a one-sentence summary of the resume's overall ATS readiness.

RESUME:
{resume}
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


def _generate(prompt: str, schema: type, temperature: float = 0.2):
    """Call Gemini for structured JSON output, retrying briefly on transient errors.

    temperature: low (0.2) for consistent, repeatable analysis; higher (~0.7) for
    natural-sounding generated prose like cover letters.
    """
    for attempt in range(MAX_ATTEMPTS):
        try:
            response = _client().models.generate_content(
                model=MODEL,
                contents=prompt,
                config={
                    "temperature": temperature,
                    "response_mime_type": "application/json",
                    "response_schema": schema,
                },
            )
            # The SDK parses JSON into our model when response_schema is set.
            result = response.parsed
            if result is None:
                result = schema.model_validate_json(response.text)
            return result

        except errors.APIError as exc:
            is_last_attempt = attempt == MAX_ATTEMPTS - 1
            if exc.code in RETRYABLE_CODES:
                if not is_last_attempt:
                    time.sleep(2 ** attempt)  # back off: 1s, then 2s
                    continue
                raise RuntimeError(
                    "The AI service is busy right now. Please try again in a moment."
                ) from exc
            raise  # non-transient (bad key, bad request, etc.) — surface as-is

    raise RuntimeError("Gemini request failed after retries.")


def analyze_resume(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Call Gemini to analyze a resume against a job description."""
    prompt = PROMPT_TEMPLATE.format(
        resume=payload.resume,
        job_description=payload.job_description,
    )
    return _generate(prompt, AnalyzeResponse, temperature=0.2)


def _tidy_url(url: str) -> str:
    """Strip protocol/www/trailing slash so links read cleanly in the signature."""
    u = url.strip()
    for prefix in ("https://", "http://"):
        if u.lower().startswith(prefix):
            u = u[len(prefix):]
            break
    if u.lower().startswith("www."):
        u = u[4:]
    return u.rstrip("/")


def _targeting_block(req: CoverLetterRequest) -> str:
    """Summarize the company/role/manager for the prompt, or note none was given."""
    parts = []
    if req.company_name:
        parts.append(f"Company: {req.company_name.strip()}")
    if req.role_title:
        parts.append(f"Role: {req.role_title.strip()}")
    if req.hiring_manager:
        parts.append(f"Hiring manager: {req.hiring_manager.strip()}")
    return "\n".join(parts) if parts else "(none provided)"


def generate_cover_letter(req: CoverLetterRequest) -> CoverLetterResponse:
    """Call Gemini to write a tailored cover letter grounded in the resume.

    The model writes the prose; the greeting addressee, the candidate's name, and all
    contact details and links are assembled here so they are always exact and never
    invented or reworded by the model.
    """
    prompt = COVER_LETTER_PROMPT.format(
        resume=req.resume,
        job_description=req.job_description,
        targeting=_targeting_block(req),
    )
    draft = _generate(prompt, CoverLetterDraft, temperature=0.7)

    # Greeting: deterministic when we know the addressee, else the model's default.
    if req.hiring_manager:
        greeting = f"Dear {req.hiring_manager.strip()},"
    elif req.company_name:
        greeting = f"Dear Hiring Team at {req.company_name.strip()},"
    else:
        greeting = draft.greeting.strip()

    body = "\n\n".join(p.strip() for p in draft.body_paragraphs if p.strip())

    # Signature: user-provided facts win; links are rendered verbatim, never via the model.
    name = (req.full_name or draft.signature).strip()
    contact = " · ".join(
        v.strip() for v in (req.email, req.phone, req.location) if v and v.strip()
    )
    links = " · ".join(
        f"{item.label.strip()}: {_tidy_url(item.url)}"
        for item in req.links
        if item.url and item.url.strip() and item.label and item.label.strip()
    )

    signature_lines = [draft.closing.strip(), name]
    if contact:
        signature_lines.append(contact)
    if links:
        signature_lines.append(links)

    letter = f"{greeting}\n\n{body}\n\n" + "\n".join(signature_lines)
    return CoverLetterResponse(cover_letter=letter)


def check_ats(resume_text: str) -> ATSAIReport:
    """Ask Gemini to assess the resume's ATS readiness from its text content."""
    prompt = ATS_PROMPT.format(resume=resume_text)
    return _generate(prompt, ATSAIReport, temperature=0.2)