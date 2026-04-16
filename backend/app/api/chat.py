from fastapi import APIRouter, Depends, HTTPException

from ..db.repositories import (
    create_message,
    get_document_for_user,
    get_messages_for_conversation,
    get_or_create_conversation,
)
from ..deps import get_current_user
from ..schemas import ChatMessage, ChatRequest, ChatResponse, User
from ..services.gemini_client import GeminiClient
from ..services.retrieval import retrieve_relevant_chunks


router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat_with_document(
    payload: ChatRequest, current_user: User = Depends(get_current_user)
) -> ChatResponse:
    document = await get_document_for_user(payload.document_id, current_user.id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document["status"] != "ready":
        raise HTTPException(status_code=400, detail="Document is not ready for chat")

    conversation = await get_or_create_conversation(
        current_user.id, payload.document_id, title=document["title"]
    )
    await create_message(conversation["id"], "user", payload.message)

    previous_messages = await get_messages_for_conversation(conversation["id"])
    relevant_chunks = await retrieve_relevant_chunks(payload.document_id, payload.message)
    answer = await GeminiClient().answer_question(
        payload.message,
        relevant_chunks,
        [{"role": message["role"], "content": message["content"]} for message in previous_messages],
    )
    await create_message(conversation["id"], "assistant", answer)
    final_history = await get_messages_for_conversation(conversation["id"])

    return ChatResponse(
        conversation_id=conversation["id"],
        answer=answer,
        history=[ChatMessage(**message) for message in final_history],
    )

