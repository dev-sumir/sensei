from pathlib import Path
from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ..config import get_settings
from ..db.repositories import (
    create_document,
    create_or_update_profile,
    get_document_for_user,
    get_documents_for_user,
    get_messages_for_conversation,
    get_or_create_conversation,
    store_document_chunks,
    update_document_status,
    delete_document_db,
)
from ..deps import get_current_user
from ..schemas import ChatMessage, DocumentSummary, UploadResponse, User
from ..services.pdf_ingestion import (
    chunk_text,
    create_chunk_embeddings,
    extract_text_from_pdf,
)


router = APIRouter()


@router.get("/", response_model=list[DocumentSummary])
async def list_documents(current_user: User = Depends(get_current_user)) -> list[DocumentSummary]:
    rows = await get_documents_for_user(current_user.id)
    return [DocumentSummary(**row) for row in rows]


@router.get("/{document_id}/history", response_model=UploadResponse)
async def get_document_history(
    document_id: str, current_user: User = Depends(get_current_user)
) -> UploadResponse:
    document = await get_document_for_user(document_id, current_user.id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    conversation = await get_or_create_conversation(
        current_user.id, document_id, title=document["title"]
    )
    messages = await get_messages_for_conversation(conversation["id"])

    return UploadResponse(
        document=DocumentSummary(**document, conversation_id=conversation["id"]),
        history=[ChatMessage(**message) for message in messages],
    )


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: User = Depends(get_current_user),
) -> UploadResponse:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=500, detail="Supabase storage is not configured")

    user_docs = await get_documents_for_user(current_user.id)
    if len(user_docs) >= 5:
        raise HTTPException(status_code=403, detail="Free tier is limited to 5 documents. Please delete an older chat to continue.")

    await create_or_update_profile(
        current_user.id,
        current_user.email,
        current_user.name,
        current_user.avatar_url,
    )

    pdf_bytes = await file.read()
    storage_name = f"{current_user.id}/{uuid4()}-{Path(file.filename or title).name}"
    storage_path = f"{settings.storage_bucket}/{storage_name}"

    async with httpx.AsyncClient(timeout=120.0) as client:
        storage_response = await client.post(
            f"{settings.supabase_url}/storage/v1/object/{storage_path}",
            headers={
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "apikey": settings.supabase_service_role_key,
                "x-upsert": "false",
                "content-type": "application/pdf",
            },
            content=pdf_bytes,
        )
        if storage_response.status_code >= 400:
            print("SUPABASE STORAGE ERROR:", storage_response.status_code, storage_response.text)
        storage_response.raise_for_status()

    document = await create_document(current_user.id, title, storage_name, "processing")

    try:
        extracted_text = extract_text_from_pdf(pdf_bytes)
        chunks = chunk_text(extracted_text)
        embeddings = await create_chunk_embeddings(chunks)
        await store_document_chunks(document["id"], chunks, embeddings)
        await update_document_status(document["id"], "ready")
        document["status"] = "ready"
    except Exception as exc:
        await update_document_status(document["id"], "failed")
        raise HTTPException(status_code=500, detail=f"Failed to ingest PDF: {exc}") from exc

    conversation = await get_or_create_conversation(
        current_user.id, document["id"], title=document["title"]
    )

    return UploadResponse(
        document=DocumentSummary(**document, conversation_id=conversation["id"]),
        history=[],
    )


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str, current_user: User = Depends(get_current_user)
) -> None:
    document = await get_document_for_user(document_id, current_user.id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    settings = get_settings()
    if settings.supabase_url and settings.supabase_service_role_key:
        async with httpx.AsyncClient(timeout=60.0) as client:
            storage_path = document["storage_path"]
            storage_response = await client.delete(
                f"{settings.supabase_url}/storage/v1/object/{settings.storage_bucket}/{storage_path}",
                headers={
                    "Authorization": f"Bearer {settings.supabase_service_role_key}",
                    "apikey": settings.supabase_service_role_key,
                },
            )
            # We don't raise for status here in case the file was already manually deleted

    await delete_document_db(document_id, current_user.id)

@router.get("/{document_id}/preview")
async def get_document_preview(
    document_id: str, current_user: User = Depends(get_current_user)
) -> dict[str, str]:
    document = await get_document_for_user(document_id, current_user.id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    settings = get_settings()
    if settings.supabase_url and settings.supabase_service_role_key:
        async with httpx.AsyncClient(timeout=60.0) as client:
            storage_path = document["storage_path"]
            res = await client.post(
                f"{settings.supabase_url}/storage/v1/object/sign/{settings.storage_bucket}/{storage_path}",
                headers={
                    "Authorization": f"Bearer {settings.supabase_service_role_key}",
                    "apikey": settings.supabase_service_role_key,
                },
                json={"expiresIn": 3600}
            )
            if res.status_code == 200:
                signed_url_path = res.json().get("signedURL")
                if signed_url_path:
                    return {"url": f"{settings.supabase_url}/storage/v1{signed_url_path}"}
    raise HTTPException(status_code=500, detail="Could not generate preview URL")
