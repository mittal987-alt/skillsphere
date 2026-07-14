import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { gigsApi } from '../../api/gigs';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type Gig } from '../../types';

export default function ManageGigs() {
  const qc = useQueryClient();

  const { data: gigs, isLoading } = useQuery({
    queryKey: ['client-gigs'],
    queryFn: () => gigsApi.getMyGigs(),
    select: r => r.data.gigs as Gig[],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gigsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-gigs'] }),
  });

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title">Manage Gigs</h1>
          <p className="section-subtitle">View, edit and track your posted gigs</p>
        </div>
        <Link to="/client/gigs/new" id="new-gig-btn" className="btn-primary">+ Post New Gig</Link>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !gigs || gigs.length === 0 ? (
        <div className="empty-state glass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
          </svg>
          <h3>No gigs posted yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Start by posting your first gig</p>
          <Link to="/client/gigs/new" className="btn-primary">Post a Gig</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {gigs.map(gig => (
            <div key={gig._id} className="glass" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1rem' }}>{gig.title}</span>
                  <span className={`badge badge-${gig.status.toLowerCase().replace(' ', '')}`}>{gig.status}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {gig.description}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#475569' }}>💰 ${gig.budget.toLocaleString()}</span>
                  <span style={{ fontSize: '0.78rem', color: '#475569' }}>📅 {new Date(gig.createdAt).toLocaleDateString()}</span>
                  <span style={{ fontSize: '0.78rem', color: '#475569' }}>🏷️ {gig.category}</span>
                  {gig.deadline && <span style={{ fontSize: '0.78rem', color: '#475569' }}>⏰ Due {new Date(gig.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                <Link to={`/client/gigs/${gig._id}/proposals`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Proposals
                </Link>
                <Link to={`/client/gigs/${gig._id}/edit`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Edit
                </Link>
                <button
                  className="btn-danger"
                  onClick={() => {
                    if (confirm('Delete this gig?')) deleteMutation.mutate(gig._id);
                  }}
                  style={{ fontSize: '0.8rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
