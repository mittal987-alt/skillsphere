import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../layouts/AdminLayout';
import { type AdminDashboard as AdminStats } from '../../types';

const StatCard = ({
  label,
  value,
  color,
  icon,
  link,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
  link?: string;
}) => (
  <div style={{
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: link ? 'pointer' : 'default',
  }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '2.25rem', fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </div>
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        {icon}
      </div>
    </div>
    {link && (
      <Link to={link} style={{ fontSize: '0.78rem', color, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        View all →
      </Link>
    )}
  </div>
);

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
    select: r => r.data.dashboard as AdminStats,
  });

  return (
    <AdminLayout>
      <div style={{ padding: '2rem 2.5rem', maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 999, padding: '0.25rem 0.75rem', marginBottom: '0.75rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444' }}>Admin Access</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Platform Overview
          </h1>
          <p style={{ color: 'var(--color-text-faint)', fontSize: '0.95rem' }}>
            Real-time statistics and controls for SkillSphere
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : !stats ? (
          <div className="empty-state">Failed to load dashboard</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <StatCard
                label="Total Users"
                value={stats.users}
                color="#6366f1"
                link="/admin/users"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              />
              <StatCard
                label="Clients"
                value={stats.clients}
                color="#3b82f6"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
              />
              <StatCard
                label="Freelancers"
                value={stats.freelancers}
                color="#8b5cf6"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="2"/></svg>}
              />
              <StatCard
                label="Total Gigs"
                value={stats.gigs}
                color="#f59e0b"
                link="/admin/gigs"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              />
              <StatCard
                label="Payments"
                value={stats.payments}
                color="#10b981"
                link="/admin/payments"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
              />
              <StatCard
                label="Reviews"
                value={stats.reviews}
                color="#f43f5e"
                link="/admin/reviews"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
              />
              <StatCard
                label="Total Revenue"
                value={`$${(stats.revenue ?? 0).toLocaleString()}`}
                color="#10b981"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              />
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: '1.5rem',
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1.25rem' }}>
                Quick Actions
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {[
                  { label: '👥 Manage Users', to: '/admin/users', color: '#6366f1' },
                  { label: '📄 Manage Gigs', to: '/admin/gigs', color: '#f59e0b' },
                  { label: '💳 View Payments', to: '/admin/payments', color: '#10b981' },
                  { label: '⭐ Moderate Reviews', to: '/admin/reviews', color: '#f43f5e' },
                  { label: '⚠️ Mediate Disputes', to: '/admin/disputes', color: '#f59e0b' },
                  { label: '🪪 Verify Freelancers', to: '/admin/verification', color: '#10b981' },
                  { label: '📊 Analytics', to: '/admin/analytics', color: '#8b5cf6' },
                ].map(action => (
                  <Link
                    key={action.to}
                    to={action.to}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: 8,
                      background: `${action.color}15`,
                      border: `1px solid ${action.color}30`,
                      color: action.color,
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${action.color}28`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${action.color}15`; }}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
