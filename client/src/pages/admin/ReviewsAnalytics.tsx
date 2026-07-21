import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../layouts/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const getMonthName = (monthNum: number) => {
  const date = new Date();
  date.setMonth(monthNum - 1);
  return date.toLocaleString('default', { month: 'short' });
};

export default function ReviewsAnalytics() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['analytics-reviews'], queryFn: analyticsApi.getMonthlyReviews });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="page-container"><div className="empty-state">Failed to load reviews analytics</div></div>;

  const raw = data?.data?.reviews || [];
  const reviewsData = raw.map((item: any) => ({
    name: `${getMonthName(item._id.month)} ${item._id.year}`,
    Reviews: item.count,
  }));

  return (
    <AdminLayout>
      <div style={{ padding: '2rem 2.5rem', maxWidth: 1100 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Reviews Analytics</h1>
        <p style={{ color: 'var(--color-text-faint)', marginTop: 6 }}>Monthly review volume and rating trends</p>

        <div className="glass p-6 mt-6" style={{ minHeight: 320 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>Monthly Reviews</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reviewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="Reviews" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
