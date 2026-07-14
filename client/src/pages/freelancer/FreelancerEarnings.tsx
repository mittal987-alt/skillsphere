import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type Payment } from '../../types';

export default function FreelancerEarnings() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['freelancer-payments'],
    queryFn: () => paymentsApi.getFreelancerPayments(),
    select: r => r.data.payments as Payment[],
  });

  const totalEarnings = payments?.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0) || 0;
  const pendingEarnings = payments?.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0) || 0;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Earnings</h1>
        <p className="section-subtitle">Overview of your income on SkillSphere</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#10b981', WebkitTextFillColor: 'initial', background: 'none' }}>
            ${totalEarnings.toLocaleString()}
          </div>
          <div className="stat-label">Total Earnings (Available)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#f59e0b', WebkitTextFillColor: 'initial', background: 'none' }}>
            ${pendingEarnings.toLocaleString()}
          </div>
          <div className="stat-label">Pending Earnings (In Escrow)</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Transaction History</h2>

      {isLoading ? (
        <LoadingSpinner />
      ) : !payments || payments.length === 0 ? (
        <div className="empty-state glass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <h3>No earnings yet</h3>
          <p>Complete gigs to earn money</p>
        </div>
      ) : (
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Gig</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const gig = typeof p.gig === 'object' ? p.gig : null;
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '1.25rem 1.5rem', color: '#e2e8f0', fontSize: '0.9rem' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 500 }}>
                        {gig?.title || 'Unknown Gig'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>
                        +${p.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
