import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Geography', 'Economics', 'Computer Science', 'Accountancy', 'Business Studies', 'Political Science', 'Other'];
const URGENCY = [{ value: 'LOW', label: 'Standard (3-5 days)', color: '#16a34a' }, { value: 'MEDIUM', label: 'Urgent (1-2 days)', color: '#d97706' }, { value: 'HIGH', label: 'Express (same day)', color: '#dc2626' }];

export default function PostTask() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: '', description: '', subject: '', pages: 1, deadline: '', urgency: 'MEDIUM', budget: '', specialInstructions: '', deliveryType: 'HAND_TO_HAND', paymentMethod: 'COD' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const next = () => { setError(''); setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const res = await API.post('/tasks', { ...form, pages: Number(form.pages), budget: Number(form.budget) });
      navigate(`/task/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post task. Please try again.');
      setLoading(false);
    }
  };

  const estimatedCost = form.pages * 8;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
        {/* Progress */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {['Task Details', 'Requirements', 'Payment & Review'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                  background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--navy)' : 'var(--border)',
                  color: step >= i + 1 ? 'white' : 'var(--text-muted)'
                }}>{step > i + 1 ? '✓' : i + 1}</div>
                <span style={{ fontSize: '0.82rem', fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--navy)' : 'var(--text-muted)' }}>{label}</span>
                {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? 'var(--success)' : 'var(--border)', marginLeft: 8 }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="card fade-in" style={{ padding: 36 }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--navy)', marginBottom: 8 }}>
            {step === 1 && '📚 Task Details'}
            {step === 2 && '📋 Requirements'}
            {step === 3 && '💳 Payment & Review'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 28 }}>
            {step === 1 && 'Tell us about the assignment you need completed.'}
            {step === 2 && 'Provide additional details for the writer.'}
            {step === 3 && 'Review your task and choose payment method.'}
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 && (
            <div>
              <div className="form-group">
                <label className="form-label">Assignment Title *</label>
                <input value={form.title} onChange={set('title')} placeholder="e.g., Chapter 5 – Newton's Laws of Motion" required />
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select value={form.subject} onChange={set('subject')} required>
                  <option value="">Select subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Number of Pages *</label>
                  <input type="number" min={1} max={100} value={form.pages} onChange={set('pages')} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Deadline *</label>
                  <input type="date" value={form.deadline} onChange={set('deadline')} min={new Date().toISOString().split('T')[0]} required />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Urgency Level</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {URGENCY.map(u => (
                    <label key={u.value} style={{
                      flex: 1, padding: '12px', border: `2px solid ${form.urgency === u.value ? u.color : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: form.urgency === u.value ? u.color + '10' : 'white',
                      display: 'flex', flexDirection: 'column', gap: 4
                    }}>
                      <input type="radio" name="urgency" value={u.value} checked={form.urgency === u.value} onChange={set('urgency')} style={{ display: 'none' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: u.color }}>{u.value}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={next} disabled={!form.title || !form.subject || !form.deadline} className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="form-group">
                <label className="form-label">Describe the Assignment *</label>
                <textarea rows={4} value={form.description} onChange={set('description')} placeholder="Describe in detail what needs to be written — topic, style, references, etc." required style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Special Instructions (optional)</label>
                <textarea rows={3} value={form.specialInstructions} onChange={set('specialInstructions')} placeholder="Handwriting style, pen color, paper type, formatting preferences..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Your Budget (₹) *</label>
                <input type="number" min={1} value={form.budget} onChange={set('budget')} placeholder={`Suggested: ₹${estimatedCost} (₹8/page)`} />
                <span className="form-hint">Estimated cost at ₹8/page: ₹{estimatedCost}. Writers may negotiate.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Preference</label>
                <select value={form.deliveryType} onChange={set('deliveryType')}>
                  <option value="HAND_TO_HAND">Hand-to-Hand (meet the writer)</option>
                  <option value="COURIER">Courier/Postal</option>
                  <option value="SCAN_ONLINE">Scan & Send Online</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={back} className="btn btn-ghost" style={{ flex: 1 }}>← Back</button>
                <button onClick={next} disabled={!form.description || !form.budget} className="btn btn-primary" style={{ flex: 2 }}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              {/* Summary */}
              <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'DM Sans', fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--navy)' }}>Task Summary</h3>
                {[
                  ['Title', form.title], ['Subject', form.subject],
                  ['Pages', form.pages], ['Deadline', form.deadline],
                  ['Urgency', form.urgency], ['Budget', `₹${form.budget}`],
                  ['Delivery', form.deliveryType.replace(/_/g, ' ')],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                {[
                  { value: 'COD', icon: '💵', label: 'Cash on Delivery', desc: 'Pay the writer in cash when work is delivered' },
                  { value: 'UPI', icon: '📱', label: 'UPI', desc: 'Pay online via UPI after task is completed' },
                  { value: 'CARD', icon: '💳', label: 'Card / Net Banking', desc: 'Pay via debit/credit card or net banking' },
                ].map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', marginBottom: 8,
                    border: `2px solid ${form.paymentMethod === opt.value ? 'var(--navy)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: form.paymentMethod === opt.value ? 'var(--cream)' : 'white'
                  }}>
                    <input type="radio" name="paymentMethod" value={opt.value} checked={form.paymentMethod === opt.value} onChange={set('paymentMethod')} style={{ accentColor: 'var(--navy)' }} />
                    <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                🔒 Your contact details are kept private. All communication happens through Likhaai's secure messaging system.
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={back} className="btn btn-ghost" style={{ flex: 1 }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn btn-gold" style={{ flex: 2 }}>
                  {loading ? 'Posting Task...' : '🚀 Post Task'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
