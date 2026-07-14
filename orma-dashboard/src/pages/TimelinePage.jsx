import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getCaptures } from '../lib/api'
import LoadingIndicator from '../components/LoadingIndicator'
import SearchBar from '../components/SearchBar'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
function toDateKey(iso) {
  return new Date(iso).toISOString().slice(0, 10)
}

// Group captures by date
function groupByDate(captures) {
  const map = {}
  captures.forEach(c => {
    const key = toDateKey(c.capturedAt)
    if (!map[key]) map[key] = []
    map[key].push(c)
  })
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
}

export default function TimelinePage() {
  const [captures, setCaptures] = useState(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const LIMIT = 50

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: LIMIT, skip: page * LIMIT }
      if (query.trim()) params.search = query
      const { captures, total } = await getCaptures(params)
      setCaptures(captures)
      setTotal(total)
    } catch {
      setCaptures([])
    } finally {
      setLoading(false)
    }
  }, [page, query])

  useEffect(() => { load() }, [load])

  const groups = captures ? groupByDate(captures) : []
  const pages = Math.ceil(total / LIMIT)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-ink">Timeline</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">{total} captures across all sessions</p>
        </div>
      </div>

      <div className="mb-6">
        <SearchBar value={query} onChange={v => { setQuery(v); setPage(0) }} placeholder="Search your captures…" />
      </div>

      {loading || captures === null ? (
        <LoadingIndicator label="Loading timeline…" />
      ) : captures.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-[14px] font-medium text-ink">No captures found</p>
          <p className="mt-1 text-[13px] text-ink-soft">
            {query ? 'Try different search terms.' : 'Turn on recording in the extension to start capturing.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {groups.map(([date, items]) => (
              <div key={date}>
                <h2 className="mb-3 font-display text-[14px] font-bold text-ink border-b border-border pb-2">
                  {formatDate(date + 'T00:00:00')}
                  <span className="ml-2 text-[12px] font-normal text-ink-soft">{items.length} captures</span>
                </h2>
                <div className="space-y-3">
                  {items.map(c => (
                    <Link
                      key={c._id}
                      to={`/app/capture/${c._id}`}
                      className="group flex gap-3 rounded-xl border border-border bg-surface p-3 hover:border-accent/40 transition-colors"
                    >
                      {/* Thumbnail */}
                      {c.screenshot ? (
                        <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-surface-alt">
                          <img src={c.screenshot} alt={c.title} className="h-full w-full object-cover object-top" />
                        </div>
                      ) : (
                        <div className="h-16 w-24 flex-shrink-0 rounded-lg border border-border bg-surface-alt flex items-center justify-center text-[10px] text-ink-soft">
                          {c.domain || 'No preview'}
                        </div>
                      )}
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate font-display text-[13.5px] font-semibold text-ink">{c.title || 'Untitled'}</h3>
                          <span className="flex-shrink-0 text-[11px] text-ink-soft">{formatTime(c.capturedAt)}</span>
                        </div>
                        <p className="text-[11.5px] text-ink-soft mt-0.5">{c.domain}</p>
                        {c.summary && (
                          <p className="mt-1 line-clamp-1 text-[12px] text-ink-soft">{c.summary}</p>
                        )}
                        {c.category && (
                          <span className="mt-1.5 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {c.category}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-[13px] font-medium text-ink disabled:opacity-40 hover:bg-surface-alt"
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="text-[13px] text-ink-soft">Page {page + 1} of {pages}</span>
              <button
                onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
                disabled={page >= pages - 1}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-[13px] font-medium text-ink disabled:opacity-40 hover:bg-surface-alt"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
