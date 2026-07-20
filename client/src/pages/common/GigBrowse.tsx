import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { gigsApi } from '../../api/gigs';
import GigCard from '../../components/common/GigCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type Gig } from '../../types';

const CATEGORIES = ['', 'Design', 'Development', 'Writing', 'Marketing', 'Video', 'Data', 'Finance', 'Other'];
const EXP_LEVELS = ['', 'Beginner', 'Intermediate', 'Expert'];

export default function GigBrowse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['gigs', { search, category, skill, experience, minBudget, maxBudget, page }],
    queryFn: () => gigsApi.getAll({
      search: search || undefined,
      category: category || undefined,
      skill: skill || undefined,
      experience: experience || undefined,
      minBudget: minBudget ? Number(minBudget) : undefined,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
      page,
      limit: 12,
    }),
    select: r => r.data,
  });

  const gigs: Gig[] = data?.results || data?.gigs || []; // Account for search vs normal gigs response
  const totalPages: number = data?.totalPages || 1;
  const total: number = data?.total || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ 
      ...(search && { search }), 
      ...(category && { category }),
      ...(skill && { skill }),
      ...(experience && { experience })
    });
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Browse Gigs</h1>
        <p className="section-subtitle">Find your next opportunity from {total} open gigs</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Filters sidebar */}
        <div className="glass" style={{ padding: '1.5rem', position: 'sticky', top: 80 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Filters</h3>

          <div className="form-group">
            <label className="label">Search Keywords</label>
            <form onSubmit={handleSearch}>
              <input
                id="gig-search-input"
                type="text"
                className="input"
                placeholder="e.g. React developer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </form>
          </div>

          <div className="form-group">
            <label className="label">Skills (comma separated)</label>
            <input
              id="gig-skill-input"
              type="text"
              className="input"
              placeholder="e.g. React, Node.js"
              value={skill}
              onChange={e => { setSkill(e.target.value); setPage(1); }}
            />
          </div>

          <div className="form-group">
            <label className="label">Category</label>
            <select
              id="gig-category-filter"
              className="select"
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Experience Level</label>
            <select
              id="gig-experience-filter"
              className="select"
              value={experience}
              onChange={e => { setExperience(e.target.value); setPage(1); }}
            >
              {EXP_LEVELS.map(e => <option key={e} value={e}>{e || 'Any Level'}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Budget Range ($)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="min-budget-input"
                type="number"
                className="input"
                placeholder="Min"
                value={minBudget}
                onChange={e => { setMinBudget(e.target.value); setPage(1); }}
                style={{ width: '50%' }}
              />
              <input
                id="max-budget-input"
                type="number"
                className="input"
                placeholder="Max"
                value={maxBudget}
                onChange={e => { setMaxBudget(e.target.value); setPage(1); }}
                style={{ width: '50%' }}
              />
            </div>
          </div>

          <button
            id="apply-filters-btn"
            className="btn-primary"
            onClick={handleSearch}
            style={{ width: '100%' }}
          >Apply Filters</button>

          <button
            className="btn-secondary"
            onClick={() => { setSearch(''); setCategory(''); setSkill(''); setExperience(''); setMinBudget(''); setMaxBudget(''); setPage(1); setSearchParams({}); }}
            style={{ width: '100%', marginTop: '0.75rem' }}
          >Clear All</button>
        </div>

        {/* Gig grid */}
        <div>
          {isLoading ? (
            <LoadingSpinner message="Fetching gigs..." />
          ) : gigs.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <h3>No gigs found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
                {gigs.map(gig => <GigCard key={gig._id} gig={gig} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', opacity: page === 1 ? 0.4 : 1 }}
                  >← Prev</button>
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const pg = i + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        style={{
                          padding: '0.5rem 0.875rem', fontSize: '0.85rem', borderRadius: 8,
                          background: pg === page ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${pg === page ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                          color: pg === page ? 'white' : '#94a3b8', cursor: 'pointer', fontWeight: pg === page ? 700 : 500,
                        }}
                      >{pg}</button>
                    );
                  })}
                  <button
                    className="btn-secondary"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', opacity: page === totalPages ? 0.4 : 1 }}
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
