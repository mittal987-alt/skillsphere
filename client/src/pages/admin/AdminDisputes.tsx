import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputesApi } from '../../api/disputes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../layouts/AdminLayout';
import { toast } from 'react-toastify';

export default function AdminDisputes() {
  const qc = useQueryClient();
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'Refunded' | 'Released'>('Refunded');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => disputesApi.getAll(),
    select: r => r.data,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ disputeId, decision, notes }: { disputeId: string; decision: 'Refunded' | 'Released'; notes: string }) =>
      disputesApi.resolve(disputeId, { decision, notes }),
    onSuccess: () => {
      toast.success('Dispute resolved successfully!');
      setShowResolveModal(false);
      setSelectedDispute(null);
      setAdminNotes('');
      qc.invalidateQueries({ queryKey: ['admin-disputes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to resolve dispute');
    },
  });

  const disputes = data?.disputes || [];

  return (
    <AdminLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Mediation & Dispute Resolution</h1>
        <p className="section-subtitle">Review contested contracts and arbitrate escrow releases.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Fetching dispute tickets..." />
      ) : disputes.length === 0 ? (
        <div className="empty-state glass">
          <h3>No Disputes Active</h3>
          <p>Everything is running smoothly! No contract disputes are currently open.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedDispute ? '1fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* List panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {disputes.map((d: any) => (
              <div
                key={d._id}
                className="glass"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  border: selectedDispute?._id === d._id ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.05)',
                  background: selectedDispute?._id === d._id ? 'rgba(99,102,241,0.05)' : 'var(--color-surface)',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedDispute(d)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.gig?.title || 'Contested Gig'}</span>
                  <span className={`badge badge-${d.status === 'Pending' ? 'warning' : 'success'}`}>
                    {d.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                  <strong>Reason:</strong> {d.reason}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                  <span>Client: {d.client?.user?.name}</span>
                  <span>Freelancer: {d.freelancer?.user?.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Details panel */}
          {selectedDispute && (
            <div className="glass" style={{ padding: '1.5rem', position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Mediation Case Details</h3>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedDispute(null)}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Close panel
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>Project Title:</span>
                  <div style={{ fontWeight: 700, color: '#e2e8f0', marginTop: '0.25rem' }}>{selectedDispute.gig?.title}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Client Profile:</span>
                    <div>{selectedDispute.client?.user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>{selectedDispute.client?.user?.email}</div>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Freelancer Profile:</span>
                    <div>{selectedDispute.freelancer?.user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>{selectedDispute.freelancer?.user?.email}</div>
                  </div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>Dispute Category:</span>
                  <div>{selectedDispute.reason}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>Case History & Evidence:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {selectedDispute.evidence?.map((ev: any, index: number) => (
                      <div key={index} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                          <span>Submitted by ID: {ev.submittedBy}</span>
                          <span>{new Date(ev.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ color: '#cbd5e1' }}>{ev.message}</div>
                        {ev.fileUrl && (
                          <a href={ev.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', color: '#6366f1', textDecoration: 'none' }}>
                            📂 View Attachment link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDispute.status === 'Pending' ? (
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-danger"
                      style={{ flex: 1 }}
                      onClick={() => {
                        setDecisionType('Refunded');
                        setShowResolveModal(true);
                      }}
                    >
                      💳 Refund Client
                    </button>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)' }}
                      onClick={() => {
                        setDecisionType('Released');
                        setShowResolveModal(true);
                      }}
                    >
                      ✓ Release to Freelancer
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#10b981' }}>Case Resolved</h4>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <strong>Ruling:</strong> Escrow budget was {selectedDispute.ruling?.decision === 'Refunded' ? 'Refunded to Client' : 'Released to Freelancer'}.
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      <strong>Mediation Notes:</strong> {selectedDispute.ruling?.notes || 'No notes added.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resolution Confirmation Modal */}
      {showResolveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginTop: 0 }}>Arbitrate Case Resolution</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Confirm ruling: <strong>{decisionType === 'Refunded' ? 'Refund Client (Reverse Escrow)' : 'Release Funds to Freelancer'}</strong>.
            </p>
            <div className="form-group">
              <label className="label">Mediation Notes / Verdict Justification</label>
              <textarea
                className="input"
                rows={4}
                placeholder="State the reasons for this decision. Both parties will be notified of this text."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowResolveModal(false)}>Cancel</button>
              <button
                className={decisionType === 'Refunded' ? 'btn-danger' : 'btn-primary'}
                style={decisionType === 'Released' ? { background: '#10b981', borderColor: 'transparent' } : {}}
                onClick={() => resolveMutation.mutate({ disputeId: selectedDispute._id, decision: decisionType, notes: adminNotes })}
              >
                Apply Ruling
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
