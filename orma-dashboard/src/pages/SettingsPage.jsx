import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { logout, getToken } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={['relative h-6 w-11 flex-shrink-0 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-border'].join(' ')}>
      <span className={['absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5'].join(' ')} />
    </button>
  )
}

export default function SettingsPage() {
  const [autoSummary, setAutoSummary] = useState(true)
  const [aiAnalysis, setAiAnalysis] = useState(true)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [reanalyzeMsg, setReanalyzeMsg] = useState('')
  const [backendStatus, setBackendStatus] = useState(null) // null | 'ok' | 'no_key' | 'offline'
  const { logout: ctxLogout } = useAuth()
  const navigate = useNavigate()

  // Check backend + key status on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then(r => setBackendStatus(r.data.groqConfigured ? 'ok' : 'no_key'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  async function handleReanalyze() {
    setReanalyzing(true)
    setReanalyzeMsg('')
    try {
      const res = await axios.post(
        'http://localhost:5000/api/captures/reanalyze',
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )
      if (res.data.queued === 0) {
        setReanalyzeMsg('✓ All captures already have vision descriptions.')
      } else {
        setReanalyzeMsg(`✓ Queued ${res.data.queued} captures. Watch the backend terminal for [Vision] logs.`)
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error'
      setReanalyzeMsg(`✗ ${msg}`)
    } finally {
      setReanalyzing(false)
    }
  }

  function handleLogout() {
    logout()
    ctxLogout()
    navigate('/')
  }

  const statusBadge = {
    ok: { text: '✓ Connected & AI ready', cls: 'bg-green-50 border-green-200 text-green-700' },
    no_key: { text: '⚠ Backend running — Groq key missing', cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    offline: { text: '✗ Backend offline (start with: node server.js)', cls: 'bg-red-50 border-red-200 text-red-700' },
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="font-display text-[22px] font-bold text-ink">Settings</h1>

      {/* Backend status */}
      {backendStatus && (
        <div className={`rounded-xl border px-4 py-3 text-[13px] font-medium ${statusBadge[backendStatus].cls}`}>
          {statusBadge[backendStatus].text}
        </div>
      )}

      {/* AI toggles */}
      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {[
          { label: 'AI Summaries', desc: 'Generate a text summary for each captured page using Groq.', value: autoSummary, set: setAutoSummary },
          { label: 'Auto-categorize', desc: 'Assign a category (Article, Video, Dev/Tech…) to each capture.', value: aiAnalysis, set: setAiAnalysis },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-[13.5px] font-medium text-ink">{row.label}</p>
              <p className="mt-0.5 text-[12px] text-ink-soft">{row.desc}</p>
            </div>
            <Toggle checked={row.value} onChange={row.set} />
          </div>
        ))}
      </div>

      {/* Groq API key instructions */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="font-display text-[13.5px] font-semibold text-ink mb-1">Groq API Key Setup</p>
        <p className="text-[12px] text-ink-soft mb-3">
          Required for AI chat answers, screenshot analysis, and auto-summaries. Get a free key at{' '}
          <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-accent underline">console.groq.com/keys</a>
        </p>
        <ol className="space-y-1.5 text-[12px] text-ink-soft list-decimal list-inside">
          <li>Open <code className="bg-surface-alt px-1.5 py-0.5 rounded text-ink">backend/.env</code> in a text editor</li>
          <li>Replace <code className="bg-surface-alt px-1.5 py-0.5 rounded text-ink">your_new_groq_api_key_here</code> with your actual key</li>
          <li>Restart the backend: <code className="bg-surface-alt px-1.5 py-0.5 rounded text-ink">node server.js</code></li>
        </ol>
        <div className="mt-3 rounded-lg bg-surface-alt p-3 font-mono text-[11.5px] text-ink">
          GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
        </div>
      </div>

      {/* Vision re-analyze */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="font-display text-[13.5px] font-semibold text-ink mb-1">
          👁 Re-analyze screenshots with Vision AI
        </p>
        <p className="text-[12px] text-ink-soft mb-3">
          Runs <code className="bg-surface-alt px-1 rounded">llama-4-scout</code> on your existing screenshots to extract what was visible on screen. This makes chat answers much more accurate — it can count items, read tables, describe UI elements from your screenshots.
        </p>
        <button
          onClick={handleReanalyze}
          disabled={reanalyzing || backendStatus === 'offline'}
          className="rounded-lg bg-accent px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
        >
          {reanalyzing ? 'Queuing analysis…' : 'Run Vision Analysis on all captures'}
        </button>
        {reanalyzeMsg && (
          <p className={`mt-2 text-[12px] leading-relaxed ${reanalyzeMsg.startsWith('✓') ? 'text-green-700' : 'text-red-600'}`}>
            {reanalyzeMsg}
          </p>
        )}
        {backendStatus === 'no_key' && !reanalyzeMsg && (
          <p className="mt-2 text-[12px] text-yellow-700">
            ⚠ Add your Groq API key first (see instructions above), then restart the backend.
          </p>
        )}
      </div>

      {/* Capture interval info */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="font-display text-[13.5px] font-semibold text-ink mb-1">Capture interval</p>
        <p className="text-[12px] text-ink-soft mb-2">
          The extension captures on every page navigation and tab switch. A heartbeat also fires every 30s for long sessions on one page.
        </p>
        <code className="text-[11.5px] bg-surface-alt px-2 py-1 rounded text-ink">
          HEARTBEAT_SECONDS = 30 (in service-worker.js)
        </code>
      </div>

      {/* Sign out */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-[13.5px] font-semibold text-red-700">Sign out</p>
        <p className="mt-1 text-[12px] text-red-600/80">You'll need to log in again to access your captures.</p>
        <button onClick={handleLogout}
          className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-[12.5px] font-semibold text-red-700 hover:bg-red-100">
          Sign out
        </button>
      </div>
    </div>
  )
}
