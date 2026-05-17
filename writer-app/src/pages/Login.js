import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'WRITER') { setError('This portal is for writers only. Please use the Student Portal.'); setLoading(false); return; }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #1c2b1a 0%, #2d4a2a 100%)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: 'white', maxWidth: 480 }}>
        <div style={{ fontSize: '3rem', marginBottom: 24 }}>✍️</div>
        <h1 style={{ fontSize: '2.6rem', color: 'white', marginBottom: 16, lineHeight: 1.2 }}>Start Earning with Your Handwriting</h1>
        <p style={{ fontSize: '1.05rem', opacity: 0.8, lineHeight: 1.7, marginBottom: 36 }}>
          Accept assignment tasks from students, complete them on your schedule, and earn money doing what you're good at.
        </p>
        {['Set your own price per page', 'Work flexible hours', 'Get paid securely', 'Build your reputation'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', opacity: 0.9, marginBottom: 12 }}>
            <div style={{ width: 20, height: 20, background: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>✓</div>
            {item}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--cream)' }}>
        <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--navy)', marginBottom: 8 }}>Writer Sign In</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Access your writer dashboard</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 13, marginTop: 8 }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In to Writer Portal'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            New writer?{' '}<Link to="/register" style={{ color: 'var(--navy)', fontWeight: 600 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
