from typing import List, Optional

from pydantic import BaseModel


class User(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class Document(BaseModel):
    id: str
    user_id: str
    title: str
    storage_path: str
    status: str
    created_at: Optional[str] = None


class DocumentSummary(Document):
    conversation_id: Optional[str] = None
    last_message_preview: Optional[str] = None


class ChatMessage(BaseModel):
    id: Optional[str] = None
    role: str
    content: str
    created_at: Optional[str] = None


class ChatRequest(BaseModel):
    document_id: str
    message: str


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    history: List[ChatMessage]


class UploadResponse(BaseModel):
    document: DocumentSummary
    history: List[ChatMessage]

