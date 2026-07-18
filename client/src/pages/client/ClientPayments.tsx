import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type Payment, type FreelancerProfile, type User } from '../../types';
import ReviewModal from '../../components/common/ReviewModal';

type StatusFilter = 'All' | 'Pending' | 'Paid' | 'Released' | 'Failed';

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  Paid:    { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  Released:{ bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  Failed:  { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  Refunded:{ bg: 'rgba(100,116,139,0.12)',color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.Failed;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.7rem', borderRadius: 999,
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.02em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
      {status}
    </span>
  );
}

export default function ClientPayments() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [reviewPayment, setReviewPayment] = useState<Payment | null>(null);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['client-payments'],
    queryFn: () => paymentsApi.getMyPayments(),
    select: r => r.data.payments as Payment[],
  });

  const releaseMutation = useMutation({
    mutationFn: (paymentId: string) => paymentsApi.releasePayment(paymentId),
    onMutate: (paymentId) => setReleasingId(paymentId),
    onSettled: () => setReleasingId(null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-payments'] });
      qc.invalidateQueries({ queryKey: ['client-gigs'] });
    },
  });

  // ── Derived stats ──
  const totalSpent   = payments?.filter(p => ['Paid','Released'].includes(p.status)).reduce((s, p) => s + p.amount, 0) ?? 0;
  const inEscrow     = payments?.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0) ?? 0;
  const released     = payments?.filter(p => p.status === 'Released').reduce((s, p) => s + p.amount, 0) ?? 0;

  const filtered = payments?.filter(p => statusFilter === 'All' || p.status === statusFilter) ?? [];

  const getFreelancerName = (payment: Payment): string => {
    if (typeof payment.freelancer === 'object') {
      const fl = payment.freelancer as FreelancerProfile;
      if (typeof fl.user === 'object') return (fl.user as User).name;
    }
    return '—';
  };

  const getGigTitle = (payment: Payment): string => {
    if (typeof payment.gig === 'object') return (payment.gig as { title: string }).title;
    return '—';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Payments</h1>
        <p className="section-subtitle">Manage escrow and track your transaction history</p>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, color: '#6366f1', icon: '💸' },
          { label: 'In Escrow',   value: `₹${inEscrow.toLocaleString('en-IN')}`,   color: '#f59e0b', icon: '🔒' },
          { label: 'Released',    value: `₹${released.toLocaleString('en-IN')}`,    color: '#10b981', icon: '✅' },
          { label: 'Transactions',value: String(payments?.length ?? 0),              color: '#8b5cf6', icon: '📋' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div className="stat-value" style={{
              fontSize: '1.6rem',
              background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !payments || payments.length === 0 ? (
        <div className="empty-state glass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <h3>No payments yet</h3>
          <p>Accept a proposal and pay to see transactions here.</p>
        </div>
      ) : (
        <>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {(['All', 'Pending', 'Paid', 'Released', 'Failed'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '0.35rem 1rem', borderRadius: 999,
                  border: `1px solid ${statusFilter === s ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                  background: statusFilter === s ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                  color: statusFilter === s ? '#a78bfa' : '#94a3b8',
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="glass" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Date', 'Gig', 'Freelancer', 'Amount', 'Status', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '1rem 1.25rem', color: '#64748b',
                        fontWeight: 700, fontSize: '0.75rem',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#475569', fontSize: '0.875rem' }}>
                        No {statusFilter.toLowerCase()} payments found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(p => (
                      <tr
                        key={p._id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '1.1rem 1.25rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '1.1rem 1.25rem', color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem', maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getGigTitle(p)}
                          </div>
                        </td>
                        <td style={{ padding: '1.1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%',
                              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, color: 'white', fontSize: '0.75rem', flexShrink: 0,
                            }}>
                              {getFreelancerName(p)[0]?.toUpperCase() || 'F'}
                            </div>
                            <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>{getFreelancerName(p)}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1.1rem 1.25rem', fontWeight: 800, fontSize: '1rem', color: '#10b981', whiteSpace: 'nowrap' }}>
                          ₹{p.amount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1.1rem 1.25rem' }}>
                          <StatusBadge status={p.status} />
                        </td>
                        <td style={{ padding: '1.1rem 1.25rem' }}>
                          {p.status === 'Paid' && (
                            <button
                              id={`release-payment-${p._id}`}
                              onClick={() => releaseMutation.mutate(p._id)}
                              disabled={releasingId === p._id}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.4rem 0.875rem',
                                background: releasingId === p._id ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: 8, color: '#10b981', fontWeight: 700,
                                fontSize: '0.78rem', cursor: releasingId === p._id ? 'wait' : 'pointer',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={e => { if (releasingId !== p._id) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.18)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)'; }}
                            >
                              {releasingId === p._id ? (
                                <>
                                  <span style={{ width: 10, height: 10, border: '2px solid rgba(16,185,129,0.3)', borderTopColor: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                                  Releasing…
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                  Release
                                </>
                              )}
                            </button>
                          )}
                          {p.status === 'Released' && (
                            <button
                              onClick={() => setReviewPayment(p)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.4rem 0.875rem',
                                background: 'rgba(99,102,241,0.1)',
                                border: '1px solid rgba(99,102,241,0.3)',
                                borderRadius: 8, color: '#a78bfa', fontWeight: 600,
                                fontSize: '0.78rem', cursor: 'pointer',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.18)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)'; }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              Leave Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Escrow explanation */}
          {inEscrow > 0 && (
            <div style={{
              marginTop: '1.5rem',
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              background: 'rgba(99,102,241,0.07)',
              border: '1px solid rgba(99,102,241,0.18)',
              borderRadius: 12, padding: '1rem 1.25rem',
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🔒</span>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.7 }}>
                <strong style={{ color: '#a78bfa' }}>₹{inEscrow.toLocaleString('en-IN')} is currently in escrow.</strong>{' '}
                Click <strong>Release</strong> once you're satisfied with the freelancer's work to transfer the funds to them.
              </p>
            </div>
          )}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

          {reviewPayment && (
            <ReviewModal
              gigId={typeof reviewPayment.gig === 'object' ? reviewPayment.gig._id : reviewPayment.gig}
              freelancerId={typeof reviewPayment.freelancer === 'object' ? reviewPayment.freelancer._id : reviewPayment.freelancer as string}
              freelancerName={getFreelancerName(reviewPayment)}
              gigTitle={getGigTitle(reviewPayment)}
              onClose={() => setReviewPayment(null)}
              onSuccess={() => setReviewPayment(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
