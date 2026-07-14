import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingIndicator from '../components/LoadingIndicator';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><LoadingIndicator label="Loading…" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
