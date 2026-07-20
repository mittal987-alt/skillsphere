import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Props {
  role?: string;
  label?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleAuthButton({ role, label = 'Continue with Google' }: Props) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !btnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          const res = await googleLogin(response.credential, role);
          if (res.user.role === 'client') navigate('/client/dashboard');
          else if (res.user.role === 'freelancer') navigate('/freelancer/dashboard');
          else navigate('/admin/dashboard');
        } catch (err) {
          console.error('Google login failed:', err);
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      width: btnRef.current.offsetWidth || 380,
      text: label === 'Continue with Google' ? 'continue_with' : 'signin_with',
      logo_alignment: 'center',
    });
  }, [role]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Overlay that intercepts click so we can style consistently */}
      <div
        ref={btnRef}
        id="google-signin-btn"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 10,
          minHeight: 44,
        }}
      />
    </div>
  );
}
