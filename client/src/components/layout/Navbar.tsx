import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../../redux/store';
import { notificationsApi } from '../../api/notifications';
import { setNotifications, markRead, markAllRead, removeNotification } from '../../redux/slices/notificationSlice';

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Navbar() {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi.getMyNotifications()
        .then(res => dispatch(setNotifications(res.data.notifications || [])))
        .catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const dashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'client') return '/client/dashboard';
    if (user.role === 'freelancer') return '/freelancer/dashboard';
    return '/admin/dashboard';
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8, 8, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: 'white', fontSize: 16
          }}>S</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.02em' }}>
            Skill<span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sphere</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <NavLink to="/gigs" style={({ isActive }) => ({
            color: isActive ? '#a78bfa' : '#94a3b8', textDecoration: 'none',
            fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.2s',
          })}>Browse Gigs</NavLink>

          {isAuthenticated && (
            <NavLink to={dashboardLink()} style={({ isActive }) => ({
              color: isActive ? '#a78bfa' : '#94a3b8', textDecoration: 'none',
              fontWeight: 500, fontSize: '0.9rem',
            })}>Dashboard</NavLink>
          )}

          {isAuthenticated && (
            <NavLink to="/chat" style={({ isActive }) => ({
              color: isActive ? '#a78bfa' : '#94a3b8', textDecoration: 'none',
              fontWeight: 500, fontSize: '0.9rem',
            })}>Messages</NavLink>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              {/* Notification bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  id="notif-bell-btn"
                  onClick={() => setNotifOpen(v => !v)}
                  style={{
                    background: 'transparent', border: 'none', color: '#94a3b8',
                    cursor: 'pointer', position: 'relative', padding: '6px',
                    borderRadius: 8, transition: 'color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(167,139,250,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 2, right: 2,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#6366f1', color: 'white',
                      fontSize: '0.65rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                    width: 340, maxHeight: 440, overflowY: 'auto',
                    background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    zIndex: 100,
                  }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => { notificationsApi.markAllAsRead(); dispatch(markAllRead()); }}
                          style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >Mark all read</button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} style={{
                          padding: '0.875rem 1.25rem',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                          cursor: 'pointer', transition: 'background 0.2s',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem',
                        }}
                          onClick={() => { if (!n.isRead) { notificationsApi.markAsRead(n._id); dispatch(markRead(n._id)); } if (n.link) navigate(n.link); setNotifOpen(false); }}
                        >
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: n.isRead ? '#94a3b8' : '#e2e8f0', marginBottom: '0.2rem' }}>{n.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#475569' }}>{n.message}</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); notificationsApi.deleteNotification(n._id); dispatch(removeNotification(n._id)); }}
                            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 2, flexShrink: 0 }}
                          >×</button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User avatar menu */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                    color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(167,139,250,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</span>
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    minWidth: 180, background: '#0f0f23',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 100, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.8rem', color: '#475569' }}>
                      {user?.email}
                      <div style={{ fontWeight: 600, color: '#94a3b8', marginTop: 2, textTransform: 'capitalize' }}>{user?.role}</div>
                    </div>
                    <Link to={dashboardLink()} onClick={() => setUserMenuOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                    >Dashboard</Link>
                    <button onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Get Started</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, display: 'none' }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ background: '#0f0f23', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/gigs" onClick={() => setMobileOpen(false)} style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>Browse Gigs</Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardLink()} onClick={() => setMobileOpen(false)} style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
              <Link to="/chat" onClick={() => setMobileOpen(false)} style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>Messages</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontWeight: 500, padding: 0 }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 700 }}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
