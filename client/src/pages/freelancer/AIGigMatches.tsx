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
          <span style={{ 
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginRight: '0.5rem'
          }}>AI</span> 
          Gig Matches
        </h1>
        <p className="section-subtitle">Gigs tailored specifically for your skills and experience using Mistral AI.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          Failed to load recommendations.
        </div>
      ) : !recommendations || recommendations.length === 0 ? (
        <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <h3>No perfect matches found yet.</h3>
          <p style={{ color: '#94a3b8' }}>Update your skills and profile to get better AI recommendations.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {recommendations.map((rec: any) => (
            <div key={rec.gig._id} className="glass" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', top: 0, right: 0, 
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                color: 'white', padding: '0.25rem 0.75rem', 
                borderBottomLeftRadius: 12, fontSize: '0.75rem', fontWeight: 800 
              }}>
                {Math.round(rec.score)}% Match
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', paddingRight: '3rem' }}>{rec.gig.title}</h3>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    {rec.gig.experienceLevel}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 700 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    {rec.gig.budget}
                  </span>
                </div>

                <div style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: 8, padding: '0.75rem',
                  fontSize: '0.85rem', color: '#cbd5e1',
                  marginBottom: '1rem', fontStyle: 'italic',
                  display: 'flex', gap: '0.5rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>"{rec.reason}"</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {rec.gig.skills.slice(0, 4).map((skill: string) => (
                    <span key={skill} style={{ 
                      fontSize: '0.75rem', padding: '0.25rem 0.5rem', 
                      background: 'rgba(255,255,255,0.05)', borderRadius: 4, color: '#94a3b8' 
                    }}>
                      {skill}
                    </span>
                  ))}
                  {rec.gig.skills.length > 4 && (
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#64748b' }}>
                      +{rec.gig.skills.length - 4} more
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <Link to={`/gigs/${rec.gig._id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                    View Gig Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
