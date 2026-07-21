import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../layouts/AdminLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const getMonthName = (monthNum: number) => {
  const date = new Date();
  date.setMonth(monthNum - 1);
  return date.toLocaleString('default', { month: 'short' });
};

export default function PaymentsAnalytics() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['analytics-revenue'], queryFn: analyticsApi.getMonthlyRevenue });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="page-container"><div className="empty-state">Failed to load payments analytics</div></div>;

  const rawRevenue = data?.data?.revenue || [];
  const revenueData = rawRevenue.map((item: any) => ({
    name: `${getMonthName(item._id.month)} ${item._id.year}`,
    Revenue: item.revenue,
  }));

  return (
    <AdminLayout>
      <div style={{ padding: '2rem 2.5rem', maxWidth: 1100 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Payments Analytics</h1>
        <p style={{ color: 'var(--color-text-faint)', marginTop: 6 }}>Monthly revenue trends and transaction insights</p>

        <div className="glass p-6 mt-6" style={{ minHeight: 320 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>Monthly Revenue</h3>
          <div style={{ height: 260 }}>
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
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
