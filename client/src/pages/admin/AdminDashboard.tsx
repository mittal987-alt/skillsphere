import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AdminDashboard as AdminStats } from '../../types';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
    select: r => r.data.dashboard as AdminStats,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return <div className="page-container"><div className="empty-state">Failed to load dashboard</div></div>;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Platform overview and statistics</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#6366f1', WebkitTextFillColor: 'initial', background: 'none' }}>
            {stats.users}
          </div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#10b981', WebkitTextFillColor: 'initial', background: 'none' }}>
            ${stats.revenue.toLocaleString()}
          </div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#f59e0b', WebkitTextFillColor: 'initial', background: 'none' }}>
            {stats.gigs}
          </div>
          <div className="stat-label">Total Gigs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#a78bfa', WebkitTextFillColor: 'initial', background: 'none' }}>
            {stats.payments}
          </div>
          <div className="stat-label">Total Payments</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a href="/admin/users" className="btn-secondary">Manage Users</a>
        <a href="/admin/gigs" className="btn-secondary">Manage Gigs</a>
      </div>
    </div>
  );
}
