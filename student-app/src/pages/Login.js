import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="28" fill="#1a3a6b"/>
    <path d="M16 40 Q20 18 28 20 Q34 22 26 32 Q20 38 32 35 Q40 32 38 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <circle cx="37" cy="20" r="3" stroke="white" strokeWidth="2" fill="none"/>
    <path d="M37 23 L37 30 L34 35 L40 35 L37 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'STUDENT') {
        setError('This portal is for students only. Please use the Writer Portal.');
        setLoading(false);
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)'
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', color: 'white', maxWidth: 480
      }}>
        <div style={{ marginBottom: 48 }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: '2.8rem', color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
          Get Your Homework Done Right
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.7, marginBottom: 40 }}>
          Connect with skilled local writers who deliver handwritten assignments — professionally, on time, every time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Post your task in minutes', 'Get matched with nearby writers', 'Secure in-platform messaging', 'Pay only when satisfied'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', opacity: 0.9 }}>
              <div style={{ width: 20, height: 20, background: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>✓</div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px', background: 'var(--cream)'
      }}>
        <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--navy)', marginBottom: 8 }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sign in to your student account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: 8 }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--navy)', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
