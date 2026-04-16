from typing import List

from ..db.supabase import fetch_rows
from .gemini_client import GeminiClient


def _vector_literal(values: List[float]) -> str:
    return "[" + ",".join(f"{value:.8f}" for value in values) + "]"


async def retrieve_relevant_chunks(document_id: str, query: str, limit: int = 5) -> List[str]:
    embedding = (await GeminiClient().embed_texts([query]))[0]
    vector = _vector_literal(embedding)
    rows = await fetch_rows(
        """
        select chunk_text
        from document_chunks
        where document_id = $1
        order by embedding <-> $2::vector
        limit $3
        """,
        document_id,
        vector,
        limit,
    )
    return [row["chunk_text"] for row in rows]

