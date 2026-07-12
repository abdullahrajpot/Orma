import { NavLink } from 'react-router-dom'
import { Home, MessageSquare, Plus, Settings, User, FolderKanban } from 'lucide-react'

const links = [
  { to: '/app', label: 'Memories', icon: Home, end: true },
  { to: '/app/workspace', label: 'Workspaces', icon: FolderKanban },
  { to: '/app/chat', label: 'Chat', icon: MessageSquare },
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/profile', label: 'Profile', icon: User },
]

function linkClasses({ isActive }) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors',
    isActive ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:bg-surface-alt hover:text-ink',
  ].join(' ')
}

export default function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-display text-[13px] font-bold text-white">
            ഓ
          </span>
          <span className="font-display text-[15px] font-bold text-ink">Orma</span>
        </div>

        <div className="px-3 pt-4">
          <NavLink
            to="/app/save"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-accent-dark"
          >
            <Plus size={16} strokeWidth={2.5} />
            Save a page
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClasses}>
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4 text-[11.5px] text-ink-soft">
          Orma (ഓർമ്മ) — memory, in Malayalam.
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface md:hidden">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium',
                isActive ? 'text-accent' : 'text-ink-soft',
              ].join(' ')
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
        <NavLink
          to="/app/save"
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium text-accent"
        >
          <Plus size={18} strokeWidth={2} />
          Save
        </NavLink>
      </nav>
    </>
  )
}
