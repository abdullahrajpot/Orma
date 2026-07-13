import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import MemoryDetailsPage from './pages/MemoryDetailsPage';
import ProfilePage from './pages/ProfilePage';
import WorkspacesPage from './pages/WorkspacesPage';

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* App Routes */}
      <Route path="/app" element={<DashboardPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/memory/:id" element={<MemoryDetailsPage />} />
      <Route path="/workspaces" element={<WorkspacesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* Default/Fallback Route */}
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  );
}

export default App;