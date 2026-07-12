import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 pb-16 md:pb-0">
        <main className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
