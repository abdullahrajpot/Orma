import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react'
import { getMemory, deleteMemory } from '../lib/api'
import LoadingIndicator from '../components/LoadingIndicator'

const projectLabel = {
  'rag-research': 'RAG Research',
  'extension-build': 'Extension Build',
  'hackathon-ops': 'Hackathon Ops',
}

export default function MemoryDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [memory, setMemory] = useState(null)

  useEffect(() => {
    setMemory(null)
    getMemory(id).then(setMemory)
  }, [id])

  if (!memory) return <LoadingIndicator label="Loading memory…" />

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/app" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} strokeWidth={2} />
        Back to memories
      </Link>

      <span className="rounded-full border border-border bg-accent-soft px-2.5 py-1 text-[10.5px] font-semibold text-accent">
        {projectLabel[memory.projectId] ?? memory.projectId}
      </span>

      <h1 className="mt-3 font-display text-[24px] font-bold leading-tight text-ink">
        {memory.title}
      </h1>

      <a
        href={memory.url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-accent"
      >
        {memory.domain}
        <ExternalLink size={13} strokeWidth={2} />
      </a>

      <div className="mt-6 rounded-xl border border-border bg-accent-soft/40 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">AI summary</p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink">{memory.summary}</p>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          Full content
        </p>
        <p className="text-[14px] leading-relaxed text-ink">{memory.content}</p>
      </div>

      {memory.tags?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {memory.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-surface-alt px-2.5 py-1 text-[11px] text-ink-soft"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={async () => {
          await deleteMemory(memory.id)
          navigate('/app')
        }}
        className="mt-8 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft hover:text-red-600"
      >
        <Trash2 size={14} strokeWidth={2} />
        Remove this memory
      </button>
    </div>
  )
}
