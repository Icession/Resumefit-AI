"""Extract plain text from uploaded resume files (.pdf or .txt)."""
from io import BytesIO

import pdfplumber


def extract_text(filename: str, data: bytes) -> str:
    """Return plain text from an uploaded .pdf or .txt file."""
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        return _extract_pdf(data)
    if name.endswith(".txt"):
        return _extract_txt(data)
    raise ValueError("Unsupported file type. Please upload a .pdf or .txt file.")


def _extract_txt(data: bytes) -> str:
    for encoding in ("utf-8", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="ignore")


def _extract_pdf(data: bytes) -> str:
    with pdfplumber.open(BytesIO(data)) as pdf:
        text = "\n".join((page.extract_text() or "") for page in pdf.pages).strip()
    if not text:
        raise ValueError(
            "Couldn't read any text from this PDF. If it's a scanned image, "
            "paste the text manually instead."
        )
    return text