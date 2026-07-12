import { useEffect, useState } from 'react'
import SearchBar from '../components/SearchBar'
import MemoryCard from '../components/MemoryCard'
import LoadingIndicator from '../components/LoadingIndicator'
import { getMemories, getProjects, searchMemories } from '../lib/api'

export default function DashboardPage() {
  const [memories, setMemories] = useState(null)
  const [projects, setProjects] = useState([])
  const [query, setQuery] = useState('')
  const [activeProject, setActiveProject] = useState('all')

  useEffect(() => {
    getMemories().then(setMemories)
    getProjects().then(setProjects)
  }, [])

  useEffect(() => {
    let active = true
    searchMemories(query).then((results) => {
      if (active) setMemories(results)
    })
    return () => {
      active = false
    }
  }, [query])

  const visible = (memories ?? []).filter(
    (m) => activeProject === 'all' || m.projectId === activeProject
  )

  return (
    <div>
      <h1 className="font-display text-[22px] font-bold text-ink">Your memories</h1>
      <p className="mt-1 text-[13.5px] text-ink-soft">
        Everything you've saved, grouped automatically by topic.
      </p>

      <div className="mt-6">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveProject('all')}
          className={[
            'rounded-full border px-3 py-1.5 text-[12px] font-semibold',
            activeProject === 'all'
              ? 'border-accent bg-accent text-white'
              : 'border-border bg-surface text-ink-soft hover:bg-surface-alt',
          ].join(' ')}
        >
          All
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveProject(p.id)}
            className={[
              'rounded-full border px-3 py-1.5 text-[12px] font-semibold',
              activeProject === p.id
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-surface text-ink-soft hover:bg-surface-alt',
            ].join(' ')}
          >
            {p.name} <span className="opacity-70">· {p.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {memories === null ? (
          <LoadingIndicator label="Loading your memories…" />
        ) : visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-[13.5px] text-ink-soft">
            Nothing saved here yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((m) => (
              <MemoryCard key={m.id} memory={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
