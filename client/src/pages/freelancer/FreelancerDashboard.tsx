import { Link } from 'react-router-dom';
import { freelancerApi } from '../../api/freelancer';
import { proposalsApi } from '../../api/proposals';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type FreelancerProfile, type Proposal } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: (id: string) => proposalsApi.completeJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freelancer-proposals'] });
    },
  });

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

  const activeProposals = proposals.filter(
    p => p.status === 'Pending' || p.status === 'Accepted'
  ).length;

  const jobsWon = proposals.filter(
    p => p.status === 'Accepted' || p.status === 'Completed'
  ).length;

  if (profileLoading || proposalsLoading) return <LoadingSpinner />;

  return (
    <div className="page-container fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="section-title">
          Welcome back, <span className="gradient-text pulse-glow">{user?.name?.split(' ')[0]}</span> 🚀
        </h1>
        <p className="section-subtitle">Here's what's happening with your freelance business today.</p>
      </div>

      {/* Profile incomplete warning */}
      {!profile && (
        <div className="glass-strong fade-in-up stagger-1" style={{
          padding: '2.5rem', textAlign: 'center', marginBottom: '2.5rem',
          borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.08)',
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
            Complete Your Profile
          </h2>
          <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
            You need to set up your freelancer profile before applying to gigs. A complete profile attracts more clients!
          </p>
          <Link to="/freelancer/profile" className="btn-primary">Set Up Profile Now</Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid fade-in-up stagger-1" style={{ marginBottom: '3rem' }}>
        {[
          { label: 'Active Proposals', value: activeProposals,            color: '#f59e0b', icon: '📝' },
          { label: 'Jobs Won',          value: jobsWon,                    color: '#10b981', icon: '🏆' },
          { label: 'Rating',            value: profile?.averageRating ?? 0, color: '#eab308', icon: '⭐' },
          { label: 'Reviews',           value: profile?.totalReviews ?? 0,  color: '#6366f1', icon: '💬' },
        ].map((stat, i) => (
          <div key={stat.label} className={`stat-card glass-strong stagger-${(i % 4) + 1}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{stat.label}</div>
                <div
                  className="stat-value"
                  style={{
                    marginTop: '0.5rem',
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', opacity: 0.8 }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div style={{ marginBottom: '3rem' }} className="fade-in-up stagger-2">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.25rem'
        }}>
          <Link to="/freelancer/matches" className="action-card" style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.05)' }}>
            <div className="action-card-icon">✨</div>
            <div className="action-card-title gradient-text" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text' }}>AI Gig Matches</div>
            <div className="action-card-desc">Find tailored opportunities</div>
          </Link>
          <Link to="/gigs" className="action-card">
            <div className="action-card-icon">🔍</div>
            <div className="action-card-title">Find Work</div>
            <div className="action-card-desc">Browse latest open gigs</div>
          </Link>
          <Link to="/freelancer/profile" className="action-card">
            <div className="action-card-icon">👤</div>
            <div className="action-card-title">Edit Profile</div>
            <div className="action-card-desc">Update your skills & portfolio</div>
          </Link>
          <Link to="/freelancer/earnings" className="action-card">
            <div className="action-card-icon">💰</div>
            <div className="action-card-title">Earnings</div>
            <div className="action-card-desc">Track your revenue</div>
          </Link>
          <Link to="/freelancer/analytics" className="action-card">
            <div className="action-card-icon">📊</div>
            <div className="action-card-title">Analytics</div>
            <div className="action-card-desc">View profile performance</div>
          </Link>
          <Link to="/chat" className="action-card">
            <div className="action-card-icon">💬</div>
            <div className="action-card-title">Messages</div>
            <div className="action-card-desc">Communicate with clients</div>
          </Link>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className="fade-in-up stagger-3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>Recent Applications</h2>
          <Link to="/freelancer/proposals" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            View All
          </Link>
        </div>

        {proposals.length === 0 ? (
          <div className="glass-strong" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem', opacity: 0.8 }}>📄</div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 600 }}>No applications yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              Your application history will appear here. Start browsing gigs to land your first client!
            </p>
            <Link to="/gigs" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Browse Gigs</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {proposals.slice(0, 5).map((p, index) => {
              const gig = typeof p.gig === 'object' ? p.gig : null;
              return (
                <div key={p._id} className={`application-card stagger-${(index % 4) + 1}`}>
                  {/* Gig info */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.35rem', fontSize: '1.05rem' }}>
                      {gig?.title || 'Unknown Gig'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '1rem' }}>
                      <span>🗓️ Applied {new Date(p.createdAt).toLocaleDateString()}</span>
                      <span>⏱️ {p.deliveryTime} days delivery</span>
                    </div>
                  </div>

                  {/* Status & actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.15rem' }}>Bid Amount</span>
                      <div style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>
                        ₹{p.bidAmount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '30px', background: 'var(--color-border)' }}></div>

                    <span className={`badge badge-${p.status.toLowerCase()}`} style={{ padding: '0.35rem 1rem', fontSize: '0.85rem' }}>
                      {p.status}
                    </span>

                    {p.status === 'Accepted' && (
                      <button
                        className="btn-primary pulse-glow"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                        onClick={() => completeMutation.mutate(p._id)}
                        disabled={completeMutation.isPending}
                      >
                        {completeMutation.isPending ? 'Submitting…' : 'Mark Complete'}
                      </button>
                    )}

                    {p.status === 'Completed' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem', background: 'rgba(245,158,11,0.1)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <span>⏳</span> Awaiting Approval
                      </div>
                    )}
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
