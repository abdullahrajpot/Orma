import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-display text-[15px] font-bold text-white">
            ഓ
          </span>
          <span className="font-display text-[17px] font-bold text-ink">Orma</span>
        </Link>

        {!isAuthPage && (
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-[14px] font-medium text-ink-soft hover:text-ink">
              How it works
            </a>
            <a href="#features" className="text-[14px] font-medium text-ink-soft hover:text-ink">
              Features
            </a>
            <a href="#roadmap" className="text-[14px] font-medium text-ink-soft hover:text-ink">
              Roadmap
            </a>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {pathname !== '/login' && (
            <Link
              to="/login"
              className="text-[14px] font-medium text-ink-soft hover:text-ink"
            >
              Log in
            </Link>
          )}
          {pathname !== '/signup' && (
            <Link
              to="/signup"
              className="rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
            >
              {pathname === '/login' ? 'Create account' : 'Add to Chrome'}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
