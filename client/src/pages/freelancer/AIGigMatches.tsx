import { useQuery } from '@tanstack/react-query';
import { getGigRecommendationsForFreelancer } from '../../api/ai';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AIGigMatches() {
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['ai-gig-recommendations'],
    queryFn: getGigRecommendationsForFreelancer,
    select: (data) => data.recommendations,
  });

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">
          <span
            style={{
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginRight: '0.5rem',
            }}
          >
            AI
          </span>
          Gig Matches
        </h1>
        <p className="section-subtitle">
          Personalized gig opportunities scored by Mistral AI based on your profile, skills, and past ratings.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Scanning open gigs with Mistral AI..." />
      ) : error ? (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          Failed to load AI recommendations. Please check your network or server configuration.
        </div>
      ) : !recommendations || recommendations.length === 0 ? (
        <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
          <h3>No perfect matches found yet</h3>
          <p style={{ color: '#94a3b8', maxWidth: 450, margin: '0.5rem auto 1.5rem' }}>
            Ensure your freelancer profile includes updated skills, hourly rates, and bio to get top AI recommendations.
          </p>
          <Link to="/freelancer/profile" className="btn-primary">
            Update My Profile
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {recommendations.map((rec: any) => {
            const gig = rec.gig;
            const score = Math.round(rec.score);

            const scoreColor =
              score >= 80
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : score >= 60
                ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                : 'linear-gradient(135deg, #f59e0b, #d97706)';

            return (
              <div
                key={gig._id}
                className="glass"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(168, 85, 247, 0.15)',
                  transition: 'transform 0.2s',
                }}
              >
                {/* AI Match Badge */}
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
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  ✨ {score}% Match
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '0.5rem', paddingRight: '4rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#a855f7',
                        background: 'rgba(168, 85, 247, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {gig.category || 'General'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f1f5f9', lineHeight: 1.3 }}>
                    {gig.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      {gig.experienceLevel}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 700 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      ${gig.budget?.toLocaleString()}
                    </span>
                  </div>

                  {/* AI Fit Explanation */}
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
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
                    <div>
                      <strong style={{ color: '#c084fc', display: 'block', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                        Why this fits you
                      </strong>
                      {rec.reason}
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {gig.skills?.slice(0, 4).map((skill: string) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: '0.725rem',
                          padding: '0.25rem 0.6rem',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 6,
                          color: '#94a3b8',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {(gig.skills?.length || 0) > 4 && (
                      <span style={{ fontSize: '0.725rem', padding: '0.25rem 0.5rem', color: '#64748b' }}>
                        +{gig.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <Link to={`/gigs/${gig._id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.65rem' }}>
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
