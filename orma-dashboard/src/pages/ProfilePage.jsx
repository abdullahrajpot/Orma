import { useEffect, useState } from 'react'
import { getProfile } from '../lib/api'
import LoadingIndicator from '../components/LoadingIndicator'

export default function ProfilePage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    getProfile().then(setUser)
  }, [])

  if (!user) return <LoadingIndicator label="Loading profile…" />

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-[22px] font-bold text-ink">Profile</h1>

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent font-display text-[20px] font-bold text-white">
          {user.name.charAt(0)}
        </span>
        <div>
          <p className="font-display text-[16px] font-semibold text-ink">{user.name}</p>
          <p className="text-[13px] text-ink-soft">{user.email}</p>
          <p className="mt-0.5 text-[12px] text-ink-soft">Member since {user.joined}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="font-display text-[24px] font-bold text-accent">{user.memoriesSaved}</p>
          <p className="mt-1 text-[12px] text-ink-soft">Memories saved</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="font-display text-[24px] font-bold text-accent">{user.projectsCount}</p>
          <p className="mt-1 text-[12px] text-ink-soft">Workspaces</p>
        </div>
      </div>

      <form className="mt-6 space-y-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ink">Name</label>
          <input
            defaultValue={user.name}
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[14px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ink">Email</label>
          <input
            defaultValue={user.email}
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[14px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
        >
          Save changes
        </button>
      </form>
    </div>
  )
}
