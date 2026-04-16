type AuthPageProps = {
  loadingProvider?: 'google' | 'github' | null
  onSignIn: (provider: 'google' | 'github') => Promise<void>
}

export function AuthPage({ loadingProvider = null, onSignIn }: AuthPageProps) {
  return (
    <>
    <main className="auth-page">
      <section className="auth-card">
        <span className="badge">Sensie</span>
        <h1>Talk to your PDFs</h1>
        <p>
          Sign in with Google or GitHub, upload a PDF, and continue the same
          conversation any time you come back.
        </p>

        <div className="auth-actions">
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => onSignIn('google')}
          >
            {loadingProvider === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>
          <button
            type="button"
            className="secondary"
            disabled={loadingProvider !== null}
            onClick={() => onSignIn('github')}
          >
            {loadingProvider === 'github' ? 'Connecting...' : 'Continue with GitHub'}
          </button>
        </div>
      </section>
    </main>
    <footer style={{ padding: '32px', textAlign: 'center', color: 'var(--text)', fontSize: '14px', opacity: 0.7 }}>
      <p style={{ margin: 0, letterSpacing: '0.5px' }}>
        Designed & Built by <strong>Sumir Malhotra</strong>
      </p>
      <div style={{ marginTop: '8px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <a href="https://github.com/dev-sumir" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>GitHub</a>
        <a href="https://www.linkedin.com/in/sumir-malhotra/" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>LinkedIn</a>
      </div>
    </footer>
    </>
  )
}

