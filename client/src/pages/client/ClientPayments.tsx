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
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const { data: payments, isLoading } = useQuery({
    queryKey: ['client-payments'],
    queryFn: () => paymentsApi.getMyPayments(),
    select: r => r.data.payments as Payment[],
  });

  const totalSpent   = payments?.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0) ?? 0;

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

  const getGigId = (payment: Payment): string => {
    if (typeof payment.gig === 'object') return (payment.gig as { _id: string })._id;
    return payment.gig as string;
  };

  const getFreelancerId = (payment: Payment): string => {
    if (typeof payment.freelancer === 'object') return (payment.freelancer as FreelancerProfile)._id;
    return payment.freelancer as string;
  };

  const generateInvoice = (payment: Payment) => {
    const gigTitle = getGigTitle(payment);
    const freelancerName = getFreelancerName(payment);
    const date = new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${payment._id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #6366f1; font-size: 28px; }
            .header p { margin: 4px 0; color: #6b7280; }
            .details { margin-bottom: 40px; }
            .details strong { display: inline-block; width: 120px; color: #111827; }
            .details p { margin: 8px 0; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 16px; text-align: left; }
            th { background-color: #f9fafb; font-weight: 600; color: #374151; }
            td { color: #4b5563; }
            .total { text-align: right; margin-top: 24px; font-size: 1.25rem; font-weight: bold; color: #10b981; }
            @media print { 
              body { padding: 0; } 
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>SkillSphere</h1>
              <p>Payment Receipt / Invoice</p>
            </div>
            <div style="text-align: right;">
              <p>Invoice ID: <strong>#${payment._id.slice(-8).toUpperCase()}</strong></p>
              <p>Date: ${date}</p>
              <p style="color: #10b981; font-weight: bold;">Status: PAID</p>
            </div>
          </div>
          
          <div class="details">
            <p><strong>Billed To:</strong> Client</p>
            <p><strong>Freelancer:</strong> ${freelancerName}</p>
            <p><strong>Gig:</strong> ${gigTitle}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right; width: 150px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Payment for Gig: ${gigTitle}</td>
                <td style="text-align: right;">₹${payment.amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total">
            Total Paid: ₹${payment.amount.toLocaleString('en-IN')}
          </div>
          
          <div style="margin-top: 60px; text-align: center; color: #9ca3af; font-size: 0.875rem; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>Thank you for using SkillSphere!</p>
            <p>This is a computer-generated receipt.</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
    }
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
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {p.status === 'Paid' && (
                              <button
                                onClick={() => generateInvoice(p)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                  padding: '0.4rem 0.875rem',
                                  background: 'rgba(99,102,241,0.1)',
                                  border: '1px solid rgba(99,102,241,0.3)',
                                  borderRadius: 8, color: '#a78bfa', fontWeight: 600,
                                  fontSize: '0.78rem', cursor: 'pointer',
                                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.2)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)'; }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                Invoice
                              </button>
                            )}
                            {p.status === 'Released' && !reviewedIds.has(p._id) && (
                              <button
                                onClick={() => setReviewPayment(p)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                  padding: '0.4rem 0.875rem',
                                  background: 'rgba(245,158,11,0.1)',
                                  border: '1px solid rgba(245,158,11,0.3)',
                                  borderRadius: 8, color: '#f59e0b', fontWeight: 600,
                                  fontSize: '0.78rem', cursor: 'pointer',
                                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.2)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.1)'; }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                Leave a Review
                              </button>
                            )}
                            {p.status === 'Released' && reviewedIds.has(p._id) && (
                              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>✓ Reviewed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
      )}

      {/* Review Modal */}
      {reviewPayment && (() => {
        const gigId = getGigId(reviewPayment);
        const freelancerId = getFreelancerId(reviewPayment);
        const freelancerName = getFreelancerName(reviewPayment);
        const gigTitle = getGigTitle(reviewPayment);
        return (
          <ReviewModal
            gigId={gigId}
            freelancerId={freelancerId}
            freelancerName={freelancerName}
            gigTitle={gigTitle}
            onClose={() => setReviewPayment(null)}
            onSuccess={() => {
              setReviewedIds(prev => new Set(prev).add(reviewPayment._id));
              setReviewPayment(null);
            }}
          />
        );
      })()}
    </div>
  );
}
