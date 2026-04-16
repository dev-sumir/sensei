import { useState } from 'react'

type UploadPanelProps = {
  disabled?: boolean
  loading?: boolean
  onUpload: (file: File, title: string) => Promise<void>
}

export function UploadPanel({
  disabled = false,
  loading = false,
  onUpload,
}: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setError('Choose a PDF file first.')
      return
    }

    setError(null)
    await onUpload(file, title.trim() || file.name.replace(/\.pdf$/i, ''))
    setFile(null)
    setTitle('')
    event.currentTarget.reset()
  }

  return (
    <form className="panel upload-panel" onSubmit={handleSubmit}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3>Upload a PDF</h3>
        <p className="muted">Upload one document, then start chatting with it right away.</p>
      </div>

      <div 
        className="drop-zone"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <p><strong>Click to choose a PDF</strong></p>
        <small className="muted" style={{ marginTop: '8px' }}>{file ? file.name : 'Max file size 50MB'}</small>
        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={disabled || loading}
          style={{ display: 'none' }}
        />
      </div>

      <label className="field">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Optional: Enter a title..."
          disabled={disabled || loading}
          style={{ textAlign: 'center' }}
        />
      </label>

      {error ? <p className="error-text" style={{ textAlign: 'center' }}>{error}</p> : null}

      <button type="submit" disabled={disabled || loading || !file} style={{ width: '100%', marginTop: '8px' }}>
        {loading ? 'Uploading & Processing...' : 'Upload & Start Chat'}
      </button>
    </form>
  )
}

