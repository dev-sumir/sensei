export type User = {
  id: string
  email?: string | null
  name?: string | null
  avatar_url?: string | null
}

export type ChatMessage = {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
  animate?: boolean
}

export type DocumentSummary = {
  id: string
  user_id: string
  title: string
  storage_path: string
  status: string
  created_at?: string
  conversation_id?: string | null
  last_message_preview?: string | null
}

export type UploadResponse = {
  document: DocumentSummary
  history: ChatMessage[]
}

export type ChatResponse = {
  conversation_id: string
  answer: string
  history: ChatMessage[]
}

