from io import BytesIO
from typing import List

from pypdf import PdfReader

from .gemini_client import GeminiClient


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(pdf_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(page.strip() for page in pages if page.strip())


def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> List[str]:
    normalized = " ".join(text.split())
    if not normalized:
        return []

    chunks: List[str] = []
    start = 0
    while start < len(normalized):
        end = min(start + chunk_size, len(normalized))
        chunks.append(normalized[start:end])
        if end == len(normalized):
            break
        start = max(end - overlap, 0)
    return chunks


async def create_chunk_embeddings(chunks: List[str]) -> List[List[float]]:
    if not chunks:
        return []
    client = GeminiClient()
    return await client.embed_texts(chunks)

