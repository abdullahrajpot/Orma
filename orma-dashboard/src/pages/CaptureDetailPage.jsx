import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Trash2, ExternalLink, ArrowLeft } from 'lucide-react'
import { getCapture, deleteCapture } from '../lib/api'
import LoadingIndicator from '../components/LoadingIndicator'

export default function CaptureDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [capture, setCapture] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getCapture(id).then(setCapture).catch(() => navigate('/app/timeline'))
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this capture?')) return
    setDeleting(true)
    await deleteCapture(id)
    navigate('/app/timeline')
  }

  if (!capture) return <div className="flex items-center justify-center py-20"><LoadingIndicator label="Loading…" /></div>

  return (
    <div className="max-w-3xl">
      <Link to="/app/timeline" className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to timeline
      </Link>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="font-display text-[20px] font-bold text-ink leading-snug">{capture.title || 'Untitled'}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[12.5px] text-ink-soft">
            <span>{capture.domain}</span>
            {capture.category && (
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">{capture.category}</span>
            )}
            <span>{new Date(capture.capturedAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a href={capture.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] font-medium text-ink hover:bg-surface-alt">
            <ExternalLink size={14} /> Visit
          </a>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-700 hover:bg-red-100">
            <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Screenshot */}
      {capture.screenshot && (
        <div className="mb-6 overflow-hidden rounded-xl border border-border shadow-sm">
          <img src={capture.screenshot} alt={capture.title} className="w-full" />
        </div>
      )}

      {/* Visual description from AI vision */}
      {capture.visualDescription && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">👁 What was visible on screen</p>
          <p className="text-[13.5px] leading-relaxed text-ink">{capture.visualDescription}</p>
        </div>
      )}

      {/* Summary */}
      {capture.summary && (
        <div className="mb-6 rounded-xl border border-accent/20 bg-accent-soft/40 p-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-accent">AI Summary</p>
          <p className="text-[13.5px] leading-relaxed text-ink">{capture.summary}</p>
        </div>
      )}

      {/* Page text */}
      {capture.pageText && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Page content</p>
          <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-soft">
            {capture.pageText.slice(0, 2000)}{capture.pageText.length > 2000 ? '…' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
