import { FreelancerProfile } from '../../types';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

interface FreelancerCardProps {
  freelancer: FreelancerProfile;
}

const availabilityBadge: Record<string, string> = {
  Available: 'badge badge-available',
  Busy: 'badge badge-busy',
  Offline: 'badge badge-offline',
};

export default function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const user = typeof freelancer.user === 'object' ? freelancer.user : null;

  return (
    <Link to={`/freelancer/${freelancer._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '1.5rem',
        transition: 'all 0.2s',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
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
        {/* Avatar & name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'F'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0' }}>{user?.name || 'Freelancer'}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{freelancer.title}</div>
          </div>
          <span className={availabilityBadge[freelancer.availability] || 'badge'}>{freelancer.availability}</span>
        </div>

        {/* Bio */}
        {freelancer.bio && (
          <p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {freelancer.bio}
          </p>
        )}

        {/* Skills */}
        {freelancer.skills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {freelancer.skills.slice(0, 5).map(s => (
              <span key={s} style={{
                fontSize: '0.72rem', padding: '3px 10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 999, color: '#94a3b8',
              }}>{s}</span>
            ))}
          </div>
        )}

        {/* Footer stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <StarRating rating={freelancer.averageRating} size={14} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>${freelancer.hourlyRate}/hr</div>
            <div style={{ fontSize: '0.7rem', color: '#475569' }}>{freelancer.experience}y exp</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
