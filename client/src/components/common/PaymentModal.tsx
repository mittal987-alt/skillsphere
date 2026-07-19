import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsApi } from '../../api/payments';
import { proposalsApi } from '../../api/proposals';
import { useQueryClient } from '@tanstack/react-query';

interface PaymentModalProps {
  proposalId: string;
  gigId: string;
  amount: number;
  freelancerName: string;
  gigTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src*="razorpay"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentModal({
  proposalId,
  gigId,
  amount,
  freelancerName,
  gigTitle,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [errorMsg, setErrorMsg] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const handlePay = useCallback(async () => {
    setStep('processing');
    setErrorMsg('');

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay checkout. Check your internet connection.');

      // 2. Create backend order
      const { data } = await paymentsApi.createOrder({ proposalId });
      const { order } = data;

      if (order.id.startsWith('mock_order_')) {
        // Skip Razorpay UI for mock orders and simulate a success
        await new Promise(res => setTimeout(res, 1200));
        await paymentsApi.verifyPayment({
          razorpay_order_id: order.id,
          razorpay_payment_id: 'mock_payment_' + Date.now(),
          razorpay_signature: 'mock_signature',
        });
        await proposalsApi.approveJob(proposalId);
      } else {
        // 3. Open Razorpay checkout
        await new Promise<void>((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_S3dDF3BgNwVbQ6',
            amount: order.amount,
            currency: order.currency,
            order_id: order.id,
            name: 'SkillSphere',
            description: `Payment for: ${gigTitle}`,
            theme: { color: '#6366f1' },
            modal: {
              ondismiss: () => reject(new Error('Payment cancelled')),
            },
            handler: async (response: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              try {
                await paymentsApi.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                await proposalsApi.approveJob(proposalId);
                resolve();
              } catch {
                reject(new Error('Payment verification failed. Please contact support.'));
              }
            },
          });
          rzp.on('payment.failed', (resp: { error: { description: string } }) => {
            reject(new Error(resp.error?.description || 'Payment failed'));
          });
          rzp.open();
        });
      }

      // 4. Success
      setStep('success');
      qc.invalidateQueries({ queryKey: ['client-payments'] });
      qc.invalidateQueries({ queryKey: ['proposals'] });
      qc.invalidateQueries({ queryKey: ['client-gigs'] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg === 'Payment cancelled') {
        setStep('confirm');
      } else {
        setErrorMsg(msg);
        setStep('error');
      }
    }
  }, [proposalId, gigTitle, qc]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== 'processing') onClose(); }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }
        @keyframes checkPop { 0% { transform: scale(0) } 70% { transform: scale(1.2) } 100% { transform: scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 460,
        background: 'linear-gradient(145deg, #0f0f23, #1a1a35)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20,
        padding: '2rem',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)',
        animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* ── CONFIRM STEP ── */}
        {step === 'confirm' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 6 }}>
                  Secure Razorpay Payment
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Confirm Payment</h2>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1, padding: '0 0 4px' }}
              >×</button>
            </div>

            {/* Payment details card */}
            {(() => {
              const platformFee = parseFloat((amount * 0.10).toFixed(2));
              const freelancerAmount = parseFloat((amount - platformFee).toFixed(2));
              return (
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Gig</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem', maxWidth: '60%', textAlign: 'right' }}>{gigTitle}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Freelancer</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{freelancerName}</span>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0.75rem 0' }} />

                  {/* Fee breakdown */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Subtotal</span>
                    <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Platform fee</span>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem',
                        background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
                        border: '1px solid rgba(139,92,246,0.3)', borderRadius: 999,
                      }}>10%</span>
                    </div>
                    <span style={{ color: '#a78bfa', fontSize: '0.9rem', fontWeight: 600 }}>
                      −₹{platformFee.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Freelancer receives</span>
                    <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>₹{freelancerAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Total */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem' }}>You pay</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })()}


            {/* Escrow notice */}
            <div style={{
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 10, padding: '0.875rem 1rem',
              marginBottom: '1.5rem',
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🔒</span>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                Funds are held in <strong style={{ color: '#a78bfa' }}>secure escrow</strong> and only released to the freelancer when you approve their work.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, color: '#94a3b8',
                  fontWeight: 600, cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                style={{
                  flex: 2, padding: '0.75rem',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: 10,
                  color: 'white', fontWeight: 700,
                  cursor: 'pointer', fontSize: '0.95rem',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(99,102,241,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)'; }}
              >
                Pay ₹{amount.toLocaleString('en-IN')}
              </button>
            </div>
          </>
        )}

        {/* ── PROCESSING STEP ── */}
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              width: 56, height: 56,
              border: '3px solid rgba(99,102,241,0.2)',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              margin: '0 auto 1.5rem',
              animation: 'spin 0.8s linear infinite',
            }} />
            <h3 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 8 }}>Opening Razorpay…</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Complete payment in the Razorpay window</p>
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))',
                border: '2px solid rgba(16,185,129,0.4)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                animation: 'checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ color: '#10b981', fontWeight: 800, fontSize: '1.25rem', marginBottom: 8 }}>Payment Successful!</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                The project is now completed. Please leave a review for <strong>{freelancerName}</strong>.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      color: star <= rating ? '#fbbf24' : '#475569',
                      transition: 'transform 0.1s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Write your review..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0', fontSize: '0.9rem', resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                  navigate('/client/payments');
                }}
                disabled={submittingReview}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, color: '#94a3b8',
                  fontWeight: 600, cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Skip
              </button>
              <button
                disabled={submittingReview}
                onClick={async () => {
                  setSubmittingReview(true);
                  try {
                    await fetch('/api/reviews', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({ gigId, rating, review: comment })
                    });
                    onSuccess();
                    onClose();
                    navigate('/client/payments');
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
                style={{
                  flex: 2, padding: '0.75rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', borderRadius: 10,
                  color: 'white', fontWeight: 700,
                  cursor: 'pointer', fontSize: '0.95rem',
                  opacity: submittingReview ? 0.7 : 1,
                }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}

        {/* ── ERROR STEP ── */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: 72, height: 72,
              background: 'rgba(239,68,68,0.1)',
              border: '2px solid rgba(239,68,68,0.3)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h3 style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.25rem', marginBottom: 8 }}>Payment Failed</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>{errorMsg}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={onClose} style={{ padding: '0.65rem 1.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>
                Close
              </button>
              <button onClick={() => setStep('confirm')} style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
