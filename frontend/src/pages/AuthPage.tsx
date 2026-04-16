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
        <p style={{ marginBottom: '40px', lineHeight: 1.6, color: 'var(--text)' }}>
          Sign in with Google or GitHub, upload a PDF, and continue the same
          conversation any time you come back.
        </p>

        <div className="auth-actions">
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => onSignIn('google')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}
          >
            {loadingProvider === 'google' ? 'Connecting...' : (
              <>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M21.1 12.1c0-.7-.1-1.3-.2-1.9H12v3.7h5.2c-.2 1.2-.9 2.2-1.9 2.9v2.4h3c1.8-1.6 2.8-4 2.8-7.1z"></path>
                  <path d="M12 21.2c2.6 0 4.8-.8 6.4-2.3l-3-2.4c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.2v2.5C4.9 19.3 8.2 21.2 12 21.2z"></path>
                  <path d="M6.4 13.4c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V6.9H3.2C2.5 8.2 2 9.8 2 11.4s.5 3.2 1.2 4.5l3.2-2.5z"></path>
                  <path d="M12 5.6c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 2.6 14.6 1.7 12 1.7 8.2 1.7 4.9 3.6 3.2 6.9l3.2 2.5c.8-2.3 3-4.1 5.6-4.1z"></path>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          <button
            type="button"
            className="secondary"
            disabled={loadingProvider !== null}
            onClick={() => onSignIn('github')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}
          >
            {loadingProvider === 'github' ? 'Connecting...' : (
              <>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                Continue with GitHub
              </>
            )}
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

