import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { freelancerApi } from '../../api/freelancer';
import { proposalsApi } from '../../api/proposals';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type FreelancerProfile,type  Proposal } from '../../types';

export default function FreelancerDashboard() {
  const { user } = useAuth();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['freelancer-profile'],
    queryFn: () => freelancerApi.getMyProfile(),
    select: r => r.data.profile as FreelancerProfile,
  });

  const { data: proposalsData, isLoading: proposalsLoading } = useQuery({
    queryKey: ['freelancer-proposals'],
    queryFn: () => proposalsApi.getMyProposals(),
    select: r => r.data.proposals as Proposal[],
  });

  const profile = profileData;
  const proposals = proposalsData || [];
  const activeProposals = proposals.filter(p => p.status === 'Pending').length;
  const acceptedProposals = proposals.filter(p => p.status === 'Accepted').length;

  if (profileLoading || proposalsLoading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Welcome, {user?.name?.split(' ')[0]} 🚀</h1>
        <p className="section-subtitle">Manage your profile, proposals, and earnings</p>
      </div>

      {!profile ? (
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#f59e0b', marginBottom: '0.75rem' }}>Complete Your Profile</h2>
          <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>You need to set up your freelancer profile before applying to gigs.</p>
          <Link to="/freelancer/profile" className="btn-primary">Create Profile</Link>
        </div>
      ) : null}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Profile Views', value: '0', color: '#6366f1', icon: '👁️' },
          { label: 'Active Proposals', value: activeProposals, color: '#f59e0b', icon: '📝' },
          { label: 'Jobs Won', value: acceptedProposals, color: '#10b981', icon: '🏆' },
          { label: 'Rating', value: profile?.averageRating || 0, color: '#eab308', icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div className="stat-value" style={{ fontSize: '1.75rem', background: `linear-gradient(135deg,${stat.color},${stat.color}99)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <Link to="/gigs" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          Find Work
        </Link>
        <Link to="/freelancer/profile" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
          Edit Profile
        </Link>
        <Link to="/chat" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
          Messages
        </Link>
      </div>

      {/* Recent proposals */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e2e8f0' }}>Recent Applications</h2>
          <Link to="/freelancer/proposals" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.875rem' }}>View All</Link>
        </div>
        
        {proposals.length === 0 ? (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>No proposals yet</h3>
            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>Start applying to gigs to see them here.</p>
            <Link to="/gigs" className="btn-primary">Browse Gigs</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {proposals.slice(0, 5).map(p => {
              const gig = typeof p.gig === 'object' ? p.gig : null;
              return (
                <div key={p._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, gap: '1rem', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 4, fontSize: '0.95rem' }}>{gig?.title || 'Unknown Gig'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>Applied on {new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>${p.bidAmount}</div>
                    <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
