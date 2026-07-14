import { Link } from 'react-router-dom'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export default function CaptureCard({ capture }) {
  const c = capture
  return (
    <Link
      to={`/app/capture/${c._id}`}
      className="group block rounded-xl border border-border bg-surface overflow-hidden transition-colors hover:border-accent/40"
    >
      {c.screenshot && (
        <div className="h-28 overflow-hidden bg-surface-alt border-b border-border">
          <img
            src={c.screenshot}
            alt={c.title}
            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[14px] font-semibold text-ink">{c.title || 'Untitled'}</h3>
            <p className="text-[11.5px] text-ink-soft mt-0.5">{c.domain}</p>
          </div>
          {c.category && (
            <span className="flex-shrink-0 rounded-full border border-border bg-accent-soft px-2.5 py-1 text-[10px] font-semibold text-accent">
              {c.category}
            </span>
          )}
        </div>
        {c.summary && (
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">{c.summary}</p>
        )}
        <p className="mt-2 text-[11px] text-ink-soft">{timeAgo(c.capturedAt)}</p>
      </div>
    </Link>
  )
}
