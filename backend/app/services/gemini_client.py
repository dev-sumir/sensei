import asyncio
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
                max_retries = 3
                for attempt in range(max_retries):
                    try:
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
                        break
                    except httpx.HTTPStatusError as e:
                        if e.response.status_code in (429, 503, 500) and attempt < max_retries - 1:
                            await asyncio.sleep(1.0 * (2 ** attempt))
                            continue
                        raise
                    except httpx.RequestError as e:
                        if attempt < max_retries - 1:
                            await asyncio.sleep(1.0 * (2 ** attempt))
                            continue
                        raise
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
        models = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash"
        ]
        
        response = None
        last_error = None
        success = False

        for model_name in models:
            max_retries = 2
            for attempt in range(max_retries):
                try:
                    async with httpx.AsyncClient(timeout=60.0) as client:
                        response = await client.post(
                            f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent",
                            params={"key": self.settings.gemini_api_key},
                            json={"contents": [{"parts": [{"text": prompt}]}]},
                        )
                        response.raise_for_status()
                        success = True
                        break
                except httpx.HTTPStatusError as e:
                    last_error = e
                    if e.response.status_code in (429, 503, 500) and attempt < max_retries - 1:
                        await asyncio.sleep(1.0 * (2 ** attempt))
                        continue
                    break # Break retry loop, try next model
                except httpx.RequestError as e:
                    last_error = e
                    if attempt < max_retries - 1:
                        await asyncio.sleep(1.0 * (2 ** attempt))
                        continue
                    break # Break retry loop, try next model
            
            if success:
                break
        
        if not success:
            if isinstance(last_error, httpx.HTTPStatusError):
                if last_error.response.status_code == 429:
                    return f"Google API Limit Reached. Details: {last_error.response.text}"
                return f"AI Model Error: {last_error.response.status_code} - {last_error.response.text}"
            return f"AI Network Error: {str(last_error)}"
        payload = response.json()
        candidates = payload.get("candidates", [])
        if not candidates:
            return "I could not generate an answer from the selected PDF."
        parts = candidates[0].get("content", {}).get("parts", [])
        text_parts = [part.get("text", "") for part in parts if part.get("text")]
        return "\n".join(text_parts).strip() or "I could not generate an answer."

