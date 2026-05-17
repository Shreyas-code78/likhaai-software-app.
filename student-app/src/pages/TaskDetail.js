import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_CLS = { OPEN: 'badge-open', ASSIGNED: 'badge-assigned', IN_PROGRESS: 'badge-in-progress', COMPLETED: 'badge-completed', DELIVERED: 'badge-delivered' };
const STATUS_LABEL = { OPEN: 'Open', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', DELIVERED: 'Delivered' };

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [writer, setWriter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/tasks/${id}`).then(r => {
      setTask(r.data);
      if (r.data.writerId) {
        API.get(`/writers/${r.data.writerId}`).then(wr => setWriter(wr.data)).catch(() => {});
      }
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/tasks'); });
  }, [id, navigate]);

  const handleStatusUpdate = async (status) => {
    try {
      const res = await API.put(`/tasks/${id}/status`, { status });
      setTask(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--cream)' }}><Navbar /><div className="page-loader"><div className="spinner" /></div></div>;
  if (!task) return null;

  const isPaid = task.paid;
  const canPay = task.writerId && !isPaid && ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(task.status);
  const isOwner = user?.id === task.studentId;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <button onClick={() => navigate('/tasks')} className="btn btn-ghost" style={{ marginBottom: 24, padding: '6px 0', fontSize: '0.9rem' }}>
          ← Back to My Tasks
        </button>

        <div className="card fade-in" style={{ padding: 36, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', color: 'var(--navy)', marginBottom: 8 }}>{task.title}</h1>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>📚 {task.subject}</span>
                <span>📄 {task.pages} pages</span>
                <span>📅 Due: {task.deadline}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <span className={`badge ${STATUS_CLS[task.status] || ''}`}>{STATUS_LABEL[task.status] || task.status}</span>
              {isPaid && <span className="badge badge-delivered">✅ Paid</span>}
            </div>
          </div>

          <div className="divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              ['Budget', `₹${task.budget}`],
              ['Urgency', task.urgency],
              ['Delivery', task.deliveryType?.replace(/_/g, ' ')],
              ['Payment', task.paymentMethod],
            ].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--cream)', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{k}</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{v}</div>
              </div>
            ))}
          </div>

          {task.description && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>DESCRIPTION</div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>{task.description}</p>
            </div>
          )}
          {task.specialInstructions && (
            <div style={{ background: '#fef9c3', borderRadius: 8, padding: 14, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a16207', marginBottom: 4 }}>⚠️ Special Instructions</div>
              <p style={{ fontSize: '0.9rem' }}>{task.specialInstructions}</p>
            </div>
          )}
        </div>

        {/* Writer card */}
        {writer ? (
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 14 }}>ASSIGNED WRITER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                {writer.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{writer.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📍 {writer.city} · ★ {(writer.rating || 0).toFixed(1)} ({writer.totalReviews || 0} reviews)</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                <Link to={`/chat/${task.id}`} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                  💬 Message Writer
                </Link>
                <Link to={`/writer/${writer.id}`} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '0.88rem' }}>Profile</Link>
              </div>
            </div>
          </div>
        ) : task.status === 'OPEN' ? (
          <div className="card" style={{ padding: 24, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⏳</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Waiting for a Writer</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16 }}>Your task is live and visible to writers in your area.</p>
            <Link to="/browse-writers" className="btn btn-outline" style={{ fontSize: '0.88rem' }}>Assign a Writer Manually →</Link>
          </div>
        ) : null}

        {/* Actions */}
        {isOwner && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 14 }}>ACTIONS</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {canPay && (
                <Link to={`/payment/${task.id}`} className="btn btn-gold">💳 Make Payment</Link>
              )}
              {task.status === 'DELIVERED' && !task.rated && (
                <button className="btn btn-outline" onClick={() => alert('Rating feature coming soon!')}>⭐ Rate Writer</button>
              )}
              {task.status === 'OPEN' && (
                <button className="btn btn-danger" onClick={() => handleStatusUpdate('CANCELLED')}>Cancel Task</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
