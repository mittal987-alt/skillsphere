import { useQuery } from '@tanstack/react-query';
import { freelancerApi } from '../../api/freelancer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Link } from 'react-router-dom';

export default function FreelancerAnalytics() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['freelancer-analytics'],
    queryFn: () => freelancerApi.getAnalyticsDashboard(),
    select: (r) => r.data.data,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) return <div className="page-container"><div className="empty-state">Failed to load analytics</div></div>;

  const { overview, monthlyRevenue, feedback } = data;

  // Prepare feedback distribution for bar chart
  const feedbackData = Object.entries(feedback.distribution)
    .map(([rating, count]) => ({
      rating: `${rating} Star`,
      count,
    }))
    .reverse();

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>My Analytics</h1>
          <p className="section-subtitle">Track your performance, earnings, and profile reach</p>
        </div>
        <Link to="/freelancer/dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      {/* Overview Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-label">Total Earnings</div>
          <div className="stat-value" style={{ color: '#10b981', fontSize: '2.25rem' }}>
            ${overview.totalEarnings.toLocaleString()}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Profile Views</div>
          <div className="stat-value" style={{ color: '#8b5cf6', fontSize: '2.25rem' }}>
            {overview.profileViews}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Application Success Rate</div>
          <div className="stat-value" style={{ color: '#f59e0b', fontSize: '2.25rem' }}>
            {overview.totalApplications > 0 
              ? Math.round((overview.activeApplications / overview.totalApplications) * 100) 
              : 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.25rem' }}>
            {overview.activeApplications} won / {overview.totalApplications} applied
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Rating</div>
          <div className="stat-value flex items-center gap-2" style={{ color: '#eab308', fontSize: '2.25rem' }}>
            {overview.averageRating.toFixed(1)} <span style={{ fontSize: '1.5rem' }}>⭐</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.25rem' }}>
            Based on {overview.totalReviews} reviews
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Revenue Area Chart */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 16 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
            Monthly Revenue (Last 6 Months)
          </h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Bar Chart */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 16 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
            Client Feedback Distribution
          </h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedbackData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="rating" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" fill="#eab308" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Feedback Table */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Recent Client Feedback
          </h3>
        </div>
        
        {feedback.recentReviews.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-faint)' }}>
            No reviews yet. Keep applying and completing gigs!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>Client</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>Rating</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>Comment</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedback.recentReviews.map((review: any) => (
                  <tr key={review._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1rem', color: '#e2e8f0' }}>{review.client?.user?.companyName || 'Client'}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', color: '#eab308' }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8', maxWidth: '300px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {review.review}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
