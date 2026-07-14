import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, removeToken, removeUser, getProfile } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    // Validate token with backend
    getProfile()
      .then((u) => { setUser(u); setLoading(false); })
      .catch(() => {
        removeToken(); removeUser(); setUser(null); setLoading(false);
      });
  }, []);

  function logout() {
    removeToken(); removeUser(); setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
