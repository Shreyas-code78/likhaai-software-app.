import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

const STATUS_TABS = ['ALL', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];
const STATUS_LABEL = { ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', DELIVERED: 'Delivered' };
const STATUS_CLS = { ASSIGNED: 'badge-assigned', IN_PROGRESS: 'badge-in-progress', COMPLETED: 'badge-completed', DELIVERED: 'badge-delivered' };

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    API.get('/tasks/assigned').then(r => { setTasks(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'ALL' ? tasks : tasks.filter(t => t.status === activeTab);
  const countOf = s => s === 'ALL' ? tasks.length : tasks.filter(t => t.status === s).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: 4 }}>My Tasks</h1>
          <p style={{ color: 'var(--text-muted)' }}>All tasks you have accepted from students.</p>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="btn" style={{
              padding: '7px 14px', fontSize: '0.82rem', flex: 1,
              background: activeTab === tab ? 'var(--navy)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)', borderRadius: 6
            }}>
              {tab === 'ALL' ? 'All' : STATUS_LABEL[tab]} ({countOf(tab)})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="icon">📋</div><h3>No tasks in this category</h3><p>Accept tasks from the Available Tasks page.</p><Link to="/tasks/available" className="btn btn-primary" style={{ marginTop: 12 }}>Browse Available Tasks</Link></div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(task => (
              <Link key={task.id} to={`/task/${task.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{task.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>📚 {task.subject}</span>
                      <span>📄 {task.pages} pages</span>
                      <span>📅 Due: {task.deadline}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--navy)' }}>₹{task.budget}</div>
                      {task.paid && <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>✅ Paid</div>}
                    </div>
                    <span className={`badge ${STATUS_CLS[task.status] || ''}`}>{STATUS_LABEL[task.status] || task.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
