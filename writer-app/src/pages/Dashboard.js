import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [available, setAvailable] = useState(user?.available ?? true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    API.get('/tasks/assigned').then(r => { setTasks(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const res = await API.put('/writers/availability', { available: !available });
      setAvailable(res.data.available);
    } catch (e) { alert('Failed to update availability.'); }
    setToggling(false);
  };

  const earnings = tasks.filter(t => t.paid).reduce((sum, t) => sum + (t.agreedPrice || t.budget || 0), 0);
  const active = tasks.filter(t => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status));
  const completed = tasks.filter(t => ['COMPLETED', 'DELIVERED'].includes(t.status));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: 8 }}>Welcome, {user?.name?.split(' ')[0]}! ✍️</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your assigned tasks and track your earnings.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { icon: '⚡', value: active.length, label: 'Active Tasks', color: '#c9922a' },
            { icon: '✅', value: completed.length, label: 'Completed', color: '#16a34a' },
            { icon: '⭐', value: (user?.rating || 0).toFixed(1), label: 'Rating', color: '#7c3aed' },
            { icon: '💰', value: `₹${earnings.toFixed(0)}`, label: 'Total Earned', color: '#1a3a6b' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Availability toggle */}
        <div className="card" style={{ padding: 24, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Availability Status</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {available ? 'You are visible to students and can receive new tasks.' : 'You are hidden from students. Toggle on to receive new task requests.'}
            </div>
          </div>
          <button onClick={toggleAvailability} disabled={toggling} className={`btn ${available ? 'btn-danger' : 'btn-primary'}`} style={{ minWidth: 140 }}>
            {toggling ? '...' : available ? 'Go Unavailable' : 'Go Available'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <Link to="/tasks/available" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center', padding: 14 }}>🔍 Browse Available Tasks</Link>
          <Link to="/tasks/my" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: 14 }}>📋 My Assigned Tasks</Link>
        </div>

        {/* Active tasks */}
        {active.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--navy)', marginBottom: 16 }}>Active Tasks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {active.map(task => (
                <Link key={task.id} to={`/task/${task.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 20, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{task.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                        <span>📚 {task.subject}</span>
                        <span>📄 {task.pages} pages</span>
                        <span>📅 Due: {task.deadline}</span>
                        <span>🏙️ {task.studentCity}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1.1rem' }}>₹{task.budget}</div>
                      <Link to={`/chat/${task.id}`} style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }} onClick={e => e.stopPropagation()}>💬 Message Student →</Link>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
