import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function LoginPage() {
  useDocumentTitle('Sign in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Accounts and sessions follow with the backend in milestone 3.
    setSubmitted(true)
    setPassword('')
  }

  return (
    <main id="main" className="auth">
      <div className="container">
        <section className="form-card auth-card" aria-labelledby="login-title">
          <h1 id="login-title">Sign in</h1>
          <p className="auth-intro">For publishers and organization managers. Searching advisories works without an account.</p>

          {submitted && (
            <p className="notice notice-info" role="status">
              Sign-in is not available yet. Accounts for {email} and other publishers follow with the backend.
            </p>
          )}

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="choice">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <label htmlFor="remember">Stay signed in on this device</label>
            </div>

            <button className="button" type="submit">Sign in</button>
          </form>

          <p className="auth-switch">No account yet? <Link to="/register">Register your organization</Link></p>
        </section>
      </div>
    </main>
  )
}
