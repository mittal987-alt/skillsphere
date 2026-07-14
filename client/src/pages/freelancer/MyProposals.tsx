import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { proposalsApi } from '../../api/proposals';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type Proposal } from '../../types';

export default function MyProposals() {
  const qc = useQueryClient();

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['freelancer-proposals'],
    queryFn: () => proposalsApi.getMyProposals(),
    select: r => r.data.proposals as Proposal[],
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => proposalsApi.withdraw(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['freelancer-proposals'] }),
  });

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">My Proposals</h1>
        <p className="section-subtitle">Track your submitted applications</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !proposals || proposals.length === 0 ? (
        <div className="empty-state glass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h3>No proposals yet</h3>
          <p>You haven't applied to any gigs.</p>
          <Link to="/gigs" className="btn-primary" style={{ marginTop: '1rem' }}>Find Work</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {proposals.map(proposal => {
            const gig = typeof proposal.gig === 'object' ? proposal.gig : null;

            return (
              <div key={proposal._id} className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <Link to={`/gigs/${gig?._id}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0', textDecoration: 'none' }}>
                        {gig?.title || 'Unknown Gig'}
                      </Link>
                      <span className={`badge badge-${proposal.status.toLowerCase()}`}>{proposal.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>Applied on {new Date(proposal.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>${proposal.bidAmount}</div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>in {proposal.estimatedDays} days</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Cover Letter</h4>
                  <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {proposal.coverLetter}
                  </p>
                </div>

                {proposal.status === 'Pending' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-danger"
                      onClick={() => { if (confirm('Withdraw this proposal?')) withdrawMutation.mutate(proposal._id) }}
                      disabled={withdrawMutation.isPending}
                    >
                      Withdraw Proposal
                    </button>
                  </div>
                )}
                {proposal.status === 'Accepted' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to="/chat" className="btn-primary">Message Client</Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
