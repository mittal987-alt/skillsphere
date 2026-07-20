import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationApi } from '../../api/verification';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../layouts/AdminLayout';
import { toast } from 'react-toastify';

export default function AdminVerification() {
  const qc = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: () => verificationApi.getAllRequests(),
    select: r => r.data,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ requestId, status, reason }: { requestId: string; status: 'Approved' | 'Rejected'; reason?: string }) =>
      verificationApi.reviewRequest(requestId, { status, rejectionReason: reason }),
    onSuccess: (_, variables) => {
      toast.success(`Verification request ${variables.status.toLowerCase()} successfully!`);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      qc.invalidateQueries({ queryKey: ['admin-verifications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to review request');
    },
  });

  const requests = data?.requests || [];

  return (
    <AdminLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Identity & Credential Verification</h1>
        <p className="section-subtitle">Verify freelancer resumes, portfolio links, and official ID documents.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading verification tickets..." />
      ) : requests.length === 0 ? (
        <div className="empty-state glass">
          <h3>No Verification Tickets</h3>
          <p>All freelancer verification requests have been resolved.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedRequest ? '1fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* List panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map((r: any) => (
              <div
                key={r._id}
                className="glass"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  border: selectedRequest?._id === r._id ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.05)',
                  background: selectedRequest?._id === r._id ? 'rgba(99,102,241,0.05)' : 'var(--color-surface)',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedRequest(r)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.freelancer?.user?.name || 'Freelancer'}</span>
                  <span className={`badge badge-${r.status === 'Pending' ? 'warning' : r.status === 'Approved' ? 'success' : 'danger'}`}>
                    {r.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                  <strong>ID Number:</strong> {r.idCardNumber}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  Submitted on {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Details panel */}
          {selectedRequest && (
            <div className="glass" style={{ padding: '1.5rem', position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Review Verification Request</h3>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Close panel
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>Freelancer Name:</span>
                  <div style={{ fontWeight: 700, color: '#e2e8f0', marginTop: '0.25rem' }}>{selectedRequest.freelancer?.user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>{selectedRequest.freelancer?.user?.email}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>Govt ID Card Number:</span>
                  <div style={{ color: '#e2e8f0', marginTop: '0.25rem' }}>{selectedRequest.idCardNumber}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Documents Submitted:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <a href={selectedRequest.idCardUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
                      🪪 View ID Document Scan Link
                    </a>
                    <a href={selectedRequest.resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
                      📄 View Resume / CV Link
                    </a>
                    <a href={selectedRequest.portfolioUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
                      🌐 View Portfolio Site Link
                    </a>
                  </div>
                </div>

                {selectedRequest.status === 'Pending' ? (
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-danger"
                      style={{ flex: 1 }}
                      onClick={() => setShowRejectModal(true)}
                    >
                      ✗ Reject Request
                    </button>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)' }}
                      onClick={() => reviewMutation.mutate({ requestId: selectedRequest._id, status: 'Approved' })}
                    >
                      ✓ Approve Verification
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: selectedRequest.status === 'Approved' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 8, border: selectedRequest.status === 'Approved' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: selectedRequest.status === 'Approved' ? '#10b981' : '#ef4444' }}>
                      Request {selectedRequest.status}
                    </h4>
                    {selectedRequest.status === 'Rejected' && (
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        <strong>Rejection Reason:</strong> {selectedRequest.rejectionReason || 'No details provided.'}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Reviewed on {new Date(selectedRequest.reviewedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rejection Justification Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginTop: 0 }}>Provide Rejection Details</h3>
            <div className="form-group">
              <label className="label">Rejection Reason</label>
              <textarea
                className="input"
                rows={4}
                placeholder="State the reasons for rejecting this request (e.g. invalid document links, blur scan, fake ID number, etc.)"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button
                className="btn-danger"
                onClick={() => reviewMutation.mutate({ requestId: selectedRequest._id, status: 'Rejected', reason: rejectionReason })}
              >
                Reject Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
