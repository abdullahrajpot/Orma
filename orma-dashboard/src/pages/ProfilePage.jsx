import { useEffect, useState } from 'react'
import { getCaptures } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import LoadingIndicator from '../components/LoadingIndicator'

export default function ProfilePage() {
  const { user } = useAuth()
  const [total, setTotal] = useState(null)

  useEffect(() => {
    getCaptures({ limit: 1 }).then(({ total }) => setTotal(total)).catch(() => setTotal(0))
  }, [])

  if (!user) return <LoadingIndicator label="Loading profile…" />

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-[22px] font-bold text-ink">Profile</h1>

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent font-display text-[20px] font-bold text-white">
          {user.name?.charAt(0)?.toUpperCase() || '?'}
        </span>
        <div>
          <p className="font-display text-[16px] font-semibold text-ink">{user.name}</p>
          <p className="text-[13px] text-ink-soft">{user.email}</p>
          {user.createdAt && (
            <p className="mt-0.5 text-[12px] text-ink-soft">
              Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="font-display text-[24px] font-bold text-accent">
            {total === null ? '…' : total}
          </p>
          <p className="mt-1 text-[12px] text-ink-soft">Captures saved</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="font-display text-[24px] font-bold text-accent">Auto</p>
          <p className="mt-1 text-[12px] text-ink-soft">Recording mode</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <p className="font-display text-[14px] font-semibold text-ink mb-1">About Orma</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Orma (ഓർമ്മ) means "memory" in Malayalam. It automatically captures your browsing every 15 seconds so you can always ask what you saw, read, or watched — days or weeks later.
        </p>
      </div>
    </div>
  )
}
