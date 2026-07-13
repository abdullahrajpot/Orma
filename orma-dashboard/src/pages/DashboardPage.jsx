import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    searchMemories(query).then(setMemories)
  }, [query])

  const visible = (memories ?? []).filter(
    (m) => activeProject === 'all' || m.projectId === activeProject
  )

  return (
    <div>
      <nav className="flex gap-6 mb-8 border-b border-border pb-4">
        <Link to="/app" className="font-bold text-accent">Dashboard</Link>
        <Link to="/chat" className="text-ink-soft hover:text-accent">AI Chat</Link>
        <Link to="/workspaces" className="text-ink-soft hover:text-accent">Workspaces</Link>
        <Link to="/profile" className="text-ink-soft hover:text-accent">Profile</Link>
      </nav>

      <h1 className="font-display text-[22px] font-bold text-ink">Your memories</h1>
      <div className="mt-6">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setActiveProject('all')} className="rounded-full border px-3 py-1.5 text-[12px] font-semibold border-accent bg-accent text-white">All</button>
        {projects.map((p) => (
          <button key={p.id} onClick={() => setActiveProject(p.id)} className="rounded-full border px-3 py-1.5 text-[12px] font-semibold border-border bg-surface text-ink-soft">
            {p.name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {memories === null ? <LoadingIndicator label="Loading..." /> : 
         <div className="grid gap-3 sm:grid-cols-2">
           {visible.map((m) => <MemoryCard key={m.id} memory={m} />)}
         </div>
        }
      </div>
    </div>
  )
}