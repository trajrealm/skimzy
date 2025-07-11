import fitz  # PyMuPDF
from tempfile import NamedTemporaryFile
import boto3


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts text content from a PDF using PyMuPDF."""
    doc = fitz.open(pdf_path)
    full_text = "\n".join([page.get_text() for page in doc])
    doc.close()
    return full_text.strip()
