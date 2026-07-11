import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { gigsApi } from '../../api/gigs';
import { proposalsApi } from '../../api/proposals';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Gig, Proposal } from '../../types';

export default function ClientDashboard() {
  const { user } = useAuth();

  const { data: gigsData, isLoading: gigsLoading } = useQuery({
    queryKey: ['client-gigs'],
    queryFn: () => gigsApi.getMyGigs(),
    select: r => r.data.gigs as Gig[],
  });

  const gigs = gigsData || [];
  const openGigs = gigs.filter(g => g.status === 'Open').length;
  const inProgressGigs = gigs.filter(g => g.status === 'In Progress').length;
  const completedGigs = gigs.filter(g => g.status === 'Completed').length;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="section-subtitle">Here's an overview of your projects</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Gigs', value: gigs.length, color: '#6366f1', icon: '📋' },
          { label: 'Open', value: openGigs, color: '#10b981', icon: '🟢' },
          { label: 'In Progress', value: inProgressGigs, color: '#f59e0b', icon: '⚡' },
          { label: 'Completed', value: completedGigs, color: '#8b5cf6', icon: '✅' },
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
        <Link to="/client/gigs/new" id="post-gig-btn" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          + Post New Gig
        </Link>
        <Link to="/client/gigs" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
          Manage Gigs
        </Link>
        <Link to="/chat" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
          Messages
        </Link>
      </div>

      {/* Recent gigs */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Your Recent Gigs</h2>
        {gigsLoading ? (
          <LoadingSpinner />
        ) : gigs.length === 0 ? (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>No gigs yet</h3>
            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>Post your first gig to find talented freelancers</p>
            <Link to="/client/gigs/new" className="btn-primary">Post a Gig</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {gigs.slice(0, 5).map(gig => (
              <div key={gig._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, gap: '1rem', flexWrap: 'wrap',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 4, fontSize: '0.95rem' }}>{gig.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>{new Date(gig.createdAt).toLocaleDateString()} · ${gig.budget}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge badge-${gig.status.toLowerCase().replace(' ', '')}`}>{gig.status}</span>
                  <Link to={`/client/gigs/${gig._id}/proposals`} style={{ fontSize: '0.8rem', color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
                    Proposals →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
