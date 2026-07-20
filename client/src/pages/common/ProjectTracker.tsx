import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gigsApi } from '../../api/gigs';
import { milestonesApi } from '../../api/milestones';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

export default function ProjectTracker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryFile, setDeliveryFile] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [disputeFile, setDisputeFile] = useState('');

  const { data: gig, isLoading } = useQuery({
    queryKey: ['gig-tracker', id],
    queryFn: () => gigsApi.getById(id!),
    select: r => r.data.gig,
  });

  const fundMutation = useMutation({
    mutationFn: ({ gigId, milestoneId }: { gigId: string; milestoneId: string }) =>
      milestonesApi.fund(gigId, milestoneId),
    onSuccess: () => {
      toast.success('Funds successfully locked in escrow!');
      qc.invalidateQueries({ queryKey: ['gig-tracker', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Funding failed');
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({ gigId, milestoneId, message, fileUrl }: { gigId: string; milestoneId: string; message: string; fileUrl?: string }) =>
      milestonesApi.submit(gigId, milestoneId, { message, fileUrl }),
    onSuccess: () => {
      toast.success('Deliverable submitted successfully!');
      setShowSubmitModal(false);
      setDeliveryMessage('');
      setDeliveryFile('');
      qc.invalidateQueries({ queryKey: ['gig-tracker', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Submission failed');
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ gigId, milestoneId }: { gigId: string; milestoneId: string }) =>
      milestonesApi.approve(gigId, milestoneId),
    onSuccess: () => {
      toast.success('Milestone approved & funds released!');
      qc.invalidateQueries({ queryKey: ['gig-tracker', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Approval failed');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ gigId, milestoneId, rejectionReason }: { gigId: string; milestoneId: string; rejectionReason: string }) =>
      milestonesApi.reject(gigId, milestoneId, { rejectionReason }),
    onSuccess: () => {
      toast.success('Revision request sent to freelancer.');
      setShowRejectModal(false);
      setRevisionReason('');
      qc.invalidateQueries({ queryKey: ['gig-tracker', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to request revision');
    },
  });

  const disputeMutation = useMutation({
    mutationFn: (data: { gigId: string; milestoneId: string; reason: string; evidenceMessage: string; evidenceFile?: string }) =>
      import('../../api/disputes').then(m => m.disputesApi.file(data)),
    onSuccess: () => {
      toast.success('Dispute filed successfully. Support team notified.');
      setShowDisputeModal(false);
      setDisputeReason('');
      setDisputeEvidence('');
      setDisputeFile('');
      qc.invalidateQueries({ queryKey: ['gig-tracker', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to file dispute');
    },
  });

  if (isLoading) return <LoadingSpinner message="Loading tracking details..." />;
  if (!gig) return <div className="page-container text-center">Gig not found.</div>;

  const isClient = user?.role === 'client';
  const isFreelancer = user?.role === 'freelancer';

  // Format milestones
  const milestones = gig.milestones || [];
  const completedCount = milestones.filter((m: any) => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Funds_Escrowed': return 'badge-success';
      case 'Under_Review': return 'badge-warning';
      case 'Completed': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Funds_Escrowed': return 'Funded & Active';
      case 'Under_Review': return 'Under Review';
      case 'Completed': return 'Released / Completed';
      default: return 'Awaiting Funding';
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header card */}
      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <button className="btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            ← Back
          </button>
          <h1 className="section-title" style={{ margin: 0 }}>{gig.title}</h1>
          <p className="section-subtitle" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            Track progress, manage milestones, and release escrow payments.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`badge badge-${gig.status.toLowerCase().replace(' ', '')}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
            {gig.status}
          </span>
          <div style={{ marginTop: '0.75rem', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
            Total Budget: ${gig.budget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress tracking overview */}
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
          <span>Overall Milestones Completed</span>
          <span>{completedCount} of {milestones.length} ({progressPercent}%)</span>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            borderRadius: 5,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Escrow status panel */}
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid #10b981' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛡️ Escrow Payment Protection Active
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
          All payments are held securely in SkillSphere's escrow account. Clients fund each milestone individually to authorize work. Freelancers receive payments automatically once deliverables are reviewed and approved.
        </p>
      </div>

      {/* Milestones list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Milestones</h2>
        {milestones.length === 0 ? (
          <div className="empty-state glass">
            <h3>No Milestones Added</h3>
            <p>Milestones have not been set up for this project.</p>
          </div>
        ) : (
          milestones.map((m: any, index: number) => (
            <div key={m._id || index} className="glass" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {index + 1}. {m.title}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(m.status)}`}>
                      {getStatusText(m.status)}
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                    {m.description || 'No description provided.'}
                  </p>

                  {/* Submission detail */}
                  {m.submission && m.submission.submittedAt && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 8, marginTop: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#cbd5e1' }}>📦 Delivery Submittal</h4>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
                        {m.submission.message}
                      </p>
                      {m.submission.fileUrl && (
                        <a href={m.submission.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
                          📂 View Delivery Artifacts
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    ${m.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem' }}>
                    Milestone Value
                  </div>

                  {/* Action buttons based on Role & Milestone Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
                    {/* Client actions */}
                    {isClient && m.status === 'Pending' && (
                      <button className="btn-primary" onClick={() => fundMutation.mutate({ gigId: gig._id, milestoneId: m._id })}>
                        💳 Fund Escrow
                      </button>
                    )}
                    {isClient && m.status === 'Under_Review' && (
                      <>
                        <button className="btn-primary" onClick={() => approveMutation.mutate({ gigId: gig._id, milestoneId: m._id })}>
                          ✓ Approve & Release
                        </button>
                        <button className="btn-danger" onClick={() => { setActiveMilestoneId(m._id); setShowRejectModal(true); }}>
                          ✗ Request Revisions
                        </button>
                      </>
                    )}

                    {/* Freelancer actions */}
                    {isFreelancer && m.status === 'Funds_Escrowed' && (
                      <button className="btn-primary" onClick={() => { setActiveMilestoneId(m._id); setShowSubmitModal(true); }}>
                        📤 Submit Deliverables
                      </button>
                    )}

                    {/* Dispute Actions */}
                    {(m.status === 'Funds_Escrowed' || m.status === 'Under_Review') && (
                      <button className="btn-secondary" style={{ color: '#f59e0b', borderColor: '#f59e0b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }} onClick={() => { setActiveMilestoneId(m._id); setShowDisputeModal(true); }}>
                        ⚠️ File Dispute
                      </button>
                    )}

                    {/* General indicator */}
                    {m.status === 'Completed' && (
                      <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        ✓ Paid out
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Work Modal */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginTop: 0 }}>Submit Milestone Work</h3>
            <div className="form-group">
              <label className="label">Submission Message / Explanations</label>
              <textarea className="input" rows={4} placeholder="Summarize the work done, design decisions, etc." value={deliveryMessage} onChange={e => setDeliveryMessage(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Delivery File / Shareable Artifact URL</label>
              <input type="text" className="input" placeholder="e.g. GitHub link, Figma preview, zip file link" value={deliveryFile} onChange={e => setDeliveryFile(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowSubmitModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => submitMutation.mutate({ gigId: gig._id, milestoneId: activeMilestoneId!, message: deliveryMessage, fileUrl: deliveryFile })}>
                Submit Deliverable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Revision Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginTop: 0 }}>Request Revisions</h3>
            <div className="form-group">
              <label className="label">Reason / Feedback for Freelancer</label>
              <textarea className="input" rows={4} placeholder="Please detail the modifications needed before payment release." value={revisionReason} onChange={e => setRevisionReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={() => rejectMutation.mutate({ gigId: gig._id, milestoneId: activeMilestoneId!, rejectionReason: revisionReason })}>
                Request Revisions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Dispute Modal */}
      {showDisputeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginTop: 0, color: '#f59e0b' }}>⚠️ Initiate Dispute Resolution</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Filing a dispute blocks escrow payments and raises a support ticket for mediation.
            </p>
            <div className="form-group">
              <label className="label">Reason for Dispute</label>
              <input type="text" className="input" placeholder="e.g. Non-delivery, Quality concerns, Unresponsive" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Detailed Explanation & Evidence</label>
              <textarea className="input" rows={4} placeholder="Provide details of the project dispute, timelines, and communications." value={disputeEvidence} onChange={e => setDisputeEvidence(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Evidence File URL (Optional)</label>
              <input type="text" className="input" placeholder="e.g. Link to screens, chat logs, contract docs" value={disputeFile} onChange={e => setDisputeFile(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowDisputeModal(false)}>Cancel</button>
              <button className="btn-danger" style={{ background: '#f59e0b', color: 'white', borderColor: 'transparent' }} onClick={() => disputeMutation.mutate({ gigId: gig._id, milestoneId: activeMilestoneId!, reason: disputeReason, evidenceMessage: disputeEvidence, evidenceFile: disputeFile })}>
                File Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
