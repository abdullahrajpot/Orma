import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Clock, MessageSquare, Settings, User, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const links = [
  { to: '/app', label: 'Dashboard', icon: Home, end: true },
  { to: '/app/timeline', label: 'Timeline', icon: Clock },
  { to: '/app/chat', label: 'AI Chat', icon: MessageSquare },
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
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

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

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClasses}>
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="border-t border-border p-3">
            <div className="mb-2 rounded-lg px-3 py-2 text-[12px] text-ink-soft">
              <p className="font-medium text-ink truncate">{user.name}</p>
              <p className="truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium text-ink-soft hover:bg-surface-alt hover:text-ink"
            >
              <LogOut size={14} strokeWidth={2} />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface md:hidden">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              ['flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium',
               isActive ? 'text-accent' : 'text-ink-soft'].join(' ')
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
