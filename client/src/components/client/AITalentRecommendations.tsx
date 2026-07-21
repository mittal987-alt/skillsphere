import { useQuery } from '@tanstack/react-query';
import { getFreelancerRecommendationsForGig } from '../../api/ai';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import StarRating from '../common/StarRating';

export default function AITalentRecommendations({ gigId }: { gigId: string }) {
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['ai-freelancer-recommendations', gigId],
    queryFn: () => getFreelancerRecommendationsForGig(gigId),
    select: (data) => data.recommendations,
  });

  if (isLoading) return <LoadingSpinner message="Analysing candidate profiles with Mistral AI..." />;

  if (error) {
    return (
      <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        Failed to load AI talent recommendations. Please ensure Mistral AI is configured properly.
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="empty-state glass">
        <h3>No AI Matches Found</h3>
        <p>We couldn't find active freelancers that match this gig's required skills right now.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
      {recommendations.map((rec: any) => {
        const freelancer = rec.freelancer;
        const user = freelancer.user;
        const name = user?.name || 'Talented Freelancer';
        const score = Math.round(rec.score);

        const scoreColor =
          score >= 80
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : score >= 60
            ? 'linear-gradient(135deg, #a855f7, #6366f1)'
            : 'linear-gradient(135deg, #f59e0b, #d97706)';

        return (
          <div
            key={freelancer._id}
            className="glass"
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              padding: '1.5rem',
              border: '1px solid rgba(168, 85, 247, 0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            {/* AI Score Badge */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: scoreColor,
                color: 'white',
                padding: '0.3rem 0.85rem',
                borderBottomLeftRadius: 12,
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.03em',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              ✨ {score}% Match
            </div>

            {/* Top Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}
              >
                {name[0]?.toUpperCase() || 'F'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {name} {freelancer.verified && <span style={{ color: '#10b981' }} title="Verified Freelancer">✓</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
                  {freelancer.title || 'Freelancer'}
                </div>
              </div>
            </div>

            {/* AI Match Rationale */}
            <div
              style={{
                background: 'rgba(168, 85, 247, 0.07)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: 10,
                padding: '0.85rem',
                fontSize: '0.825rem',
                color: '#cbd5e1',
                marginBottom: '1.25rem',
                lineHeight: 1.5,
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🤖</span>
              <div>
                <strong style={{ color: '#c084fc', display: 'block', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                  AI Fit Analysis
                </strong>
                {rec.reason}
              </div>
            </div>

            {/* Rating & Rates */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <StarRating rating={freelancer.averageRating || 0} size={14} />
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({freelancer.totalReviews || 0} reviews)</span>
              </div>
              <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>
                ${freelancer.hourlyRate || 0}/hr
              </div>
            </div>

            {/* Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {freelancer.skills?.slice(0, 4).map((skill: string) => (
                <span
                  key={skill}
                  style={{
                    fontSize: '0.725rem',
                    padding: '0.25rem 0.6rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: 6,
                    color: '#a5b4fc',
                  }}
                >
                  {skill}
                </span>
              ))}
              {(freelancer.skills?.length || 0) > 4 && (
                <span style={{ fontSize: '0.725rem', padding: '0.25rem 0.5rem', color: '#64748b' }}>
                  +{freelancer.skills.length - 4} more
                </span>
              )}
            </div>

            {/* View Profile Action */}
            <div style={{ marginTop: 'auto' }}>
              <Link
                to={`/freelancer/${freelancer.user?._id || freelancer._id}`}
                className="btn-secondary"
                style={{ display: 'block', textAlign: 'center', width: '100%', fontSize: '0.875rem', padding: '0.6rem' }}
              >
                View Full Profile
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
