import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      setUser(data.user)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent font-display text-[18px] font-bold text-white">ഓ</span>
          <h1 className="font-display text-[22px] font-bold text-ink">Welcome back</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-soft">Log in to access your memory.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink">Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink">Password</label>
            <input id="password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-[14px] font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-[13.5px] text-ink-soft">
          New to Orma?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:text-accent-dark">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
