import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AvailableTasks from './pages/AvailableTasks';
import MyTasks from './pages/MyTasks';
import TaskDetail from './pages/TaskDetail';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /><span>Loading Likhaai...</span></div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/tasks/available" element={<PrivateRoute><AvailableTasks /></PrivateRoute>} />
          <Route path="/tasks/my" element={<PrivateRoute><MyTasks /></PrivateRoute>} />
          <Route path="/task/:id" element={<PrivateRoute><TaskDetail /></PrivateRoute>} />
          <Route path="/chat/:taskId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
