import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { logout } from '../lib/api'
import { useNavigate } from 'react-router-dom'

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
  const { logout: ctxLogout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    ctxLogout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-[22px] font-bold text-ink">Settings</h1>

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
        {[
          { label: 'AI Summaries', desc: 'Generate a summary for each captured page using Groq AI.', value: autoSummary, set: setAutoSummary },
          { label: 'Auto-categorize', desc: 'Automatically assign a category (Article, Video, Dev/Tech…) to each capture.', value: aiAnalysis, set: setAiAnalysis },
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

      <div className="mt-6 rounded-xl border border-border bg-surface p-4">
        <p className="font-display text-[13.5px] font-semibold text-ink mb-1">Capture interval</p>
        <p className="text-[12px] text-ink-soft mb-3">The extension captures a screenshot every 15 seconds while recording is on. This is set in the extension's service worker.</p>
        <code className="text-[12px] bg-surface-alt px-2 py-1 rounded text-ink">CAPTURE_INTERVAL_SECONDS = 15</code>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-4">
        <p className="font-display text-[13.5px] font-semibold text-ink mb-1">Backend & AI</p>
        <p className="text-[12px] text-ink-soft mb-2">Set your Groq API key in <code className="bg-surface-alt px-1 rounded">backend/.env</code> to enable AI summaries and smart chat responses.</p>
        <div className="rounded-lg bg-surface-alt p-3 font-mono text-[11.5px] text-ink-soft">
          GROQ_API_KEY=your_key_here
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
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
