import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { gigsApi } from '../../api/gigs';

interface GigForm {
  title: string;
  description: string;
  category: string;
  skills: string;
  budget: number;
  deadline: string;
  experienceLevel: string;
  milestones: { title: string; amount: number; description?: string }[];
}

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video', 'Data', 'Finance', 'Other'];

export default function PostGig() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, control, formState: { errors } } = useForm<GigForm>({
    defaultValues: { experienceLevel: 'Intermediate', milestones: [] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'milestones' });

  const mutation = useMutation({
    mutationFn: (data: GigForm) => {
      const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      return gigsApi.create({ ...data, skills, milestones: data.milestones });
    },
    onSuccess: () => navigate('/client/gigs'),
    onError: (err: unknown) => {
      const axErr = err as { response?: { data?: { message?: string } } };
      setError(axErr.response?.data?.message || 'Failed to create gig');
    },
  });

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.875rem', padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>

      <h1 className="section-title">Post a New Gig</h1>
      <p className="section-subtitle">Describe what you need and find the perfect freelancer</p>

      <div className="glass" style={{ padding: '2rem' }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ef4444', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
          <div className="form-group">
            <label className="label" htmlFor="gig-title">Gig Title *</label>
            <input id="gig-title" className="input" placeholder="e.g. Build a React dashboard with TypeScript"
              {...register('title', { required: 'Title is required', minLength: { value: 10, message: 'Min 10 characters' } })} />
            {errors.title && <span className="error-text">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label className="label" htmlFor="gig-description">Description *</label>
            <textarea id="gig-description" className="textarea" placeholder="Describe the project, goals, deliverables..."
              {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'Min 30 characters' } })} style={{ minHeight: 160 }} />
            {errors.description && <span className="error-text">{errors.description.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="gig-category">Category *</label>
              <select id="gig-category" className="select" {...register('category', { required: 'Category is required' })}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="error-text">{errors.category.message}</span>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="gig-exp-level">Experience Level</label>
              <select id="gig-exp-level" className="select" {...register('experienceLevel')}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="gig-budget">Budget ($) *</label>
              <input id="gig-budget" type="number" className="input" placeholder="e.g. 500"
                {...register('budget', { required: 'Budget is required', min: { value: 1, message: 'Must be > 0' } })} />
              {errors.budget && <span className="error-text">{errors.budget.message}</span>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="gig-deadline">Deadline</label>
              <input id="gig-deadline" type="date" className="input"
                min={new Date().toISOString().split('T')[0]}
                {...register('deadline')} />
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="gig-skills">Required Skills (comma-separated)</label>
            <input id="gig-skills" className="input" placeholder="e.g. React, TypeScript, Node.js"
              {...register('skills')} />
          </div>

          {/* Milestones */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <label className="label" style={{ margin: 0 }}>Milestones (optional)</label>
              <button type="button" className="btn-secondary" onClick={() => append({ title: '', amount: 0, description: '' })} style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
                + Add Milestone
              </button>
            </div>
            {fields.map((field, i) => (
              <div key={field.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'start' }}>
                  <input className="input" placeholder="Milestone title" {...register(`milestones.${i}.title`, { required: true })} />
                  <button type="button" className="btn-danger" onClick={() => remove(i)} style={{ padding: '0.625rem 0.875rem' }}>✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input className="input" type="number" placeholder="Amount ($)" {...register(`milestones.${i}.amount`, { required: true, min: 1 })} />
                  <input className="input" placeholder="Description (optional)" {...register(`milestones.${i}.description`)} />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            id="create-gig-submit-btn"
            className="btn-primary"
            disabled={mutation.isPending}
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', opacity: mutation.isPending ? 0.7 : 1 }}
          >
            {mutation.isPending ? 'Posting...' : 'Post Gig'}
          </button>
        </form>
      </div>
    </div>
  );
}
