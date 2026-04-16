import { useState } from 'react'
import type { User } from '../types'
import type { ChatMessage, DocumentSummary } from '../types'
import { ChatWindow } from '../components/ChatWindow'
import { DocumentSidebar } from '../components/DocumentSidebar'
import { PDFViewer } from '../components/PDFViewer'
import { UploadPanel } from '../components/UploadPanel'

type AppPageProps = {
  user: User
  documents: DocumentSummary[]
  activeDocument: DocumentSummary | null
  messages: ChatMessage[]
  previewUrl: string | null
  loadingDocuments?: boolean
  loadingChat?: boolean
  uploading?: boolean
  error?: string | null
  onSelectDocument: (documentId: string) => void
  onUpload: (file: File, title: string) => Promise<void>
  onSendMessage: (message: string) => Promise<void>
  onSignOut: () => Promise<void>
  onDeleteDocument: (documentId: string) => Promise<void>
  onNewDocument: () => void
}

export function AppPage({
  user,
  documents,
  activeDocument,
  messages,
  previewUrl,
  loadingDocuments = false,
  loadingChat = false,
  uploading = false,
  error = null,
  onSelectDocument,
  onUpload,
  onSendMessage,
  onSignOut,
  onDeleteDocument,
  onNewDocument,
}: AppPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(true)

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="badge">Sensie</span>
          <h2>PDF explainer workspace</h2>
        </div>
        <div className="user-panel">
          <div style={{ textAlign: 'right' }}>
            <strong>
              {user.name ?? user.email ?? 'Signed in user'}
              <span style={{ marginLeft: '8px', fontSize: '11px', background: 'var(--accent)', color: '#000', padding: '2px 6px', borderRadius: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Free Tier</span>
            </strong>
            <p style={{ margin: 0 }}>{user.email}</p>
          </div>
          <button type="button" className="secondary" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      {error ? <div className="banner error-text">{error}</div> : null}

      <section className="workspace-grid">
        <div className={`left-column ${!isSidebarOpen ? 'closed' : ''}`}>
          <DocumentSidebar
            documents={documents}
            activeDocumentId={activeDocument?.id}
            loading={loadingDocuments}
            onSelect={onSelectDocument}
            onDelete={onDeleteDocument}
            onNew={onNewDocument}
          />
        </div>

        <div className="center-column" style={{ position: 'relative' }}>
          <button 
            type="button" 
            className="sidebar-toggle" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            title="Toggle Sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points={isSidebarOpen ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}></polyline></svg>
          </button>

          {activeDocument ? (
            <button 
              type="button" 
              className="preview-toggle" 
              onClick={() => setIsPreviewOpen(!isPreviewOpen)} 
              title="Toggle PDF Preview"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points={isPreviewOpen ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}></polyline></svg>
            </button>
          ) : null}
          {!activeDocument ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '500px' }}>
                <UploadPanel loading={uploading} onUpload={onUpload} />
              </div>
            </div>
          ) : (
            <ChatWindow
              document={activeDocument}
              messages={messages}
              loading={loadingChat}
              onSend={onSendMessage}
            />
          )}
        </div>

        {activeDocument ? (
          <div className={`right-column ${!isPreviewOpen ? 'closed' : ''}`}>
            <PDFViewer title={activeDocument?.title} url={previewUrl} />
          </div>
        ) : null}
      </section>
    </main>
  )
}

