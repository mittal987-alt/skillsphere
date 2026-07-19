import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ClientDashboard() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Welcome, {user?.name?.split(' ')[0] || 'Client'} 🚀</h1>
        <p className="section-subtitle">Manage your gigs and payments</p>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <Link to="/client/gigs/new" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          Post a Gig
        </Link>
        <Link to="/client/gigs" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
          Manage Gigs
        </Link>
        <Link to="/client/payments" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
          Payments
        </Link>
        <Link to="/chat" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
          Messages
        </Link>
      </div>
      
      <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Dashboard Overview</h3>
        <p style={{ color: '#475569', marginBottom: '1.5rem' }}>Your posted gigs, active proposals, and recent activities will appear here.</p>
        <Link to="/client/gigs/new" className="btn-primary">Post a Gig</Link>
      </div>
    </div>
  );
}