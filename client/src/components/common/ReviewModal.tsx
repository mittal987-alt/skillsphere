import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../../api/reviews';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  gigId: string;
  freelancerId: string;
  freelancerName: string;
  gigTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ gigId, freelancerId, freelancerName, gigTitle, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const qc = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: () => reviewsApi.createReview({ gigId, freelancerId, rating, review: reviewText }),
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      qc.invalidateQueries({ queryKey: ['client-payments'] });
      qc.invalidateQueries({ queryKey: ['freelancer-reviews'] });
      qc.invalidateQueries({ queryKey: ['freelancer-profile'] });
      qc.invalidateQueries({ queryKey: ['freelancer-dashboard'] });
      qc.invalidateQueries({ queryKey: ['gig-reviews'] });
      qc.invalidateQueries({ queryKey: ['gig'] });
      qc.invalidateQueries({ queryKey: ['gigs'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error('Please provide a review (at least 10 characters)');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .star-btn { background: none; border: none; cursor: pointer; padding: 4px; transition: transform 0.1s; }
        .star-btn:hover { transform: scale(1.15); }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 500,
        background: 'linear-gradient(145deg, #111122, #1a1a35)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        animation: 'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
              Leave a Review
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              For <strong>{freelancerName}</strong> on "{gigTitle}"
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitMutation.isPending}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.5rem', padding: 0, lineHeight: 1 }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Star Rating Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
            <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>Rate your experience</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="star-btn"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'} stroke={(hoverRating || rating) >= star ? '#f59e0b' : '#64748b'} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', minHeight: 16 }}>
              {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
            </div>
          </div>

          {/* Comment */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Share your feedback
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="What went well? How was the communication?"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitMutation.isPending || rating === 0 || reviewText.length < 10}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
