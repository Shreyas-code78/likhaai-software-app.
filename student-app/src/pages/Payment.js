import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

const METHODS = [
  { value: 'UPI', icon: '📱', label: 'UPI', desc: 'GPay, PhonePe, Paytm, BHIM', fields: [{ name: 'upiId', label: 'UPI ID', placeholder: 'yourname@bank' }] },
  { value: 'CARD', icon: '💳', label: 'Debit / Credit Card', desc: 'Visa, Mastercard, Rupay', fields: [
    { name: 'cardNumber', label: 'Card Number', placeholder: '1234 5678 9012 3456' },
    { name: 'expiry', label: 'Expiry', placeholder: 'MM/YY' },
    { name: 'cvv', label: 'CVV', placeholder: '•••' },
    { name: 'cardName', label: 'Name on Card', placeholder: 'Your Full Name' },
  ]},
  { value: 'COD', icon: '💵', label: 'Cash on Delivery', desc: 'Pay the writer in cash when work is delivered', fields: [] },
];

export default function Payment() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [step, setStep] = useState(1); // 1=summary, 2=method, 3=processing, 4=success/fail
  const [method, setMethod] = useState('UPI');
  const [fieldValues, setFieldValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/tasks/${taskId}`).then(r => { setTask(r.data); setLoading(false); }).catch(() => navigate('/tasks'));
  }, [taskId, navigate]);

  const handlePay = async () => {
    setStep(3); // Processing
    await new Promise(r => setTimeout(r, 2500)); // Simulate processing
    try {
      const res = await API.put(`/tasks/${taskId}/pay`, { paymentMethod: method, agreedPrice: task?.budget });
      setResult({ success: true, ...res.data });
      setStep(4);
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Payment failed. Please try again.' });
      setStep(4);
    }
  };

  const selectedMethod = METHODS.find(m => m.value === method);

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--cream)' }}><Navbar /><div className="page-loader"><div className="spinner" /></div></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        {step < 3 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
            {['Order Summary', 'Payment Method', 'Confirm'].map((label, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                    background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--navy)' : 'var(--border)',
                    color: step >= i + 1 ? 'white' : 'var(--text-muted)' }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? 'var(--navy)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? 'var(--success)' : 'var(--border)' }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 1: Summary */}
        {step === 1 && (
          <div className="card fade-in" style={{ padding: 36 }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--navy)', marginBottom: 24 }}>📋 Order Summary</h2>
            <div style={{ background: 'var(--cream)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>{task?.title}</div>
              {[
                ['Subject', task?.subject],
                ['Pages', `${task?.pages} pages`],
                ['Deadline', task?.deadline],
                ['Delivery Type', task?.deliveryType?.replace(/_/g, ' ')],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: '1.1rem', fontWeight: 700 }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--navy)' }}>₹{task?.budget}</span>
              </div>
            </div>
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              🔒 This is a simulated payment — no real money will be charged.
            </div>
            <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', padding: 14 }}>
              Proceed to Payment →
            </button>
          </div>
        )}

        {/* Step 2: Method selection */}
        {step === 2 && (
          <div className="card fade-in" style={{ padding: 36 }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--navy)', marginBottom: 8 }}>💳 Payment Method</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Select your preferred payment method.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {METHODS.map(opt => (
                <label key={opt.value} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px',
                  border: `2px solid ${method === opt.value ? 'var(--navy)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: method === opt.value ? '#f0f4ff' : 'white', transition: 'all 0.2s'
                }}>
                  <input type="radio" name="method" value={opt.value} checked={method === opt.value} onChange={() => setMethod(opt.value)} style={{ marginTop: 2, accentColor: 'var(--navy)' }} />
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Dynamic fields */}
            {selectedMethod?.fields.length > 0 && (
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: selectedMethod.value === 'CARD' ? '1fr 1fr' : '1fr', gap: 12 }}>
                  {selectedMethod.fields.map(field => (
                    <div key={field.name} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{field.label}</label>
                      <input value={fieldValues[field.name] || ''} onChange={e => setFieldValues(p => ({ ...p, [field.name]: e.target.value }))} placeholder={field.placeholder} type={field.name === 'cvv' ? 'password' : 'text'} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid var(--border)', marginBottom: 20, fontWeight: 700, fontSize: '1.05rem' }}>
              <span>Amount to Pay</span>
              <span style={{ color: 'var(--navy)' }}>₹{task?.budget}</span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1 }}>← Back</button>
              <button onClick={handlePay} className="btn btn-gold" style={{ flex: 2, padding: 14 }}>
                Pay ₹{task?.budget} →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <div className="card fade-in" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 70, height: 70, margin: '0 auto 24px', border: '4px solid var(--border)', borderTop: '4px solid var(--navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 8 }}>Processing Payment</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please wait while we securely process your payment...</p>
            <div style={{ marginTop: 24, fontSize: '0.85rem', color: 'var(--text-light)' }}>🔒 Secured by Likhaai Pay</div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && result && (
          <div className="card fade-in" style={{ padding: 48, textAlign: 'center' }}>
            {result.success ? (
              <>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>✅</div>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--success)', marginBottom: 8 }}>Payment Successful!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your payment has been confirmed and the writer has been notified.</p>
                <div style={{ background: 'var(--cream)', borderRadius: 10, padding: 16, marginBottom: 28, textAlign: 'left' }}>
                  {[
                    ['Transaction ID', result.transactionId],
                    ['Amount Paid', `₹${result.amount}`],
                    ['Method', result.method],
                    ['Status', 'Confirmed'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.88rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate(`/task/${taskId}`)} className="btn btn-primary" style={{ width: '100%', padding: 14 }}>View Task →</button>
              </>
            ) : (
              <>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>❌</div>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--error)', marginBottom: 8 }}>Payment Failed</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{result.message}</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { setStep(2); setResult(null); }} className="btn btn-outline" style={{ flex: 1 }}>Try Again</button>
                  <button onClick={() => navigate(`/task/${taskId}`)} className="btn btn-ghost" style={{ flex: 1 }}>Go Back</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
