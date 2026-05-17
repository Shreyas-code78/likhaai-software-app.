import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="#1a3a6b"/>
    <path d="M10 26 Q13 10 18 12 Q22 14 16 20 Q12 24 20 22 Q26 20 24 26" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="24" cy="13" r="2" stroke="white" strokeWidth="1.5" fill="none"/>
    <path d="M24 15 L24 19 L22 22 L26 22 L24 19" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/post-task', label: 'Post Task' },
    { to: '/browse-writers', label: 'Find Writers' },
    { to: '/tasks', label: 'My Tasks' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Logo />
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--navy)', lineHeight: 1 }}>Likhaai</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>STUDENT PORTAL</div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: location.pathname === link.to ? 'var(--navy)' : 'var(--text-muted)',
              background: location.pathname === link.to ? 'var(--cream)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.city || 'Student'}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
