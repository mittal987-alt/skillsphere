import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../layouts/AdminLayout';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Paid: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  Pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  Released: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
  Failed: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  Refunded: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
};

export default function AdminPayments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminApi.getPayments(),
    select: r => r.data.payments as any[],
  });

  const filtered = payments?.filter(p => {
    const gigTitle = p.gig?.title || '';
    const matchesSearch = gigTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments?.reduce((sum: number, p: any) => p.status === 'Paid' ? sum + p.amount : sum, 0) || 0;
  const totalPlatformFee = payments?.reduce((sum: number, p: any) => p.status === 'Paid' ? sum + (p.platformFee || 0) : sum, 0) || 0;

  const thStyle: React.CSSProperties = {
    padding: '0.875rem 1.25rem',
    color: 'var(--color-text-faint)',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'left',
  };

  const tdStyle: React.CSSProperties = {
    padding: '1rem 1.25rem',
    borderTop: '1px solid var(--color-border)',
    verticalAlign: 'middle',
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem 2.5rem', maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            Payments
          </h1>
          <p style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>
            Monitor all transactions on the platform
          </p>
        </div>

        {/* Summary Cards */}
        {!isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Total Payments', value: payments?.length ?? 0, color: '#6366f1' },
              { label: 'Revenue (Paid)', value: `$${totalRevenue.toLocaleString()}`, color: '#10b981' },
              { label: 'Platform Fees', value: `$${totalPlatformFee.toLocaleString()}`, color: '#f59e0b' },
            ].map(card => (
              <div key={card.label} style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 12, padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by gig title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 220,
              padding: '0.6rem 1rem', borderRadius: 8,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: '0.875rem', outline: 'none',
            }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem', borderRadius: 8,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Released">Released</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={thStyle}>Gig</th>
                    <th style={thStyle}>Client</th>
                    <th style={thStyle}>Freelancer</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Platform Fee</th>
                    <th style={thStyle}>Method</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-faint)' }}>
                        No payments found
                      </td>
                    </tr>
                  )}
                  {filtered?.map((p: any) => {
                    const statusStyle = STATUS_COLORS[p.status] || { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8' };
                    const clientName = p.client?.user?.name || 'N/A';
                    const freelancerName = p.freelancer?.user?.name || 'N/A';
                    return (
                      <tr key={p._id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem', maxWidth: 200 }}>
                            {p.gig?.title || 'N/A'}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{clientName}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{freelancerName}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
                            ${p.amount?.toLocaleString()}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.85rem', color: '#f59e0b' }}>
                            ${p.platformFee?.toLocaleString() ?? '—'}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', textTransform: 'capitalize' }}>
                            {p.paymentMethod || '—'}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 999,
                            fontSize: '0.75rem', fontWeight: 600,
                            background: statusStyle.bg, color: statusStyle.color,
                          }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)', whiteSpace: 'nowrap' }}>
                            {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
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
    </AdminLayout>
  );
}
