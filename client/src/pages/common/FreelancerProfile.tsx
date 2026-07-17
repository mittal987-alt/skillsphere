import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { freelancerApi } from '../../api/freelancer';
import { reviewsApi } from '../../api/reviews';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';
import { type FreelancerProfile as IFreelancerProfile, type Review } from '../../types';

export default function FreelancerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['freelancer', id],
    queryFn: () => freelancerApi.getById(id!),
    select: r => r.data.data as IFreelancerProfile,
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['freelancer-reviews', id],
    queryFn: () => reviewsApi.getFreelancerReviews(id!),
    select: r => r.data.reviews as Review[],
    enabled: !!id,
  });

  if (profileLoading) return <LoadingSpinner />;
  if (!profileData) return <div className="page-container"><div className="empty-state"><h3>Profile not found</h3></div></div>;

  const user = typeof profileData.user === 'object' ? profileData.user : null;
  const reviews = reviewsData || [];

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.875rem', padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>

      <div className="glass" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 800, color: 'white', flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase() || 'F'}
          </div>
          
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', margin: '0 0 0.25rem' }}>{user?.name}</h1>
            <h2 style={{ fontSize: '1.1rem', color: '#a78bfa', fontWeight: 600, margin: '0 0 1rem' }}>{profileData.title}</h2>
            
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>${profileData.hourlyRate}</span>
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>/ hr</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StarRating rating={profileData.averageRating} />
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>({profileData.totalReviews} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge badge-${profileData.availability.toLowerCase()}`}>{profileData.availability}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#475569' }}>
              {profileData.experience} years experience
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>About Me</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
            {profileData.bio || 'No bio provided.'}
          </p>
        </div>

        {profileData.skills?.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profileData.skills.map(s => (
                <span key={s} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, fontSize: '0.85rem', color: '#e2e8f0' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {profileData.languages?.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>Languages</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profileData.languages.map(l => (
                <span key={l} style={{ padding: '6px 16px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 999, fontSize: '0.85rem', color: '#a5b4fc' }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {profileData.portfolio && profileData.portfolio.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Portfolio</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {profileData.portfolio.map((item, i) => (
              <div key={i} className="glass" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>{item.title}</h4>
                {item.description && <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>{item.description}</p>}
                {item.projectUrl && (
                  <a href={item.projectUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                    View Project →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>
            No reviews yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(r => (
              <div key={r._id} className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <StarRating rating={r.rating} />
                  <span style={{ fontSize: '0.8rem', color: '#475569' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>"{r.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
