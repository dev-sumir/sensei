from typing import Any, Sequence

import asyncpg
from pydantic import BaseModel

from ..config import get_settings

class DatabaseSettings(BaseModel):
    url: str


def get_db_settings() -> DatabaseSettings:
    url = get_settings().supabase_db_url
    if not url:
        raise RuntimeError("SUPABASE_DB_URL is not set")
    return DatabaseSettings(url=url)


_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is not None:
        return _pool
    settings = get_db_settings()
    _pool = await asyncpg.create_pool(dsn=settings.url, min_size=1, max_size=5)
    return _pool


async def fetch_rows(query: str, *args: Any) -> Sequence[asyncpg.Record]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)


async def execute(query: str, *args: Any) -> str:
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)

