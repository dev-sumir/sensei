import type { DocumentSummary } from '../types'

type DocumentSidebarProps = {
  documents: DocumentSummary[]
  activeDocumentId?: string
  loading?: boolean
  onSelect: (documentId: string) => void
  onDelete: (documentId: string) => void
  onNew: () => void
}

export function DocumentSidebar({
  documents,
  activeDocumentId,
  loading = false,
  onSelect,
  onDelete,
  onNew,
}: DocumentSidebarProps) {
  return (
    <aside className="panel sidebar">
      <div className="sidebar-header">
        <h3>Your PDFs</h3>
        <span>{documents.length}/5</span>
      </div>

      <button
        type="button"
        onClick={onNew}
        disabled={documents.length >= 5}
        style={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Chat / Upload
      </button>

      {documents.length >= 5 && (
        <p className="error-text" style={{ textAlign: 'center', marginBottom: '16px', fontSize: '12px' }}>
          Limit reached. Delete a chat to start a new one.
        </p>
      )}

      {loading ? <p>Loading your documents...</p> : null}
      {!loading && documents.length === 0 ? (
        <p className="muted">Your uploaded PDFs will appear here.</p>
      ) : null}

      <div className="document-list">
        {documents.map((document) => (
          <div
            key={document.id}
            className={`document-item ${document.id === activeDocumentId ? 'active' : ''} ${document.status}`}
            onClick={() => onSelect(document.id)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'grid', gap: '8px', minWidth: 0, paddingRight: '12px' }}>
              <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{document.title}</strong>
              <small>{document.last_message_preview ?? 'No messages yet'}</small>
            </div>
            <button
              className="secondary"
              style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'grid', placeItems: 'center', flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Are you sure you want to delete this PDF?')) {
                  onDelete(document.id)
                }
              }}
              title="Delete PDF"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text)', fontSize: '12px', opacity: 0.7 }}>
        <p style={{ margin: 0, letterSpacing: '0.5px' }}>
          Designed & Built by <strong>Sumir Malhotra</strong>
        </p>
        <div style={{ marginTop: '6px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="https://github.com/dev-sumir" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>GitHub</a>
          <a href="https://www.linkedin.com/in/sumir-malhotra/" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>LinkedIn</a>
        </div>
      </footer>
    </aside>
  )
}

