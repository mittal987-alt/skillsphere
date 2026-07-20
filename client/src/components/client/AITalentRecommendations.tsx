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

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        Failed to load AI recommendations.
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="empty-state glass">
        <h3>No AI Matches Found</h3>
        <p>We couldn't find freelancers that perfectly match this gig's skills right now.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
      {recommendations.map((rec: any) => {
        const freelancer = rec.freelancer;
        const user = freelancer.user;
        const name = user?.name || 'Unknown Talent';

        return (
          <div key={freelancer._id} className="glass" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', padding: '1.5rem' }}>
            {/* AI Score Badge */}
            <div style={{ 
              position: 'absolute', top: 0, right: 0, 
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              color: 'white', padding: '0.25rem 0.75rem', 
              borderBottomLeftRadius: 12, fontSize: '0.75rem', fontWeight: 800 
            }}>
              {Math.round(rec.score)}% Match
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'white', fontSize: '1.2rem', flexShrink: 0,
              }}>
                {name[0]?.toUpperCase() || 'F'}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{freelancer.title || 'Freelancer'}</div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div style={{
              background: 'rgba(168, 85, 247, 0.05)',
              border: '1px solid rgba(168, 85, 247, 0.15)',
              borderRadius: 8, padding: '0.75rem',
              fontSize: '0.8rem', color: '#cbd5e1',
              marginBottom: '1rem', fontStyle: 'italic',
              display: 'flex', gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1rem' }}>✨</span>
              <span>{rec.reason}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <StarRating rating={freelancer.averageRating || 0} size={14} />
                <span style={{ color: '#94a3b8' }}>({freelancer.totalReviews || 0})</span>
              </div>
              <div style={{ fontWeight: 600, color: '#10b981' }}>
                ₹{freelancer.hourlyRate}/hr
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {freelancer.skills.slice(0, 3).map((skill: string) => (
                <span key={skill} style={{ 
                  fontSize: '0.7rem', padding: '0.2rem 0.5rem', 
                  background: 'rgba(255,255,255,0.05)', borderRadius: 4, color: '#94a3b8' 
                }}>
                  {skill}
                </span>
              ))}
              {freelancer.skills.length > 3 && (
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: '#64748b' }}>
                  +{freelancer.skills.length - 3}
                </span>
              )}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
              <Link to={`/freelancer/${freelancer.user?._id}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', padding: '0.5rem' }}>
                View Profile
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
