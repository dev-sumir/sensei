import httpx
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def test_models():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("No GEMINI_API_KEY found")
        return

    async with httpx.AsyncClient() as client:
        print("Fetching available models...")
        response = await client.get(
            f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        )
        if response.status_code == 200:
            data = response.json()
            available = [m["name"] for m in data.get("models", [])]
            print("Available models containing 'flash':")
            for m in available:
                if "flash" in m.lower():
                    print(" -", m)
        else:
            print("Failed to list models:", response.status_code, response.text)

if __name__ == "__main__":
    asyncio.run(test_models())
