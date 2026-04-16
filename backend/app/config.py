import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel


load_dotenv()


class Settings(BaseModel):
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_db_url: str = ""
    gemini_api_key: str = ""
    frontend_url: str = "http://localhost:5173"
    storage_bucket: str = "pdfs"


@lru_cache
def get_settings() -> Settings:
    return Settings(
        supabase_url=os.getenv("SUPABASE_URL", "").rstrip("/"),
        supabase_anon_key=os.getenv("SUPABASE_ANON_KEY", ""),
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
        supabase_db_url=os.getenv("SUPABASE_DB_URL", ""),
        gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
        frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173"),
        storage_bucket=os.getenv("SUPABASE_STORAGE_BUCKET", "pdfs"),
    )

