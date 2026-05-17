import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('likhaai_token');
    if (token) {
      API.get('/auth/me').then(r => {
        setUser(r.data);
      }).catch(() => {
        localStorage.removeItem('likhaai_token'); setUser(null);
      }).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('likhaai_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await API.post('/auth/register', data);
    localStorage.setItem('likhaai_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => { localStorage.removeItem('likhaai_token'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
