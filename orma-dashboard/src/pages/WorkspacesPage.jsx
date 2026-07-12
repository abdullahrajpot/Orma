import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProjects, getMemories } from '../lib/api'
import LoadingIndicator from '../components/LoadingIndicator'

const clusterStyle = {
  'rag-research': { bg: 'bg-accent-soft', ring: 'ring-accent/25', dot: 'bg-accent' },
  'extension-build': { bg: 'bg-amber-50', ring: 'ring-amber-300/40', dot: 'bg-amber-500' },
  'hackathon-ops': { bg: 'bg-rose-50', ring: 'ring-rose-300/40', dot: 'bg-rose-500' },
}

export default function WorkspacesPage() {
  const [projects, setProjects] = useState(null)
  const [memories, setMemories] = useState([])

  useEffect(() => {
    getProjects().then(setProjects)
    getMemories().then(setMemories)
  }, [])

  if (!projects) return <LoadingIndicator label="Loading workspaces…" />

  return (
    <div>
      <h1 className="font-display text-[22px] font-bold text-ink">Workspaces</h1>
      <p className="mt-1 text-[13.5px] text-ink-soft">
        Orma groups related pages together automatically — no folders to manage.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {projects.map((p) => {
          const style = clusterStyle[p.id] ?? clusterStyle['rag-research']
          const items = memories.filter((m) => m.projectId === p.id)
          return (
            <Link
              key={p.id}
              to={`/app/workspace/${p.id}`}
              className={`rounded-xl border border-border ${style.bg} p-5 ring-1 ${style.ring} transition-transform hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                <h3 className="font-display text-[15.5px] font-semibold text-ink">{p.name}</h3>
              </div>
              <p className="mt-2 text-[12.5px] text-ink-soft">{p.count} pages saved</p>
              <div className="mt-4 space-y-1.5">
                {items.slice(0, 2).map((m) => (
                  <p key={m.id} className="truncate text-[12px] text-ink-soft">
                    · {m.title}
                  </p>
                ))}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
