import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'client' | 'freelancer';
}

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({ defaultValues: { role: 'client' } });
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setLoading(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, role: data.role });
      toast.success("Registration Successful");
      navigate("/login");
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      setError(axErr.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }} className="fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 800, color: 'white',
            }}>S</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0 }}>Join SkillSphere</h1>
            <p style={{ color: 'var(--color-text-faint)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Start your journey today</p>
          </Link>
        </div>

        <div className="glass-strong" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ef4444', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {/* Role Selector */}
            <div className="form-group">
              <label className="label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {(['client', 'freelancer'] as const).map((role) => (
                  <label key={role} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    padding: '1rem', borderRadius: 12,
                    border: `2px solid ${selectedRole === role ? '#6366f1' : 'var(--color-border)'}`,
                    background: selectedRole === role ? 'rgba(99,102,241,0.1)' : 'var(--color-surface)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <input type="radio" value={role} {...register('role')} style={{ display: 'none' }} />
                    <span style={{ fontSize: '1.5rem' }}>{role === 'client' ? '🏢' : '💼'}</span>
                    <span style={{ fontWeight: 700, color: selectedRole === role ? '#a78bfa' : 'var(--color-text-muted)', textTransform: 'capitalize', fontSize: '0.9rem' }}>{role}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', textAlign: 'center' }}>
                      {role === 'client' ? 'Post gigs & hire' : 'Find work & earn'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                className="input"
                placeholder="John Doe"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
              />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="input"
                placeholder="Min. 6 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                className="input"
                placeholder="Repeat password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: val => val === watch('password') || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', color: 'var(--color-text-faint)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
