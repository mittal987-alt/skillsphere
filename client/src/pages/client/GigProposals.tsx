import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalsApi } from '../../api/proposals';
import { gigsApi } from '../../api/gigs';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';
import PaymentModal from '../../components/common/PaymentModal';
import AITalentRecommendations from '../../components/client/AITalentRecommendations';
import { type Proposal } from '../../types';

export default function GigProposals() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<'proposals' | 'ai-matches'>('proposals');
  const [payingProposal, setPayingProposal] = useState<Proposal | null>(null);

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

  

  const getFreelancerInfo = (proposal: Proposal) => {
    const freelancer = typeof proposal.freelancer === 'object' ? proposal.freelancer : null;
    const freelancerUser = freelancer && typeof freelancer.user === 'object' ? freelancer.user : null;
    return { freelancer, freelancerUser };
  };

  return (
    <div className="page-container">
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.875rem', padding: 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>

      {gig && (
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">{gig.title}</h1>
          <p className="section-subtitle">Review proposals or find AI recommended talent</p>
          
          <div style={{ 
            display: 'flex', gap: '1rem', marginTop: '1.5rem', 
            borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' 
          }}>
            <button
              onClick={() => setActiveTab('proposals')}
              style={{
                background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
                fontSize: '0.95rem', fontWeight: 600,
                color: activeTab === 'proposals' ? 'var(--color-text)' : 'var(--color-text-muted)',
                borderBottom: activeTab === 'proposals' ? '2px solid #6366f1' : '2px solid transparent',
                marginBottom: '-0.5rem', transition: 'all 0.2s'
              }}
            >
              Received Proposals ({proposals?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('ai-matches')}
              style={{
                background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
                fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: activeTab === 'ai-matches' ? '#a855f7' : 'var(--color-text-muted)',
                borderBottom: activeTab === 'ai-matches' ? '2px solid #a855f7' : '2px solid transparent',
                marginBottom: '-0.5rem', transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>✨</span> AI Talent Matches
            </button>
          </div>
        </div>
      )}

      {activeTab === 'ai-matches' ? (
        <AITalentRecommendations gigId={id!} />
      ) : isLoading ? (
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
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
          </div>

          {proposals.map(proposal => {
            const { freelancer, freelancerUser } = getFreelancerInfo(proposal);
            const isPending = proposal.status === 'Pending';
            const isAccepted = proposal.status === 'Accepted';
            const isCompleted = proposal.status === 'Completed';

            return (
              <div
                key={proposal._id}
                className="glass"
                style={{
                  padding: '1.5rem',
                  opacity: proposal.status === 'Rejected' ? 0.55 : 1,
                  transition: 'opacity 0.2s',
                  borderColor: isAccepted ? 'rgba(16,185,129,0.3)' : undefined,
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      background: isAccepted
                        ? 'linear-gradient(135deg,#10b981,#059669)'
                        : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
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
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                      ₹{proposal.bidAmount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>{proposal.estimatedDays} days delivery</div>
                  </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  {proposal.coverLetter}
                </p>

                {/* Footer row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge badge-${proposal.status.toLowerCase()}`}>{proposal.status}</span>
                    <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {isPending && (
                      <>
                        <button
                          id={`accept-proposal-${proposal._id}`}
                          className="btn-primary"
                          onClick={() => acceptMutation.mutate(proposal._id)}
                          disabled={acceptMutation.isPending}
                          style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                        >
                          {acceptMutation.isPending ? 'Accepting…' : 'Accept'}
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => rejectMutation.mutate(proposal._id)}
                          disabled={rejectMutation.isPending}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <span style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                        Waiting for freelancer to complete work
                      </span>
                    )}

                    {isCompleted && (
                      <button
                        id={`pay-proposal-${proposal._id}`}
                        onClick={() => setPayingProposal(proposal)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.55rem 1.25rem',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white', fontWeight: 700, fontSize: '0.875rem',
                          border: 'none', borderRadius: 8, cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                        Approve & Pay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {payingProposal && (() => {
        const { freelancerUser } = getFreelancerInfo(payingProposal);
        return (
          <PaymentModal
            proposalId={payingProposal._id}
            gigId={typeof payingProposal.gig === 'object' ? payingProposal.gig._id : payingProposal.gig}
            amount={payingProposal.bidAmount}
            freelancerName={freelancerUser?.name || 'Freelancer'}
            gigTitle={gig?.title || 'Gig'}
            onClose={() => setPayingProposal(null)}
            onSuccess={() => setPayingProposal(null)}
          />
        );
      })()}
    </div>
  );
}
