import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
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

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/tasks/available', label: 'Available Tasks' },
    { to: '/tasks/my', label: 'My Tasks' },
    { to: '/profile', label: 'My Profile' },
  ];

  return (
    <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Logo />
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--navy)', lineHeight: 1 }}>Likhaai</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.05em', fontWeight: 600 }}>WRITER PORTAL</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {links.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 500,
              color: location.pathname === link.to ? 'var(--navy)' : 'var(--text-muted)',
              background: location.pathname === link.to ? 'var(--cream)' : 'transparent'
            }}>{link.label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: user?.available ? 'var(--success)' : 'var(--text-muted)' }}>
              {user?.available ? '● Available' : '○ Unavailable'}
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Sign Out</button>
        </div>
      </div>
    </nav>
  );
}
