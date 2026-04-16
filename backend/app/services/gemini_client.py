from typing import List

import httpx

from ..config import get_settings


class GeminiClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not self.settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")

        async with httpx.AsyncClient(timeout=60.0) as client:
            embeddings: List[List[float]] = []
            for text in texts:
                response = await client.post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
                    params={"key": self.settings.gemini_api_key},
                    json={
                        "model": "models/gemini-embedding-001",
                        "content": {"parts": [{"text": text}]},
                        "outputDimensionality": 768,
                    },
                )
                response.raise_for_status()
                payload = response.json()
                embeddings.append(payload["embedding"]["values"])
        return embeddings

    async def answer_question(
        self,
        question: str,
        context_chunks: List[str],
        previous_messages: List[dict[str, str]],
    ) -> str:
        if not self.settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")

        context = "\n\n".join(
            f"Chunk {index + 1}:\n{chunk}" for index, chunk in enumerate(context_chunks)
        )
        history = "\n".join(
            f"{message['role']}: {message['content']}" for message in previous_messages[-8:]
        )
        prompt = (
            "You are Sensie, a PDF explainer assistant. Answer only from the provided PDF context. "
            "If the answer is not present, say that the PDF does not contain enough information.\n\n"
            f"Conversation so far:\n{history or 'No previous messages.'}\n\n"
            f"Relevant PDF context:\n{context or 'No context was found.'}\n\n"
            f"User question: {question}"
        )
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
                    params={"key": self.settings.gemini_api_key},
                    json={"contents": [{"parts": [{"text": prompt}]}]},
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                return f"Google API Limit Reached. Details: {e.response.text}"
            return f"AI Model Error: {e.response.status_code} - {e.response.text}"
        payload = response.json()
        candidates = payload.get("candidates", [])
        if not candidates:
            return "I could not generate an answer from the selected PDF."
        parts = candidates[0].get("content", {}).get("parts", [])
        text_parts = [part.get("text", "") for part in parts if part.get("text")]
        return "\n".join(text_parts).strip() or "I could not generate an answer."

