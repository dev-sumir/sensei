type PDFViewerProps = {
  title?: string
  url?: string | null
}

export function PDFViewer({ title, url }: PDFViewerProps) {
  return (
    <section className="panel pdf-viewer">
      <div className="viewer-header">
        <h3>Preview</h3>
        {url ? (
          <a href={url} target="_blank" rel="noreferrer">
            Open full PDF
          </a>
        ) : null}
      </div>

      {url ? (
        <iframe src={`${url}#view=FitH`} title={title ?? 'PDF preview'} className="viewer-frame" style={{ width: '100%', height: '100%' }} />
      ) : (
        <div className="empty-state">
          <p>Pick a document to preview it here.</p>
        </div>
      )}
    </section>
  )
}

