import { Link } from 'react-router-dom'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

const projectLabel = {
  'rag-research': 'RAG Research',
  'extension-build': 'Extension Build',
  'hackathon-ops': 'Hackathon Ops',
}

export default function MemoryCard({ memory }) {
  return (
    <Link
      to={`/app/memory/${memory.id}`}
      className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-accent-soft/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[14px] font-semibold text-ink">
            {memory.title}
          </h3>
          <p className="mt-0.5 text-[12px] text-ink-soft">{memory.domain}</p>
        </div>
        <span className="flex-shrink-0 rounded-full border border-border bg-accent-soft px-2.5 py-1 text-[10px] font-semibold text-accent">
          {projectLabel[memory.projectId] ?? memory.projectId}
        </span>
      </div>
      <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
        {memory.summary}
      </p>
      <p className="mt-3 text-[11px] text-ink-soft">Saved {timeAgo(memory.savedAt)}</p>
    </Link>
  )
}
