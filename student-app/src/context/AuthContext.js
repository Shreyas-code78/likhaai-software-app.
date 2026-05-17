import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('likhaai_token');
    if (token) {
      API.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.clear()).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);
  const login = async (email, password) => {
    const r = await API.post('/auth/login', { email, password });
    localStorage.setItem('likhaai_token', r.data.token); setUser(r.data.user); return r.data.user;
  };
  const register = async (data) => {
    const r = await API.post('/auth/register', { ...data, role: 'STUDENT' });
    localStorage.setItem('likhaai_token', r.data.token); setUser(r.data.user); return r.data.user;
  };
  const logout = () => { localStorage.clear(); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
