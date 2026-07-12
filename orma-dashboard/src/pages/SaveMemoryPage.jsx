import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2, CheckCircle2 } from 'lucide-react'
import LoadingIndicator from '../components/LoadingIndicator'
import { saveMemory } from '../lib/api'

const steps = ['Fetching page…', 'Cleaning content…', 'Generating summary…']

export default function SaveMemoryPage() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | done
  const [stepIndex, setStepIndex] = useState(0)
  const [saved, setSaved] = useState(null)
  const navigate = useNavigate()

  async function handleSave(e) {
    e.preventDefault()
    if (!url.trim() || status === 'saving') return

    setStatus('saving')
    const timer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1))
    }, 500)

    const result = await saveMemory(url.trim())
    clearInterval(timer)
    setSaved(result)
    setStatus('done')
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-[22px] font-bold text-ink">Save a page</h1>
      <p className="mt-1 text-[13.5px] text-ink-soft">
        Paste a link. Orma cleans it, summarizes it, and files it automatically.
      </p>

      {status !== 'done' && (
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
            <Link2 size={16} strokeWidth={2} className="flex-shrink-0 text-ink-soft" />
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              disabled={status === 'saving'}
              className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-soft focus:outline-none disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'saving'}
            className="w-full rounded-lg bg-accent py-2.5 text-[14px] font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {status === 'saving' ? 'Saving…' : 'Save this page'}
          </button>

          {status === 'saving' && <LoadingIndicator label={steps[stepIndex]} />}
        </form>
      )}

      {status === 'done' && saved && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-2 text-accent">
            <CheckCircle2 size={18} strokeWidth={2} />
            <span className="text-[13px] font-semibold">Saved</span>
          </div>
          <h3 className="font-display text-[15px] font-semibold text-ink">{saved.domain}</h3>
          <p className="mt-1 text-[12.5px] text-ink-soft">{saved.url}</p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate('/app')}
              className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-dark"
            >
              View memories
            </button>
            <button
              onClick={() => {
                setStatus('idle')
                setUrl('')
                setStepIndex(0)
                setSaved(null)
              }}
              className="rounded-lg border border-border px-4 py-2 text-[13px] font-semibold text-ink hover:bg-surface-alt"
            >
              Save another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
