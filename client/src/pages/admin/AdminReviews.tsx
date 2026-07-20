import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../layouts/AdminLayout';

const StarRating = ({ rating }: { rating: number }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(star => (
      <svg
        key={star}
        width="14" height="14" viewBox="0 0 24 24"
        fill={star <= rating ? '#f59e0b' : 'none'}
        stroke={star <= rating ? '#f59e0b' : '#475569'}
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, marginLeft: 4 }}>{rating}/5</span>
  </div>
);

export default function AdminReviews() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => adminApi.getReviews(),
    select: r => r.data.reviews as any[],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const filtered = reviews?.filter(r => {
    const reviewerName = r.reviewer?.name || '';
    const gigTitle = r.gig?.title || '';
    const matchesSearch =
      reviewerName.toLowerCase().includes(search.toLowerCase()) ||
      gigTitle.toLowerCase().includes(search.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(search.toLowerCase());
    const matchesRating = ratingFilter === 'all' || String(r.rating) === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const avgRating = reviews?.length
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

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
            Moderate Reviews
          </h1>
          <p style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>
            {reviews?.length ?? 0} total reviews — average rating {avgRating} ⭐
          </p>
        </div>

        {/* Summary Cards */}
        {!isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Total Reviews', value: reviews?.length ?? 0, color: '#6366f1' },
              { label: 'Avg Rating', value: `${avgRating} / 5`, color: '#f59e0b' },
              { label: '5-Star Reviews', value: reviews?.filter((r: any) => r.rating === 5).length ?? 0, color: '#10b981' },
              { label: '1-Star Reviews', value: reviews?.filter((r: any) => r.rating === 1).length ?? 0, color: '#ef4444' },
            ].map(card => (
              <div key={card.label} style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 12, padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by reviewer, gig, or comment…"
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
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem', borderRadius: 8,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map(r => (
              <option key={r} value={String(r)}>{r} Star{r !== 1 ? 's' : ''}</option>
            ))}
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
                    <th style={thStyle}>Reviewer</th>
                    <th style={thStyle}>Gig</th>
                    <th style={thStyle}>Rating</th>
                    <th style={thStyle}>Comment</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-faint)' }}>
                        No reviews found
                      </td>
                    </tr>
                  )}
                  {filtered?.map((r: any) => (
                    <tr key={r._id}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: 'white', fontSize: '0.75rem',
                          }}>
                            {(r.reviewer?.name?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
                              {r.reviewer?.name || 'Unknown'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)' }}>
                              {r.reviewer?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: 180 }}>
                          {r.gig?.title || 'N/A'}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <StarRating rating={r.rating} />
                      </td>
                      <td style={tdStyle}>
                        <div style={{
                          fontSize: '0.82rem', color: 'var(--color-text-muted)',
                          maxWidth: 280, overflow: 'hidden',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {r.comment || '—'}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)', whiteSpace: 'nowrap' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => { if (confirm('Delete this review? This cannot be undone.')) deleteMutation.mutate(r._id); }}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
