import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Clock, MessageSquare, TrendingUp } from 'lucide-react'
import { getCaptures, getDailyStats } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import LoadingIndicator from '../components/LoadingIndicator'
import CaptureCard from '../components/CaptureCard'
import SearchBar from '../components/SearchBar'

export default function DashboardPage() {
  const { user } = useAuth()
  const [captures, setCaptures] = useState(null)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState([])
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    getCaptures({ limit: 20 }).then(({ captures, total }) => {
      setCaptures(captures); setTotal(total)
    }).catch(() => setCaptures([]))
    getDailyStats().then(setStats).catch(() => setStats([]))
  }, [])

  useEffect(() => {
    if (query.trim() === '') {
      getCaptures({ limit: 20 }).then(({ captures, total }) => { setCaptures(captures); setTotal(total) })
      return
    }
    setSearching(true)
    const t = setTimeout(() => {
      getCaptures({ search: query, limit: 30 }).then(({ captures, total }) => {
        setCaptures(captures); setTotal(total); setSearching(false)
      }).catch(() => { setCaptures([]); setSearching(false) })
    }, 400)
    return () => clearTimeout(t)
  }, [query])

  const todayCount = stats.find(s => s._id === new Date().toISOString().slice(0, 10))?.count || 0
  const totalCount = total

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold text-ink">
          Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">Here's what Orma has been capturing for you.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Camera, label: 'Total captures', value: totalCount },
          { icon: Clock, label: 'Today', value: todayCount },
          { icon: TrendingUp, label: 'This week', value: stats.slice(0, 7).reduce((s, d) => s + d.count, 0) },
          { icon: MessageSquare, label: 'Days active', value: stats.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <Icon size={18} strokeWidth={2} className="text-accent mb-2" />
            <p className="font-display text-[22px] font-bold text-accent">{value}</p>
            <p className="text-[11.5px] text-ink-soft mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/app/chat" className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-accent-dark">
          <MessageSquare size={15} strokeWidth={2.5} />
          Ask your memory
        </Link>
        <Link to="/app/timeline" className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-surface-alt">
          <Clock size={15} strokeWidth={2.5} />
          Browse timeline
        </Link>
      </div>

      {/* Recent captures */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[16px] font-semibold text-ink">Recent captures</h2>
        <Link to="/app/timeline" className="text-[12.5px] font-medium text-accent hover:text-accent-dark">View all →</Link>
      </div>

      <div className="mb-4">
        <SearchBar value={query} onChange={setQuery} placeholder="Search your captures…" />
      </div>

      {captures === null || searching ? (
        <LoadingIndicator label="Loading captures…" />
      ) : captures.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-[14px] font-medium text-ink">No captures yet</p>
          <p className="mt-1 text-[13px] text-ink-soft">
            Install the Orma Chrome extension and turn on recording to start capturing your browsing.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {captures.map(c => <CaptureCard key={c._id} capture={c} />)}
        </div>
      )}
    </div>
  )
}
