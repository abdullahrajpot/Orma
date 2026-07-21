import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './lib/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import TimelinePage from './pages/TimelinePage';
import CaptureDetailPage from './pages/CaptureDetailPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

function AppInner() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'
  const isApp = pathname.startsWith('/app')

  return (
    <>
      <Navbar />
      {/* Auth pages need top padding for fixed navbar; landing manages own spacing; app has sidebar */}
      <div className={!isLanding && !isApp ? 'pt-16' : ''}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="capture/:id" element={<CaptureDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return <AppInner />
}

export default App;
