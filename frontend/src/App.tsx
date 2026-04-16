import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import './App.css'
import { AppPage } from './pages/AppPage'
import { AuthPage } from './pages/AuthPage'
import {
  getCurrentUser,
  getDocumentHistory,
  listDocuments,
  uploadDocument,
  deleteDocument,
} from './lib/api'
import { supabase } from './lib/supabase'
import type { ChatMessage, DocumentSummary, User } from './types'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState<'google' | 'github' | null>(null)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeDocumentId) ?? null,
    [activeDocumentId, documents],
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setUser(null)
      setDocuments([])
      setMessages([])
      setActiveDocumentId(null)
      setPreviewUrl(null)
      return
    }

    void bootstrapWorkspace(session)
  }, [session])

  useEffect(() => {
    if (!activeDocument?.id || !session) {
      setPreviewUrl(null)
      return
    }

    void import('./lib/api').then(({ getDocumentPreview }) => {
      getDocumentPreview(session, activeDocument.id)
        .then((data) => setPreviewUrl(data.url))
        .catch(() => setPreviewUrl(null))
    })
  }, [activeDocument?.id, session])

  async function bootstrapWorkspace(currentSession: Session) {
    try {
      setError(null)
      setLoadingDocuments(true)
      const [currentUser, userDocuments] = await Promise.all([
        getCurrentUser(currentSession),
        listDocuments(currentSession),
      ])
      setUser(currentUser)
      setDocuments(userDocuments)

      if (userDocuments.length > 0) {
        await selectDocument(currentSession, userDocuments[0].id)
      }
    } catch (bootstrapError) {
      setError(
        bootstrapError instanceof Error
          ? bootstrapError.message
          : 'Failed to load workspace.',
      )
    } finally {
      setLoadingDocuments(false)
    }
  }

  async function selectDocument(currentSession: Session, documentId: string) {
    if (activeDocumentId === documentId) return
    setActiveDocumentId(documentId)
    setMessages([])
    setLoadingChat(true)
    setError(null)
    try {
      const payload = await getDocumentHistory(currentSession, documentId)
      setMessages(payload.history)
      setDocuments((previous) =>
        previous.map((document) =>
          document.id === payload.document.id ? payload.document : document,
        ),
      )
    } catch (selectError) {
      setError(
        selectError instanceof Error
          ? selectError.message
          : 'Failed to load document history.',
      )
    } finally {
      setLoadingChat(false)
    }
  }

  async function handleSignIn(provider: 'google' | 'github') {
    setAuthLoading(provider)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (signInError) {
      setError(signInError.message)
      setAuthLoading(null)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setAuthLoading(null)
  }

  async function handleUpload(file: File, title: string) {
    if (!session) {
      return
    }

    setUploading(true)
    setError(null)
    try {
      const payload = await uploadDocument(session, file, title)
      setDocuments((previous) => [payload.document, ...previous])
      setActiveDocumentId(payload.document.id)
      setMessages(payload.history)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : 'Upload failed.',
      )
    } finally {
      setUploading(false)
    }
  }

  async function handleSendMessage(message: string) {
    if (!session || !activeDocument) {
      return
    }

    const tempId = `temp-${Date.now()}`
    const tempUserMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content: message,
    }
    
    setMessages((prev) => [...prev, tempUserMessage])
    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === activeDocument.id)
      if (!doc) return prev
      const rest = prev.filter((d) => d.id !== activeDocument.id)
      return [doc, ...rest]
    })

    setLoadingChat(true)
    setError(null)
    try {
      const { sendMessage } = await import('./lib/api')
      const response = await sendMessage(session, activeDocument.id, message)
      
      const newHistory = response.history.map((m, index) => {
        if (index === response.history.length - 1 && m.role === 'assistant') {
          return { ...m, animate: true }
        }
        return m
      })
      
      setMessages(newHistory)
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : 'Chat failed.')
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setLoadingChat(false)
    }
  }

  async function handleDeleteDocument(documentId: string) {
    if (!session) {
      return
    }

    try {
      await deleteDocument(session, documentId)
      setDocuments((previous) => previous.filter((doc) => doc.id !== documentId))
      
      if (activeDocumentId === documentId) {
        setMessages([])
        setActiveDocumentId(null)
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed.')
    }
  }

  function handleNewDocument() {
    setActiveDocumentId(null)
    setMessages([])
    setPreviewUrl(null)
  }

  if (!session) {
    return <AuthPage loadingProvider={authLoading} onSignIn={handleSignIn} />
  }

  if (!user) {
    return <main className="loading-screen">Loading Sensie...</main>
  }

  return (
    <AppPage
      user={user}
      documents={documents}
      activeDocument={activeDocument}
      messages={messages}
      previewUrl={previewUrl}
      loadingDocuments={loadingDocuments}
      loadingChat={loadingChat}
      uploading={uploading}
      error={error}
      onSelectDocument={(documentId) => void selectDocument(session, documentId)}
      onUpload={handleUpload}
      onSendMessage={handleSendMessage}
      onSignOut={handleSignOut}
      onDeleteDocument={handleDeleteDocument}
      onNewDocument={handleNewDocument}
    />
  )
}

export default App
