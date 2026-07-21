import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gigsApi } from '../../api/gigs';
import { enhanceGigDescription } from '../../api/ai';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video', 'Data', 'Finance', 'Other'];

interface GigForm {
  title: string;
  description: string;
  category: string;
  skills: string;
  budget: number;
  deadline: string;
  experienceLevel: string;
  status: string;
}

export default function EditGig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isEnhancingAI, setIsEnhancingAI] = useState(false);
  const [error, setError] = useState('');

  const { data: gig, isLoading } = useQuery({
    queryKey: ['gig', id],
    queryFn: () => gigsApi.getById(id!),
    select: r => r.data.gig,
    enabled: !!id,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<GigForm>();

  const titleValue = watch('title');
  const descriptionValue = watch('description');
  const categoryValue = watch('category');

  useEffect(() => {
    if (gig) {
      reset({
        title: gig.title,
        description: gig.description,
        category: gig.category,
        skills: gig.skills.join(', '),
        budget: gig.budget,
        deadline: gig.deadline ? gig.deadline.split('T')[0] : '',
        experienceLevel: gig.experienceLevel,
        status: gig.status,
      });
    }
  }, [gig, reset]);

  const handleEnhanceWithAI = async () => {
    if (!titleValue || !descriptionValue) {
      setError('Please provide at least a title and a basic description before enhancing with AI.');
      return;
    }
    setError('');
    setIsEnhancingAI(true);
    try {
      const res = await enhanceGigDescription({
        title: titleValue,
        description: descriptionValue,
        category: categoryValue,
      });

      if (res.enhancedDescription) {
        setValue('description', res.enhancedDescription);
      }
      if (res.recommendedSkills && Array.isArray(res.recommendedSkills) && res.recommendedSkills.length > 0) {
        setValue('skills', res.recommendedSkills.join(', '));
      }
    } catch (err: any) {
      console.error('Failed to enhance gig description:', err);
      setError('Failed to contact AI service for enhancement.');
    } finally {
      setIsEnhancingAI(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: GigForm) => {
      const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      return gigsApi.update(id!, { ...data, skills });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-gigs'] });
      qc.invalidateQueries({ queryKey: ['gig', id] });
      navigate('/client/gigs');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!gig) return <div className="page-container"><div className="empty-state"><h3>Gig not found</h3></div></div>;

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.875rem', padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>

      <h1 className="section-title">Edit Gig</h1>
      <p className="section-subtitle">Update your gig details</p>

      <div className="glass" style={{ padding: '2rem' }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ef4444', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
          <div className="form-group">
            <label className="label">Gig Title *</label>
            <input className="input" {...register('title', { required: true })} />
            {errors.title && <span className="error-text">Required</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="label" style={{ margin: 0 }}>Description *</label>
              <button
                type="button"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancingAI || !titleValue || !descriptionValue}
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  opacity: isEnhancingAI || !titleValue || !descriptionValue ? 0.6 : 1,
                }}
              >
                <span>✨</span>
                {isEnhancingAI ? 'AI Optimizing...' : 'Enhance & Extract Skills with AI'}
              </button>
            </div>
            <textarea className="textarea" {...register('description', { required: true })} style={{ minHeight: 140 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Category</label>
              <select className="select" {...register('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Experience Level</label>
              <select className="select" {...register('experienceLevel')}>
                <option>Beginner</option><option>Intermediate</option><option>Expert</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Budget ($)</label>
              <input type="number" className="input" {...register('budget', { required: true, min: 1 })} />
            </div>
            <div className="form-group">
              <label className="label">Deadline</label>
              <input type="date" className="input" {...register('deadline')} />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Skills (comma-separated)</label>
            <input className="input" {...register('skills')} />
          </div>

          <div className="form-group">
            <label className="label">Status</label>
            <select className="select" {...register('status')}>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" disabled={mutation.isPending} style={{ opacity: mutation.isPending ? 0.7 : 1 }}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

