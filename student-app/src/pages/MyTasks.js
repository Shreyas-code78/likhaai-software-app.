import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

const STATUS_TABS = ['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];
const STATUS_LABEL = { OPEN: 'Open', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', DELIVERED: 'Delivered' };
const STATUS_CLS = { OPEN: 'badge-open', ASSIGNED: 'badge-assigned', IN_PROGRESS: 'badge-in-progress', COMPLETED: 'badge-completed', DELIVERED: 'badge-delivered' };

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    API.get('/tasks/my').then(r => { setTasks(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'ALL' ? tasks : tasks.filter(t => t.status === activeTab);
  const countOf = s => s === 'ALL' ? tasks.length : tasks.filter(t => t.status === s).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: 4 }}>My Tasks</h1>
            <p style={{ color: 'var(--text-muted)' }}>Track all your homework assignments.</p>
          </div>
          <Link to="/post-task" className="btn btn-primary">+ New Task</Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="btn" style={{
              padding: '7px 14px', fontSize: '0.82rem', flex: '1 0 auto',
              background: activeTab === tab ? 'var(--navy)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
              borderRadius: 6
            }}>
              {tab === 'ALL' ? 'All' : STATUS_LABEL[tab]} ({countOf(tab)})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="icon">📋</div><h3>No tasks here</h3><p>Tasks in this status will appear here.</p></div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(task => (
              <Link key={task.id} to={`/task/${task.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    📝
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem', marginBottom: 4 }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>📚 {task.subject}</span>
                      <span>📄 {task.pages} pages</span>
                      <span>📅 Due: {task.deadline}</span>
                      <span>💰 ₹{task.budget}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span className={`badge ${STATUS_CLS[task.status] || ''}`}>{STATUS_LABEL[task.status] || task.status}</span>
                    {task.writerId && <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Writer assigned</span>}
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
