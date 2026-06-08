"""ATS readiness: deterministic file-structure checks + AI content report."""
from io import BytesIO

import pdfplumber

from app.schemas import ATSCheckItem, ATSReport
from app.services.gemini import check_ats

# Score penalties per check status.
_PENALTY = {"issue": 15, "warning": 6, "good": 0}


def analyze_pdf_structure(data: bytes) -> list[ATSCheckItem]:
    """Inspect the actual PDF for things that break ATS parsing.

    These are facts read straight from the file (not the model): whether any text
    is extractable, and whether the file leans on images or tables for layout.
    """
    try:
        with pdfplumber.open(BytesIO(data)) as pdf:
            pages = pdf.pages
            text = "\n".join((page.extract_text() or "") for page in pages)
            image_count = sum(len(page.images) for page in pages)
            table_count = sum(len(page.find_tables()) for page in pages)
            page_count = len(pages)
    except Exception:
        return [
            ATSCheckItem(
                category="File parseability",
                status="issue",
                detail="This PDF could not be opened or read.",
                fix="Re-export a standard, text-based PDF from your word processor.",
            )
        ]

    checks: list[ATSCheckItem] = []

    if len(text.strip()) < 100:
        checks.append(
            ATSCheckItem(
                category="Text extraction",
                status="issue",
                detail="Little or no selectable text — this looks like a scanned image.",
                fix="Export a text-based PDF from Word or Google Docs instead of scanning "
                "or exporting as an image.",
            )
        )

    if table_count > 0:
        checks.append(
            ATSCheckItem(
                category="Tables",
                status="issue",
                detail=f"Found {table_count} table-like layout(s); ATS often scramble "
                "the contents of tables.",
                fix="Replace tables with simple, single-column text.",
            )
        )

    if image_count > 0:
        checks.append(
            ATSCheckItem(
                category="Images and graphics",
                status="warning",
                detail=f"Contains {image_count} embedded image(s); most ATS ignore "
                "image content entirely.",
                fix="Avoid logos, photos, charts, and icons — keep everything as text.",
            )
        )

    if page_count > 2:
        checks.append(
            ATSCheckItem(
                category="Length",
                status="warning",
                detail=f"The file is {page_count} pages; early-career resumes are "
                "usually one page.",
                fix="Trim to the most relevant single page where you can.",
            )
        )

    return checks


def _score(checks: list[ATSCheckItem]) -> int:
    """Transparent score: start at 100 and subtract per warning/issue."""
    penalty = sum(_PENALTY.get(c.status.lower(), 0) for c in checks)
    return max(0, 100 - penalty)


def assess_resume(resume_text: str, pdf_data: bytes | None) -> ATSReport:
    """Combine deterministic file checks (if a PDF) with the AI content report."""
    structural = analyze_pdf_structure(pdf_data) if pdf_data else []
    ai = check_ats(resume_text)
    checks = structural + ai.checks
    return ATSReport(overall_score=_score(checks), checks=checks, summary=ai.summary)