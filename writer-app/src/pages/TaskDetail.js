import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_LABEL = { OPEN: 'Open', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', DELIVERED: 'Delivered' };
const STATUS_CLS = { OPEN: 'badge-open', ASSIGNED: 'badge-assigned', IN_PROGRESS: 'badge-in-progress', COMPLETED: 'badge-completed', DELIVERED: 'badge-delivered' };
const NEXT_STATUS = { ASSIGNED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: 'DELIVERED' };
const NEXT_LABEL = { ASSIGNED: 'Mark as In Progress', IN_PROGRESS: 'Mark as Completed', COMPLETED: 'Mark as Delivered' };

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    API.get(`/tasks/${id}`).then(r => { setTask(r.data); setLoading(false); }).catch(() => { setLoading(false); navigate('/tasks/my'); });
  }, [id, navigate]);

  const updateStatus = async () => {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    setUpdating(true);
    try {
      const res = await API.put(`/tasks/${id}/status`, { status: next });
      setTask(res.data);
    } catch (err) { alert(err.response?.data?.message || 'Failed to update status.'); }
    setUpdating(false);
  };

  const rejectTask = async () => {
    if (!window.confirm('Are you sure you want to reject this task? It will go back to the open pool.')) return;
    try {
      await API.put(`/tasks/${id}/reject`);
      navigate('/tasks/available');
    } catch (err) { alert('Failed to reject task.'); }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--cream)' }}><Navbar /><div className="page-loader"><div className="spinner" /></div></div>;
  if (!task) return null;

  const isAssigned = user?.id === task.writerId;
  const nextStatus = NEXT_STATUS[task.status];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <button onClick={() => navigate('/tasks/my')} className="btn btn-ghost" style={{ marginBottom: 24, padding: '6px 0' }}>← Back</button>

        <div className="card fade-in" style={{ padding: 36, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', color: 'var(--navy)', marginBottom: 8 }}>{task.title}</h1>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>📚 {task.subject}</span>
                <span>📄 {task.pages} pages</span>
                <span>📅 Due: {task.deadline}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <span className={`badge ${STATUS_CLS[task.status] || ''}`}>{STATUS_LABEL[task.status] || task.status}</span>
              {task.paid && <span className="badge badge-delivered">✅ Payment Received</span>}
            </div>
          </div>

          <div className="divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              ['Budget', `₹${task.budget}`],
              ['Urgency', task.urgency],
              ['Delivery Type', task.deliveryType?.replace(/_/g, ' ')],
              ['Payment Method', task.paymentMethod],
              ['Student City', task.studentCity],
              ['Posted By', task.studentName],
            ].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--cream)', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{k}</div>
                <div style={{ fontWeight: 600 }}>{v || '—'}</div>
              </div>
            ))}
          </div>

          {task.description && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 8 }}>DESCRIPTION</div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>{task.description}</p>
            </div>
          )}

          {task.specialInstructions && (
            <div style={{ background: '#fef9c3', borderRadius: 8, padding: 14, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a16207', marginBottom: 4 }}>⚠️ Special Instructions</div>
              <p style={{ fontSize: '0.9rem' }}>{task.specialInstructions}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {isAssigned && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 16 }}>TASK ACTIONS</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to={`/chat/${task.id}`} className="btn btn-primary">
                💬 Message Student
              </Link>
              {nextStatus && (
                <button onClick={updateStatus} disabled={updating} className="btn btn-gold">
                  {updating ? 'Updating...' : NEXT_LABEL[task.status]}
                </button>
              )}
              {task.status === 'ASSIGNED' && (
                <button onClick={rejectTask} className="btn btn-ghost" style={{ color: 'var(--error)' }}>
                  Reject Task
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
