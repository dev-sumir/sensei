import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

import type { ChatMessage, DocumentSummary } from '../types'

type ChatWindowProps = {
  document: DocumentSummary | null
  messages: ChatMessage[]
  loading?: boolean
  onSend: (message: string) => Promise<void>
}

function TypewriterMarkdown({ text, animate }: { text: string, animate?: boolean }) {
  const [displayedText, setDisplayedText] = useState(animate ? '' : text)

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text)
      return
    }
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 3;
      if (currentIndex >= text.length) {
        setDisplayedText(text);
        clearInterval(interval);
      } else {
        setDisplayedText(text.slice(0, currentIndex));
      }
    }, 10);
    
    return () => clearInterval(interval);
  }, [text, animate]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
}

export function ChatWindow({
  document,
  messages,
  loading = false,
  onSend,
}: ChatWindowProps) {
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = draft.trim()
    if (!value || !document || loading) {
      return
    }
    setDraft('')
    await onSend(value)
  }

  return (
    <section className="panel chat-window">
      <div className="chat-header">
        <div>
          <h3>{document?.title ?? 'Select a PDF'}</h3>
          <p>
            {document
              ? 'One PDF is active at a time. Switch documents from the sidebar.'
              : 'Upload a PDF or open an existing one to start chatting.'}
          </p>
        </div>
      </div>

      <div className="message-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Ask for a summary, key points, definitions, or explanations.</p>
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.id ?? `${message.role}-${message.content}`} className={`message ${message.role}`}>
              <span className="message-role">{message.role === 'user' ? 'You' : 'Sensie'}</span>
              <div className="markdown-body">
                <TypewriterMarkdown text={message.content} animate={message.animate} />
              </div>
            </article>
          ))
        )}
        {loading && (
          <article className="message assistant">
            <span className="message-role">Sensie</span>
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </article>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                if (draft.trim() && document?.status === 'ready' && !loading) {
                  handleSubmit(event as any)
                }
              }
            }}
            placeholder="Ask something about the active PDF..."
            disabled={!document || loading || document.status !== 'ready'}
            rows={1}
            className="chat-input"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!document || loading || !draft.trim() || document.status !== 'ready'}
            title="Send message"
          >
            {loading ? (
              <span className="spinner">...</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

