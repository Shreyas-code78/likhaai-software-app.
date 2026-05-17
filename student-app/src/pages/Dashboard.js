import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, value, label, color }) {
  return (
    <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function TaskCard({ task }) {
  const statusMap = {
    OPEN: { label: 'Open', cls: 'badge-open' },
    ASSIGNED: { label: 'Assigned', cls: 'badge-assigned' },
    IN_PROGRESS: { label: 'In Progress', cls: 'badge-in-progress' },
    COMPLETED: { label: 'Completed', cls: 'badge-completed' },
    DELIVERED: { label: 'Delivered', cls: 'badge-delivered' },
  };
  const s = statusMap[task.status] || { label: task.status, cls: '' };

  return (
    <Link to={`/task/${task.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: '20px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <h3 style={{ fontFamily: 'DM Sans', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{task.title}</h3>
          <span className={`badge ${s.cls}`}>{s.label}</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span>📚 {task.subject}</span>
          <span>📄 {task.pages} pages</span>
          <span>💰 ₹{task.budget}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/tasks/my').then(r => { setTasks(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length,
    completed: tasks.filter(t => ['COMPLETED', 'DELIVERED'].includes(t.status)).length,
    open: tasks.filter(t => t.status === 'OPEN').length,
  };

  const recent = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: 8 }}>
            Good to see you, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's an overview of your homework tasks.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          <StatCard icon="📋" value={stats.total} label="Total Tasks" color="#1a3a6b" />
          <StatCard icon="⚡" value={stats.active} label="In Progress" color="#c9922a" />
          <StatCard icon="✅" value={stats.completed} label="Completed" color="#16a34a" />
          <StatCard icon="🔍" value={stats.open} label="Open (Awaiting Writer)" color="#7c3aed" />
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: '28px', marginBottom: 32, background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.4rem', marginBottom: 8 }}>Ready to get started?</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>Post a new task or find a skilled writer near you.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/post-task" className="btn btn-gold">+ Post New Task</Link>
              <Link to="/browse-writers" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>Browse Writers</Link>
            </div>
          </div>
        </div>

        {/* Recent tasks */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--navy)' }}>Recent Tasks</h2>
          <Link to="/tasks" style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 600 }}>View All →</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : recent.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="icon">📝</div>
              <h3>No tasks yet</h3>
              <p style={{ marginBottom: 16 }}>Post your first task and get matched with a writer today.</p>
              <Link to="/post-task" className="btn btn-primary">Post Your First Task</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {recent.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  );
}
