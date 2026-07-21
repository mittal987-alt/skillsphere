import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { gigsApi } from '../../api/gigs';
import { proposalsApi } from '../../api/proposals';
import { reviewsApi } from '../../api/reviews';
import { generateAICoverLetter } from '../../api/ai';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';
import { type Review } from '../../types';

interface ProposalForm {
  coverLetter: string;
  bidAmount: number;
  estimatedDays: number;
}

const statusColor: Record<string, string> = {
  Open: '#10b981',
  'In Progress': '#f59e0b',
  Completed: '#6366f1',
  Cancelled: '#ef4444',
};

export default function GigDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { data: gigData, isLoading } = useQuery({
    queryKey: ['gig', id],
    queryFn: () => gigsApi.getById(id!),
    select: r => r.data.gig,
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['gig-reviews', id],
    queryFn: () => reviewsApi.getGigReviews(id!),
    select: r => r.data.reviews as Review[],
    enabled: !!id,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProposalForm>();

  const handleGenerateCoverLetter = async () => {
    if (!id) return;
    setIsGeneratingAI(true);
    try {
      const res = await generateAICoverLetter(id);
      if (res.coverLetter) {
        setValue('coverLetter', res.coverLetter);
      }
    } catch (err: any) {
      console.error('Failed to generate cover letter with AI:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: (data: ProposalForm) =>
      proposalsApi.submit({ gigId: id!, ...data }),
    onSuccess: () => {
      setSuccessMsg('Proposal submitted successfully!');
      setShowProposalForm(false);
      reset();
      qc.invalidateQueries({ queryKey: ['proposals', 'my'] });
    },
    onError: (err: unknown) => {
      const axErr = err as { response?: { data?: { message?: string } } };
      setError(axErr.response?.data?.message || 'Failed to submit proposal');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!gigData) return <div className="page-container"><div className="empty-state"><h3>Gig not found</h3></div></div>;

  const gig = gigData;
  const client = typeof gig.client === 'object' ? gig.client : null;
  const clientUser = client && typeof client.user === 'object' ? client.user : null;

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.875rem', padding: 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>

      <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '3px 12px', borderRadius: 999, border: '1px solid rgba(167,139,250,0.2)' }}>
                {gig.category}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor[gig.status] || '#94a3b8', background: `${statusColor[gig.status]}18`, padding: '3px 12px', borderRadius: 999, border: `1px solid ${statusColor[gig.status]}40` }}>
                {gig.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#475569', padding: '3px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {gig.experienceLevel}
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3, letterSpacing: '-0.02em', margin: 0 }}>{gig.title}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>${gig.budget.toLocaleString()}</div>
            <div style={{ fontSize: '0.78rem', color: '#475569' }}>Budget</div>
          </div>
        </div>

        {/* Description */}
        <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{gig.description}</p>

        {/* Skills */}
        {gig.skills?.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {gig.skills.map((s: string) => (
                <span key={s} style={{ padding: '5px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 999, fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Meta info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem' }}>
          {gig.deadline && (
            <div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</div>
              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{new Date(gig.deadline).toLocaleDateString()}</div>
            </div>
          )}
          {clientUser && (
            <div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Posted By</div>
              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{clientUser.name}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Posted</div>
            <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{new Date(gig.createdAt).toLocaleDateString()}</div>
          </div>
          {gig.milestones && gig.milestones.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Milestones</div>
              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{gig.milestones.length}</div>
            </div>
          )}
        </div>

        {/* Milestones */}
        {gig.milestones && gig.milestones.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Milestones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {gig.milestones.map((m: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{m.title}</div>
                    {m.description && <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 2 }}>{m.description}</div>}
                  </div>
                  <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem', flexShrink: 0 }}>${m.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {successMsg && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '0.75rem 1rem', color: '#10b981', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {successMsg}
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {isAuthenticated && user?.role === 'freelancer' && gig.status === 'Open' && (
          <div>
            {!showProposalForm ? (
              <button id="submit-proposal-btn" className="btn-primary" onClick={() => setShowProposalForm(true)} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                Submit Proposal
              </button>
            ) : (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Submit Your Proposal</h3>
                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={isGeneratingAI}
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      opacity: isGeneratingAI ? 0.7 : 1,
                    }}
                  >
                    <span>✨</span>
                    {isGeneratingAI ? 'Generating AI Proposal...' : 'Generate AI Proposal'}
                  </button>
                </div>
                <form onSubmit={handleSubmit(d => submitMutation.mutate(d))}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="label" htmlFor="bid-amount">Your Bid ($)</label>
                      <input id="bid-amount" type="number" className="input" placeholder={String(gig.budget)}
                        {...register('bidAmount', { required: 'Bid amount required', min: 1 })} />
                      {errors.bidAmount && <span className="error-text">{errors.bidAmount.message}</span>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="label" htmlFor="estimated-days">Estimated Days</label>
                      <input id="estimated-days" type="number" className="input" placeholder="e.g. 14"
                        {...register('estimatedDays', { required: 'Estimate required', min: 1 })} />
                      {errors.estimatedDays && <span className="error-text">{errors.estimatedDays.message}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="cover-letter">Cover Letter</label>
                    <textarea id="cover-letter" className="textarea" placeholder="Explain why you're a great fit for this gig..."
                      {...register('coverLetter', { required: 'Cover letter is required', minLength: { value: 50, message: 'Min 50 characters' } })} style={{ minHeight: 140 }} />
                    {errors.coverLetter && <span className="error-text">{errors.coverLetter.message}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" id="confirm-proposal-btn" className="btn-primary" disabled={submitMutation.isPending} style={{ opacity: submitMutation.isPending ? 0.7 : 1 }}>
                      {submitMutation.isPending ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => { setShowProposalForm(false); setError(''); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {!isAuthenticated && gig.status === 'Open' && (
          <div style={{ padding: '1.25rem', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.95rem' }}>Sign in as a freelancer to submit a proposal</p>
            <a href="/login" className="btn-primary">Sign In</a>
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="glass" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Reviews ({reviews.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((r: any) => (
              <div key={r._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <StarRating rating={r.rating} size={14} />
                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
