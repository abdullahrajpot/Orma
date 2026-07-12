import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import DashboardLayout from './components/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import WorkspacesPage from './pages/WorkspacesPage'
import WorkspaceDetailPage from './pages/WorkspaceDetailPage'
import ChatPage from './pages/ChatPage'
import SaveMemoryPage from './pages/SaveMemoryPage'
import MemoryDetailsPage from './pages/MemoryDetailsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="workspace" element={<WorkspacesPage />} />
          <Route path="workspace/:id" element={<WorkspaceDetailPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="save" element={<SaveMemoryPage />} />
          <Route path="memory/:id" element={<MemoryDetailsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  )
}
