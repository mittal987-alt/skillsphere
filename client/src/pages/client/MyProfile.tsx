import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

interface FormData {
  company?: string;
  bio?: string;
  website?: string;
  location?: string;
}

export default function MyProfile() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['client-profile'], queryFn: () => clientApi.getMyProfile().then(r => r.data.data), retry: false });

  const { register, handleSubmit, reset } = useForm<FormData>({ defaultValues: { company: '', bio: '', website: '', location: '' }});

  useEffect(() => {
    if (profile) {
      reset({ company: profile.company || '', bio: profile.bio || '', website: profile.website || '', location: profile.location || '' });
    }
  }, [profile, reset]);

  const mutation = useMutation({ mutationFn: (data: FormData) => (profile ? clientApi.updateProfile(data) : clientApi.createProfile(data)), onSuccess: () => { qc.invalidateQueries({ queryKey: ['client-profile'] }); toast.success('Profile saved'); } });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      <h1 className="section-title">{profile ? 'Edit Company Profile' : 'Create Company Profile'}</h1>
      <p className="section-subtitle">Provide company details and a short bio so freelancers can learn about you</p>

      <div className="glass" style={{ padding: 20 }}>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          <div className="form-group">
            <label className="label">Company / Organization</label>
            <input className="input" {...register('company')} />
          </div>

          <div className="form-group">
            <label className="label">Bio</label>
            <textarea className="textarea" {...register('bio')} style={{ minHeight: 120 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Website</label>
              <input className="input" {...register('website')} />
            </div>
            <div className="form-group">
              <label className="label">Location</label>
              <input className="input" {...register('location')} />
            </div>
          </div>

          <button className="btn-primary" style={{ marginTop: 16, width: '100%' }} disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Profile'}</button>
        </form>
      </div>
    </div>
  );
}
