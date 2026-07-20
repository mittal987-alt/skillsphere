import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../layouts/AdminLayout';
import { type Gig } from '../../types';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Open: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  'In Progress': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  Completed: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
  Cancelled: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
};

export default function AdminGigs() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: gigs, isLoading } = useQuery({
    queryKey: ['admin-gigs'],
    queryFn: () => adminApi.getGigs(),
    select: r => r.data.gigs as Gig[],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteGig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-gigs'] }),
  });

  const filtered = gigs?.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getClientName = (gig: Gig): string => {
    if (!gig.client) return 'N/A';
    if (typeof gig.client === 'string') return 'N/A';
    const clientProfile = gig.client as any;
    if (clientProfile.user && typeof clientProfile.user !== 'string') {
      return clientProfile.user.name || 'N/A';
    }
    return 'N/A';
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem 2.5rem', maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            Manage Gigs
          </h1>
          <p style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>
            {gigs?.length ?? 0} total gigs — browse and moderate platform gigs
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 220,
              padding: '0.6rem 1rem', borderRadius: 8,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem', borderRadius: 8,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Client</th>
                    <th style={thStyle}>Budget</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-faint)' }}>
                        No gigs found
                      </td>
                    </tr>
                  )}
                  {filtered?.map((g) => {
                    const statusStyle = STATUS_COLORS[g.status] || { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8' };
                    return (
                      <tr key={g._id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem', maxWidth: 260 }}>
                            {g.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', marginTop: 2 }}>
                            {g.skills?.slice(0, 3).join(', ')}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            {getClientName(g)}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
                            ${g.budget?.toLocaleString()}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>
                            {g.category}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 999,
                            fontSize: '0.75rem', fontWeight: 600,
                            background: statusStyle.bg, color: statusStyle.color,
                          }}>
                            {g.status}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => { if (confirm(`Delete "${g.title}"? This cannot be undone.`)) deleteMutation.mutate(g._id); }}
                            style={{
                              padding: '0.35rem 0.7rem', borderRadius: 6, border: 'none',
                              background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                            }}
                          >
                            Delete
                          </button>
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
