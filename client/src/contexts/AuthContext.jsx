import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setCsrfToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      if (res.csrfToken) {
        setCsrfToken(res.csrfToken);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    setUser(res.data);
    if (res.csrfToken) {
      setCsrfToken(res.csrfToken);
    }
    return res.data;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Proceed with clearing local state regardless
    }
    setUser(null);
    setCsrfToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
