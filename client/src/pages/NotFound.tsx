import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 900, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0, lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0', margin: '1rem 0 0.5rem' }}>Page Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary" style={{ padding: '0.875rem 2rem' }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
