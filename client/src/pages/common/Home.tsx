import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gigsApi } from '../../api/gigs';
import GigCard from '../../components/common/GigCard';
import { type Gig } from '../../types';

const categories = [
  { label: 'Design', icon: '🎨', color: '#ec4899' },
  { label: 'Development', icon: '💻', color: '#6366f1' },
  { label: 'Writing', icon: '✍️', color: '#f59e0b' },
  { label: 'Marketing', icon: '📣', color: '#10b981' },
  { label: 'Video', icon: '🎬', color: '#ef4444' },
  { label: 'Data', icon: '📊', color: '#3b82f6' },
  { label: 'Finance', icon: '💰', color: '#14b8a6' },
  { label: 'Other', icon: '🔧', color: '#8b5cf6' },
];

const stats = [
  { value: '10K+', label: 'Freelancers' },
  { value: '5K+', label: 'Projects Posted' },
  { value: '$2M+', label: 'Paid Out' },
  { value: '98%', label: 'Satisfaction' },
];

export default function Home() {
  const { data } = useQuery({
    queryKey: ['gigs', 'recent'],
    queryFn: () => gigsApi.getAll({ limit: 6, page: 1 }),
    select: (res) => res.data,
  });

  const recentGigs: Gig[] = data?.gigs || [];

  return (
    <div>
      {/* Hero Section */}
      <section style={{ padding: '6rem 1.5rem 5rem', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 1rem', borderRadius: 999, marginBottom: '2rem',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Platform is live — 10,000+ freelancers ready
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          color: 'var(--color-text)',
          margin: '0 0 1.5rem',
        }}>
          Find the perfect{' '}
          <span style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            freelancer
          </span>{' '}
          for any job
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', lineHeight: 1.7, margin: '0 0 2.5rem' }}>
          SkillSphere connects talented freelancers with clients who need expert help.
          Post your gig, review proposals, and get things done.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/gigs" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
            Browse Gigs
          </Link>
          <Link to="/register" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
            Start Earning
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '4rem', flexWrap: 'wrap' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Browse by Category</h2>
          <p style={{ color: 'var(--color-text-faint)', fontSize: '0.95rem' }}>Find experts in every field</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
          {categories.map(cat => (
            <Link key={cat.label} to={`/gigs?category=${cat.label}`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '1.5rem 1rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = cat.color + '40';
                  el.style.background = cat.color + '10';
                  el.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = 'var(--color-border)';
                  el.style.background = 'var(--color-surface)';
                  el.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{cat.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Gigs */}
      {recentGigs.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: '0 0 0.25rem' }}>Latest Opportunities</h2>
              <p style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem', margin: 0 }}>Fresh gigs posted by clients</p>
            </div>
            <Link to="/gigs" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>View All</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
            {recentGigs.map(gig => <GigCard key={gig._id} gig={gig} />)}
          </div>
        </section>
      )}

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>How It Works</h2>
          <p style={{ color: 'var(--color-text-faint)' }}>Simple steps to get started</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { step: '01', title: 'Post Your Gig', desc: 'Describe what you need, set a budget and deadline.', icon: '📝', color: '#6366f1' },
            { step: '02', title: 'Review Proposals', desc: 'Freelancers submit bids with cover letters.', icon: '📋', color: '#8b5cf6' },
            { step: '03', title: 'Hire & Collaborate', desc: 'Accept a proposal and chat in real-time.', icon: '🤝', color: '#a78bfa' },
            { step: '04', title: 'Pay Securely', desc: 'Release payment via Razorpay when done.', icon: '💳', color: '#10b981' },
          ].map(item => (
            <div key={item.step} style={{
              padding: '1.75rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              position: 'relative',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: item.color, letterSpacing: '0.1em', marginBottom: '0.75rem', opacity: 0.7 }}>STEP {item.step}</div>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-faint)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: 640, margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 24, padding: '3rem 2rem',
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Ready to get started?
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Join thousands of professionals on SkillSphere.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>Create Free Account</Link>
            <Link to="/gigs" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>Explore Gigs</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
