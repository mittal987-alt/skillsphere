import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalsApi } from '../../api/proposals';
import { gigsApi } from '../../api/gigs';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';
import {type Proposal } from '../../types';

export default function GigProposals() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: gig } = useQuery({
    queryKey: ['gig', id],
    queryFn: () => gigsApi.getById(id!),
    select: r => r.data.gig,
    enabled: !!id,
  });

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals', 'gig', id],
    queryFn: () => proposalsApi.getGigProposals(id!),
    select: r => r.data.proposals as Proposal[],
    enabled: !!id,
  });

  const acceptMutation = useMutation({
    mutationFn: (proposalId: string) => proposalsApi.accept(proposalId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals', 'gig', id] });
      qc.invalidateQueries({ queryKey: ['client-gigs'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (proposalId: string) => proposalsApi.reject(proposalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals', 'gig', id] }),
  });

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.875rem', padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>

      {gig && (
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">{gig.title}</h1>
          <p className="section-subtitle">Review and manage proposals for this gig</p>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : !proposals || proposals.length === 0 ? (
        <div className="empty-state glass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
          </svg>
          <h3>No proposals yet</h3>
          <p>Freelancers will start submitting proposals soon</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received · sorted by bid amount
          </div>
          {proposals.map(proposal => {
            const freelancer = typeof proposal.freelancer === 'object' ? proposal.freelancer : null;
            const freelancerUser = freelancer && typeof freelancer.user === 'object' ? freelancer.user : null;
            const isPending = proposal.status === 'Pending';

            return (
              <div key={proposal._id} className="glass" style={{ padding: '1.5rem', opacity: proposal.status === 'Rejected' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: 'white', fontSize: '1rem', flexShrink: 0,
                    }}>
                      {freelancerUser?.name?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{freelancerUser?.name || 'Freelancer'}</div>
                      {freelancer && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <StarRating rating={freelancer.averageRating} size={13} />
                          <span style={{ fontSize: '0.75rem', color: '#475569' }}>{freelancer.totalReviews} reviews</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>${proposal.bidAmount}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>{proposal.estimatedDays} days</div>
                  </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1rem' }}>{proposal.coverLetter}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge badge-${proposal.status.toLowerCase()}`}>{proposal.status}</span>
                    <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {isPending && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        id={`accept-proposal-${proposal._id}`}
                        className="btn-primary"
                        onClick={() => acceptMutation.mutate(proposal._id)}
                        disabled={acceptMutation.isPending}
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => rejectMutation.mutate(proposal._id)}
                        disabled={rejectMutation.isPending}
                        style={{ padding: '0.5rem 1.25rem' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
