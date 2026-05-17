import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await API.get(`/messages/${taskId}`);
      setMessages(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages.');
    }
  }, [taskId]);

  useEffect(() => {
    const init = async () => {
      try {
        const taskRes = await API.get(`/tasks/${taskId}`);
        setTask(taskRes.data);
        await loadMessages();
        // Mark as read
        await API.put(`/messages/${taskId}/read`).catch(() => {});
      } catch (err) {
        setError('Unable to load this conversation.');
      } finally {
        setLoading(false);
      }
    };
    init();

    // Poll for new messages every 5 seconds as fallback
    pollRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [taskId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await API.post('/messages', { taskId, content: text.trim() });
      setMessages(prev => [...prev, res.data]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const d = formatDate(msg.createdAt);
    if (d !== lastDate) { grouped.push({ type: 'date', label: d }); lastDate = d; }
    grouped.push({ type: 'message', msg });
  }

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--cream)' }}><Navbar /><div className="page-loader"><div className="spinner" /></div></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: 780, width: '100%', margin: '0 auto', padding: '24px 24px 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>

        {/* Chat header */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(`/task/${taskId}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>←</button>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>W</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{task?.title || 'Task Chat'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Secure in-platform messaging · Messages are monitored for safety</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>🔒 Secure</div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 8 }}>{error}</div>}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 12 }}>
          {grouped.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 8 }}>
              <div style={{ fontSize: '2rem' }}>💬</div>
              <p style={{ fontWeight: 600 }}>No messages yet</p>
              <p style={{ fontSize: '0.85rem' }}>Start the conversation with your writer!</p>
            </div>
          ) : (
            grouped.map((item, idx) => {
              if (item.type === 'date') return (
                <div key={idx} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light)', padding: '8px 0', fontWeight: 600 }}>{item.label}</div>
              );
              const msg = item.msg;
              const isMe = msg.senderId === user?.id;
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                  {!isMe && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>
                      {msg.senderName?.charAt(0)}
                    </div>
                  )}
                  <div style={{
                    maxWidth: '70%',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe ? 'var(--navy)' : 'white',
                    color: isMe ? 'white' : 'var(--text)',
                    boxShadow: 'var(--shadow-sm)',
                    border: isMe ? 'none' : '1px solid var(--border)'
                  }}>
                    {!isMe && <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gold)', marginBottom: 4 }}>{msg.senderName} · {msg.senderRole}</div>}
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.content}</div>
                    <div style={{ fontSize: '0.68rem', color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-light)', marginTop: 4, textAlign: 'right' }}>{formatTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ padding: '12px 0 20px', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            style={{ flex: 1, borderRadius: 24, padding: '12px 18px', resize: 'none', maxHeight: 120, background: 'white' }}
          />
          <button type="submit" disabled={!text.trim() || sending} className="btn btn-primary" style={{ borderRadius: '50%', width: 46, height: 46, padding: 0, flexShrink: 0, fontSize: '1.1rem' }}>
            {sending ? '...' : '↑'}
          </button>
        </form>
      </div>
    </div>
  );
}
