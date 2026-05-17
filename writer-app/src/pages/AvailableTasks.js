import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

const URGENCY_COLOR = { LOW: 'var(--success)', MEDIUM: 'var(--warning)', HIGH: 'var(--error)' };

export default function AvailableTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/tasks/open').then(r => { setTasks(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleAccept = async (taskId) => {
    setAccepting(taskId);
    try {
      await API.put(`/tasks/${taskId}/accept`);
      navigate(`/task/${taskId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not accept this task.');
      setAccepting(null);
    }
  };

  const filtered = tasks.filter(t =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.studentCity?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: 8 }}>Available Tasks</h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse and accept homework tasks posted by students.</p>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, subject, or city..." style={{ marginBottom: 24 }} />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="icon">🔍</div><h3>No tasks available</h3><p>Check back soon — new tasks are posted regularly.</p></div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} task{filtered.length !== 1 ? 's' : ''} available</p>
            {filtered.map(task => (
              <div key={task.id} className="card fade-in" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <h3 style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{task.title}</h3>
                      <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700, background: URGENCY_COLOR[task.urgency] + '18', color: URGENCY_COLOR[task.urgency] }}>
                        {task.urgency}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                      <span>📚 {task.subject}</span>
                      <span>📄 {task.pages} pages</span>
                      <span>📅 Deadline: {task.deadline}</span>
                      <span>🏙️ {task.studentCity || 'Anywhere'}</span>
                      <span>🚚 {task.deliveryType?.replace(/_/g, ' ')}</span>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 12 }}>
                        {task.description}
                      </p>
                    )}
                    {task.specialInstructions && (
                      <div style={{ background: '#fef9c3', borderRadius: 6, padding: '6px 12px', fontSize: '0.8rem', color: '#a16207' }}>
                        ⚠️ Special Instructions: {task.specialInstructions}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)' }}>₹{task.budget}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student budget</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Payment: {task.paymentMethod}
                    </div>
                    <button
                      onClick={() => handleAccept(task.id)}
                      disabled={accepting === task.id}
                      className="btn btn-gold"
                      style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                      {accepting === task.id ? 'Accepting...' : '✓ Accept Task'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
