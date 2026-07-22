import { useQueries } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageLayout from '../../layouts/PageLayout';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// Helper to format month names from numbers
const getMonthName = (monthNum: number) => {
  const date = new Date();
  date.setMonth(monthNum - 1);
  return date.toLocaleString('default', { month: 'short' });
};

export default function AnalyticsDashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['analytics-dashboard'], queryFn: analyticsApi.getDashboard },
      { queryKey: ['analytics-skills'], queryFn: analyticsApi.getTopSkills },
      { queryKey: ['analytics-platform'], queryFn: analyticsApi.getPlatformStats },
      { queryKey: ['analytics-freelancers'], queryFn: analyticsApi.getTopFreelancers },
      { queryKey: ['analytics-revenue'], queryFn: analyticsApi.getMonthlyRevenue },
      { queryKey: ['analytics-users'], queryFn: analyticsApi.getMonthlyUsers }
    ]
  });

  const isLoading = results.some(r => r.isLoading);
  const isError = results.some(r => r.isError);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="page-container"><div className="empty-state">Failed to load analytics</div></div>;

  const dashboardData = results[0].data?.data?.dashboard || {};
  const topSkills = results[1].data?.data?.skills || [];
  const platformStats = results[2].data?.data?.statistics || {};
  const topFreelancers = results[3].data?.data?.freelancers || [];
  
  const rawRevenue = results[4].data?.data?.revenue || [];
  const rawUsers = results[5].data?.data?.users || [];

  // Format chart data
  const revenueData = rawRevenue.map((item: any) => ({
    name: `${getMonthName(item._id.month)} ${item._id.year}`,
    Revenue: item.revenue,
  }));

  const usersData = rawUsers.map((item: any) => ({
    name: `${getMonthName(item._id.month)} ${item._id.year}`,
    Users: item.count,
  }));

  return (
    <PageLayout 
      title="Platform Analytics" 
      subtitle="Deep dive into SkillSphere's performance and usage metrics"
    >
      {/* High Level Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#10b981', WebkitTextFillColor: 'initial', background: 'none' }}>
            ${dashboardData.revenue?.toLocaleString() || 0}
          </div>
          <div className="stat-label">Total Revenue Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#6366f1', WebkitTextFillColor: 'initial', background: 'none' }}>
            {dashboardData.users || 0}
          </div>
          <div className="stat-label">Total Registered Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#f59e0b', WebkitTextFillColor: 'initial', background: 'none' }}>
            {dashboardData.gigs || 0}
          </div>
          <div className="stat-label">Total Gigs Posted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '2.5rem', color: '#a78bfa', WebkitTextFillColor: 'initial', background: 'none' }}>
            {dashboardData.averageRating || 0} / 5
          </div>
          <div className="stat-label">Average Platform Rating</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Revenue Chart */}
        <div className="glass p-6 min-h-[350px]">
          <h3 className="text-xl font-bold mb-6 text-gray-100">Monthly Revenue</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="glass p-6 min-h-[350px]">
          <h3 className="text-xl font-bold mb-6 text-gray-100">New User Registrations</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="Users" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Platform Status */}
        <div className="glass p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-100">Gig Status Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'Open Gigs', value: platformStats.openGigs || 0, color: '#10b981' },
              { label: 'In Progress', value: platformStats.inProgress || 0, color: '#f59e0b' },
              { label: 'Completed', value: platformStats.completed || 0, color: '#6366f1' },
              { label: 'Cancelled', value: platformStats.cancelled || 0, color: '#ef4444' }
            ].map(stat => (
              <div key={stat.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-300">{stat.label}</span>
                  <span className="text-sm font-bold text-gray-100">{stat.value}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${dashboardData.gigs ? (stat.value / dashboardData.gigs) * 100 : 0}%`,
                      backgroundColor: stat.color
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills */}
        <div className="glass p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-100">Most Demanded Skills</h3>
          <div className="flex flex-wrap gap-3">
            {topSkills.map((skillItem: any) => (
              <div 
                key={skillItem._id} 
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2"
              >
                <span className="text-sm font-semibold text-gray-200">{skillItem._id}</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                  {skillItem.count}
                </span>
              </div>
            ))}
            {topSkills.length === 0 && <span className="text-gray-400 text-sm">No skills data available yet.</span>}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-6 text-gray-100">Top Rated Freelancers</h3>
        <div className="overflow-x-auto glass rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-sm font-semibold text-gray-300">Name</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Rating</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Reviews</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Experience</th>
              </tr>
            </thead>
            <tbody>
              {topFreelancers.map((freelancer: any) => (
                <tr key={freelancer._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-200 font-medium">{freelancer.user?.name || 'Unknown'}</td>
                  <td className="p-4 text-gray-400 text-sm">{freelancer.user?.email || 'N/A'}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-yellow-400 font-bold">
                      ★ {freelancer.averageRating?.toFixed(1) || '0.0'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300 text-sm">{freelancer.totalReviews || 0}</td>
                  <td className="p-4 text-gray-300 text-sm">{freelancer.experience || 0} years</td>
                </tr>
              ))}
              {topFreelancers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No freelancers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </PageLayout>
  );
}
