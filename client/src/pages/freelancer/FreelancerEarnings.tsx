import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type Payment, type ClientProfile, type User } from '../../types';

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Pending:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  Paid:     { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  Released: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  Failed:   { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.Failed;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.7rem', borderRadius: 999,
      fontSize: '0.75rem', fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
      {status}
    </span>
  );
}

export default function FreelancerEarnings() {
  const { data: respData, isLoading } = useQuery({
    queryKey: ['freelancer-payments'],
    queryFn: () => paymentsApi.getFreelancerPayments(),
    select: r => r.data,
  });

  const payments = (respData?.payments ?? []) as Payment[];
  // Server already returns net amounts; fall back to client-side calculation with 10% fee
  const totalEarnings   = respData?.totalEarnings   ?? payments.filter(p => p.status === 'Released').reduce((s, p) => s + (p.freelancerAmount ?? p.amount * 0.9), 0);
  const pendingEarnings = respData?.pendingEarnings  ?? payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.freelancerAmount ?? p.amount * 0.9), 0);
  const totalFeesPaid   = payments.reduce((s, p) => s + (p.platformFee ?? p.amount * 0.1), 0);
  const totalJobs = payments.length;

  const getClientName = (payment: Payment): string => {
    if (typeof payment.client === 'object') {
      const cl = payment.client as ClientProfile;
      if (typeof cl.user === 'object') return (cl.user as User).name;
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
        <h1 className="section-title">Earnings</h1>
        <p className="section-subtitle">Your income overview on SkillSphere</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          {
            label: 'Total Earned',
            value: `₹${(totalEarnings as number).toLocaleString('en-IN')}`,
            color: '#10b981',
            icon: '💰',
            sub: 'Net (after 10% platform fee)',
          },
          {
            label: 'In Escrow',
            value: `₹${(pendingEarnings as number).toLocaleString('en-IN')}`,
            color: '#f59e0b',
            icon: '🔒',
            sub: 'Awaiting client release',
          },
          {
            label: 'Platform Fee Paid',
            value: `₹${totalFeesPaid.toLocaleString('en-IN')}`,
            color: '#8b5cf6',
            icon: '🏛️',
            sub: '10% of gross earnings',
          },
          {
            label: 'Total Jobs',
            value: String(totalJobs),
            color: '#6366f1',
            icon: '📋',
            sub: 'All-time transactions',
          },
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
            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.25rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Platform fee notice */}
      <div style={{
        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        background: 'rgba(139,92,246,0.07)',
        border: '1px solid rgba(139,92,246,0.18)',
        borderRadius: 12, padding: '1rem 1.25rem',
        marginBottom: '2rem',
      }}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🏛️</span>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.7 }}>
          SkillSphere retains a <strong style={{ color: '#a78bfa' }}>10% platform fee</strong> on each payment.
          All amounts shown in your earnings already reflect your <strong style={{ color: '#10b981' }}>net payout</strong>.
        </p>
      </div>

      {/* Escrow notice if pending > 0 */}
      {(pendingEarnings as number) > 0 && (
        <div style={{
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12, padding: '1rem 1.25rem',
          marginBottom: '2rem',
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⏳</span>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.7 }}>
            <strong style={{ color: '#f59e0b' }}>₹{(pendingEarnings as number).toLocaleString('en-IN')} is in escrow</strong> — waiting for clients to approve your work. Once they click "Release", funds will be available to you.
          </p>
        </div>
      )}

      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>
        Transaction History
      </h2>

      {isLoading ? (
        <LoadingSpinner />
      ) : payments.length === 0 ? (
        <div className="empty-state glass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <h3>No earnings yet</h3>
          <p>Complete gigs and have clients release payments to earn money.</p>
        </div>
      ) : (
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Date', 'Gig', 'Client', 'Amount', 'Status'].map(h => (
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
                {payments.map(p => (
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
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: 'white', fontSize: '0.75rem', flexShrink: 0,
                        }}>
                          {getClientName(p)[0]?.toUpperCase() || 'C'}
                        </div>
                        <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>{getClientName(p)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.1rem 1.25rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: p.status === 'Released' ? '#10b981' : p.status === 'Paid' ? '#818cf8' : '#94a3b8' }}>
                        {p.status === 'Released' ? '+' : ''}₹{(p.freelancerAmount ?? p.amount * 0.9).toLocaleString('en-IN')}
                      </div>
                      {p.platformFee > 0 && (
                        <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 2 }}>
                          −₹{p.platformFee.toLocaleString('en-IN')} fee
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1.1rem 1.25rem' }}>
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
