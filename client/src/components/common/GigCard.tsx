import { Gig } from '../../types';
import { Link } from 'react-router-dom';

interface GigCardProps {
  gig: Gig;
}

const getBadgeClass = (status: string) => {
  switch (status) {
    case 'Open': return 'badge badge-open';
    case 'In Progress': return 'badge badge-progress';
    case 'Completed': return 'badge badge-completed';
    case 'Cancelled': return 'badge badge-cancelled';
    default: return 'badge';
  }
};

export default function GigCard({ gig }: GigCardProps) {
  const client = typeof gig.client === 'object' ? gig.client : null;
  const clientUser = client && typeof client.user === 'object' ? client.user : null;

  return (
    <Link to={`/gigs/${gig._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '1.25rem',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = 'rgba(99,102,241,0.4)';
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 12px 32px rgba(99,102,241,0.12)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = 'rgba(255,255,255,0.08)';
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, color: '#a78bfa',
            background: 'rgba(167,139,250,0.1)', padding: '3px 10px',
            borderRadius: 999, border: '1px solid rgba(167,139,250,0.2)',
          }}>{gig.category}</span>
          <span className={getBadgeClass(gig.status)}>{gig.status}</span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.4, margin: 0 }}>
          {gig.title}
        </h3>

        {/* Description */}
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {gig.description}
        </p>

        {/* Skills */}
        {gig.skills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {gig.skills.slice(0, 4).map(skill => (
              <span key={skill} style={{
                fontSize: '0.72rem', padding: '3px 10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 999, color: '#94a3b8',
              }}>{skill}</span>
            ))}
            {gig.skills.length > 4 && (
              <span style={{ fontSize: '0.72rem', color: '#475569', padding: '3px 6px' }}>+{gig.skills.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>${gig.budget.toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', color: '#475569' }}>Budget</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{clientUser?.name || 'Client'}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>
              {gig.experienceLevel}
              {gig.deadline && ` · Due ${new Date(gig.deadline).toLocaleDateString()}`}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
