import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getProjects, getMemories } from '../lib/api'
import MemoryCard from '../components/MemoryCard'
import LoadingIndicator from '../components/LoadingIndicator'

export default function WorkspaceDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [items, setItems] = useState(null)

  useEffect(() => {
    setProject(null)
    setItems(null)
    getProjects().then((all) => setProject(all.find((p) => p.id === id)))
    getMemories().then((all) => setItems(all.filter((m) => m.projectId === id)))
  }, [id])

  if (!project || !items) return <LoadingIndicator label="Loading workspace…" />

  return (
    <div>
      <Link to="/app/workspace" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} strokeWidth={2} />
        Back to workspaces
      </Link>

      <h1 className="font-display text-[22px] font-bold text-ink">{project.name}</h1>
      <p className="mt-1 text-[13.5px] text-ink-soft">
        {items.length} pages grouped here automatically, based on topic similarity.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((m) => (
          <MemoryCard key={m.id} memory={m} />
        ))}
      </div>
    </div>
  )
}
