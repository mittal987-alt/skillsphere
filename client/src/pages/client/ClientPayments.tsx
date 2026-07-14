import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type Payment } from '../../types';

export default function ClientPayments() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['client-payments'],
    queryFn: () => paymentsApi.getMyPayments(),
    select: r => r.data.payments as Payment[],
  });

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Payment History</h1>
        <p className="section-subtitle">Track your transactions and escrow releases</p>
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
          <p>Your payment history will appear here once you hire freelancers.</p>
        </div>
      ) : (
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gig</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
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
                        ${p.amount.toLocaleString()}
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
