import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Geography', 'Economics', 'Computer Science', 'Accountancy', 'Business Studies', 'Political Science', 'Other'];

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    pricePerPage: user?.pricePerPage || 8,
    city: user?.city || '',
  });
  const [subjects, setSubjects] = useState(user?.subjects || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleSubject = s => setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    try {
      await API.put('/writers/profile', { ...form, subjects, pricePerPage: Number(form.pricePerPage) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert(err.response?.data?.message || 'Failed to save profile.'); }
    setSaving(false);
  };

  const stars = '★'.repeat(Math.round(user?.rating || 0)) + '☆'.repeat(5 - Math.round(user?.rating || 0));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: 4 }}>My Profile</h1>
          <p style={{ color: 'var(--text-muted)' }}>Keep your profile updated to attract more students.</p>
        </div>

        {/* Stats card */}
        <div className="card" style={{ padding: 24, marginBottom: 24, display: 'flex', gap: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700, flexShrink: 0 }}>
            {user?.name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>{user?.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>📍 {user?.city} · {user?.email}</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div><span className="stars">{stars}</span> <span style={{ fontWeight: 700 }}>{(user?.rating || 0).toFixed(1)}</span> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({user?.totalReviews || 0} reviews)</span></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>✅ {user?.completedTasks || 0} tasks completed</div>
            </div>
          </div>
        </div>

        {saved && <div className="alert alert-success">Profile saved successfully!</div>}

        <form onSubmit={handleSave} className="card" style={{ padding: 32 }}>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input value={form.name} onChange={set('name')} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <input value={form.city} onChange={set('city')} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Price per Page (₹)</label>
              <input type="number" min={1} value={form.pricePerPage} onChange={set('pricePerPage')} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Bio</label>
            <textarea rows={4} value={form.bio} onChange={set('bio')} placeholder="Tell students about your experience and writing style..." style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Subjects</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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

          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            🔒 Your phone number is never visible to students. They can only contact you through the platform's secure messaging system.
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', padding: 13 }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
