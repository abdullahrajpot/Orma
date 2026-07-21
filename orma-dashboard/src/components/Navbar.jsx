import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const APP_ROUTES = ['/app']

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  // ⚠️ useEffect MUST come before any conditional return (Rules of Hooks)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isAppPage = APP_ROUTES.some(r => pathname.startsWith(r))
  const isLanding = pathname === '/'

  // App has its own sidebar — return null AFTER all hooks
  if (isAppPage) return null

  const navBase = isLanding
    ? scrolled
      ? 'bg-[#0f1923]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
      : 'bg-transparent'
    : 'bg-surface/95 backdrop-blur border-b border-border'

  const logoText = isLanding ? 'text-white' : 'text-ink'
  const linkColor = isLanding ? 'text-white/70 hover:text-white' : 'text-ink-soft hover:text-ink'

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBase}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent font-display text-[14px] font-bold text-white shadow-lg shadow-accent/30">
            ഓ
          </span>
          <span className={`font-display text-[17px] font-bold ${logoText}`}>Orma</span>
        </Link>

        {/* Nav links — only on landing */}
        {isLanding && (
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className={`text-[14px] font-medium transition-colors ${linkColor}`}>Features</a>
            <a href="#how-it-works" className={`text-[14px] font-medium transition-colors ${linkColor}`}>How it works</a>
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/app" className={`hidden sm:block text-[13.5px] font-medium transition-colors ${linkColor}`}>
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); navigate('/') }}
                className={`text-[13.5px] font-medium transition-colors ${linkColor}`}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              {pathname !== '/login' && (
                <Link to="/login" className={`hidden sm:block text-[13.5px] font-medium transition-colors ${linkColor}`}>
                  Log in
                </Link>
              )}
              {pathname !== '/signup' && (
                <Link
                  to="/signup"
                  className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-all ${
                    isLanding
                      ? 'bg-white text-accent hover:bg-white/90 shadow-lg shadow-black/20'
                      : 'bg-accent text-white hover:bg-accent-dark'
                  }`}
                >
                  {pathname === '/login' ? 'Create account' : 'Get started'}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
