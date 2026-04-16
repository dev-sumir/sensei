import type { Session } from '@supabase/supabase-js'

import type {
  ChatResponse,
  DocumentSummary,
  UploadResponse,
  User,
} from '../types'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function apiFetch<T>(
  session: Session,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }

  return response.json() as Promise<T>
}

export function getCurrentUser(session: Session) {
  return apiFetch<User>(session, '/auth/me')
}

export function listDocuments(session: Session) {
  return apiFetch<DocumentSummary[]>(session, '/documents/')
}

export function getDocumentHistory(session: Session, documentId: string) {
  return apiFetch<UploadResponse>(session, `/documents/${documentId}/history`)
}

export async function uploadDocument(
  session: Session,
  file: File,
  title: string,
) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)

  return apiFetch<UploadResponse>(session, '/documents/upload', {
    method: 'POST',
    body: formData,
  })
}

export function sendMessage(
  session: Session,
  documentId: string,
  message: string,
) {
  return apiFetch<ChatResponse>(session, '/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document_id: documentId, message }),
  })
}

export function deleteDocument(session: Session, documentId: string) {
  return apiFetch<void>(session, `/documents/${documentId}`, {
    method: 'DELETE',
  })
}

export function getDocumentPreview(session: Session, documentId: string) {
  return apiFetch<{ url: string }>(session, `/documents/${documentId}/preview`)
}
