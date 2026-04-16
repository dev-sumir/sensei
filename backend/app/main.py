from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth, documents, chat
from .config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Sensie Backend", version="0.1.0")

    raw_origins = settings.frontend_url.split(",")
    origins = [
        origin.strip().rstrip("/")
        for origin in raw_origins
        if origin.strip() and origin.strip() != "*"
    ]
    if "http://localhost:5173" not in origins:
        origins.append("http://localhost:5173")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict:
        return {"status": "ok"}

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(documents.router, prefix="/documents", tags=["documents"])
    app.include_router(chat.router, prefix="/chat", tags=["chat"])

    return app


app = create_app()

