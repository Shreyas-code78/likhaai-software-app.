import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Geography', 'Economics', 'Computer Science', 'Accountancy', 'Business Studies', 'Political Science', 'Other'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', city: '', state: '', bio: '', pricePerPage: 8 });
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleSubject = (s) => setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (subjects.length === 0) { setError('Please select at least one subject.'); return; }
    setLoading(true);
    try {
      await register({ ...form, role: 'WRITER', subjects, pricePerPage: Number(form.pricePerPage) });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '40px 24px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 560, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✍️</div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--navy)', marginBottom: 8 }}>Join as a Writer</h2>
          <p style={{ color: 'var(--text-muted)' }}>Start earning by completing homework assignments</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input required value={form.name} onChange={set('name')} placeholder="Your name" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <input required value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Email Address</label>
            <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <input required value={form.city} onChange={set('city')} placeholder="Mumbai" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Price per Page (₹)</label>
              <input type="number" min={1} value={form.pricePerPage} onChange={set('pricePerPage')} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Subjects You Can Write</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {SUBJECTS.map(s => (
                <label key={s} style={{
                  padding: '5px 14px', borderRadius: 100, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                  border: `1.5px solid ${subjects.includes(s) ? 'var(--navy)' : 'var(--border)'}`,
                  background: subjects.includes(s) ? 'var(--navy)' : 'white',
                  color: subjects.includes(s) ? 'white' : 'var(--text-muted)'
                }}>
                  <input type="checkbox" style={{ display: 'none' }} checked={subjects.includes(s)} onChange={() => toggleSubject(s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Bio</label>
            <textarea rows={3} value={form.bio} onChange={set('bio')} placeholder="Tell students about your writing skills and experience..." style={{ resize: 'vertical' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" required value={form.password} onChange={set('password')} placeholder="Min. 6 characters" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 13 }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Writer Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--navy)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
