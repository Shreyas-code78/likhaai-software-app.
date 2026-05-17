import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

export default function WriterProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [writer, setWriter] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get(`/writers/${id}`),
      API.get('/tasks/my'),
    ]).then(([wrRes, taskRes]) => {
      setWriter(wrRes.data);
      const open = taskRes.data.filter(t => t.status === 'OPEN');
      setMyTasks(open);
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/browse-writers'); });
  }, [id, navigate]);

  const handleAssign = async (taskId) => {
    setAssigning(true);
    try {
      await API.put(`/tasks/${taskId}/assign/${id}`);
      alert('Writer assigned successfully! You can now message them through the task.');
      navigate(`/task/${taskId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign writer.');
      setAssigning(false);
    }
  };

  const stars = n => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--cream)' }}><Navbar /><div className="page-loader"><div className="spinner" /></div></div>;
  if (!writer) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <button onClick={() => navigate('/browse-writers')} className="btn btn-ghost" style={{ marginBottom: 24, padding: '6px 0' }}>← Back to Writers</button>

        {/* Hero */}
        <div className="card fade-in" style={{ padding: 36, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--navy), var(--navy-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700, flexShrink: 0 }}>
              {writer.profilePic
                ? <img src={writer.profilePic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : writer.name?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--navy)' }}>{writer.name}</h1>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: writer.available ? 'var(--success)' : '#e5e7eb' }} />
                <span style={{ fontSize: '0.85rem', color: writer.available ? 'var(--success)' : 'var(--text-muted)', fontWeight: 500 }}>
                  {writer.available ? 'Available' : 'Currently Busy'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8, flexWrap: 'wrap' }}>
                <span>📍 {writer.city || 'Location not set'}</span>
                <span>✅ {writer.completedTasks || 0} tasks completed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="stars">{stars(writer.rating)}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{(writer.rating || 0).toFixed(1)}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>({writer.totalReviews || 0} reviews)</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--navy)' }}>₹{writer.pricePerPage || 8}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per page</div>
            </div>
          </div>

          {writer.bio && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 8 }}>ABOUT</div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>{writer.bio}</p>
            </div>
          )}

          {writer.subjects?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10 }}>SUBJECTS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {writer.subjects.map(s => (
                  <span key={s} style={{ padding: '5px 14px', background: 'var(--cream)', borderRadius: 100, fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 600, border: '1px solid var(--border)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {writer.handwritingSamples?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10 }}>HANDWRITING SAMPLES</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {writer.handwritingSamples.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', width: 80, height: 80, borderRadius: 8, border: '2px solid var(--border)', overflow: 'hidden', background: 'var(--cream)' }}>
                    <img src={url} alt={`Sample ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assign */}
        {writer.available && myTasks.length > 0 && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'DM Sans', fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Assign to One of Your Open Tasks</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>Select a task to assign this writer directly.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myTasks.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'white' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.subject} · {t.pages} pages · ₹{t.budget}</div>
                  </div>
                  <button onClick={() => handleAssign(t.id)} disabled={assigning} className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
                    {assigning ? '...' : 'Assign'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!writer.available && (
          <div className="alert alert-info">This writer is currently busy and not accepting new tasks. You can still view their profile and contact them when they become available.</div>
        )}
      </div>
    </div>
  );
}
