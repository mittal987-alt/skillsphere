import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { freelancerApi } from '../../api/freelancer';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface ProfileForm {
  title: string;
  bio: string;
  skills: string;
  hourlyRate: number;
  experience: number;
  availability: string;
  languages: string;
  portfolio: { title: string; description?: string; projectUrl?: string }[];
}

export default function MyProfile() {
  const qc = useQueryClient();
  const [success, setSuccess] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['freelancer-profile'],
    queryFn: () => freelancerApi.getMyProfile(),
    select: r => r.data.profile,
  });

  const isCreating = !profile && !isLoading;

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { portfolio: [] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'portfolio' });

  useEffect(() => {
    if (profile) {
      reset({
        title: profile.title,
        bio: profile.bio,
        skills: profile.skills.join(', '),
        hourlyRate: profile.hourlyRate,
        experience: profile.experience,
        availability: profile.availability,
        languages: profile.languages.join(', '),
        portfolio: profile.portfolio || [],
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProfileForm) => {
      const payload = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        languages: data.languages.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (isCreating) return freelancerApi.createProfile(payload);
      return freelancerApi.updateProfile(payload);
    },
    onSuccess: () => {
      setSuccess('Profile saved successfully!');
      qc.invalidateQueries({ queryKey: ['freelancer-profile'] });
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      <h1 className="section-title">{isCreating ? 'Create Profile' : 'Edit Profile'}</h1>
      <p className="section-subtitle">Showcase your skills and experience</p>

      <div className="glass" style={{ padding: '2rem' }}>
        {success && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '0.75rem 1rem', color: '#10b981', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
          <div className="form-group">
            <label className="label">Professional Title *</label>
            <input className="input" placeholder="e.g. Senior Frontend Developer" {...register('title', { required: true })} />
            {errors.title && <span className="error-text">Required</span>}
          </div>

          <div className="form-group">
            <label className="label">Bio</label>
            <textarea className="textarea" placeholder="Tell clients about yourself..." {...register('bio')} style={{ minHeight: 120 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Hourly Rate ($) *</label>
              <input type="number" className="input" {...register('hourlyRate', { required: true, min: 0 })} />
              {errors.hourlyRate && <span className="error-text">Required</span>}
            </div>
            <div className="form-group">
              <label className="label">Experience (Years) *</label>
              <input type="number" className="input" {...register('experience', { required: true, min: 0 })} />
              {errors.experience && <span className="error-text">Required</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Skills (comma-separated)</label>
              <input className="input" placeholder="React, Node.js, Design" {...register('skills')} />
            </div>
            <div className="form-group">
              <label className="label">Languages (comma-separated)</label>
              <input className="input" placeholder="English, Spanish" {...register('languages')} />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Availability</label>
            <select className="select" {...register('availability')}>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          {/* Portfolio items */}
          <div style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <label className="label" style={{ margin: 0 }}>Portfolio Items</label>
              <button type="button" className="btn-secondary" onClick={() => append({ title: '', description: '', projectUrl: '' })} style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
                + Add Item
              </button>
            </div>
            {fields.map((field, i) => (
              <div key={field.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <input className="input" placeholder="Project Title" {...register(`portfolio.${i}.title`, { required: true })} style={{ flex: 1 }} />
                  <button type="button" className="btn-danger" onClick={() => remove(i)}>✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  <input className="input" placeholder="Project URL (optional)" {...register(`portfolio.${i}.projectUrl`)} />
                  <textarea className="textarea" placeholder="Description (optional)" {...register(`portfolio.${i}.description`)} style={{ minHeight: 60 }} />
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={mutation.isPending} style={{ width: '100%', padding: '0.875rem' }}>
            {mutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
