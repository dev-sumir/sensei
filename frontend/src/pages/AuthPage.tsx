type AuthPageProps = {
  loadingProvider?: 'google' | 'github' | null
  onSignIn: (provider: 'google' | 'github') => Promise<void>
}

export function AuthPage({ loadingProvider = null, onSignIn }: AuthPageProps) {
  return (
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
  )
}

