import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../../redux/store';
import { notificationsApi } from '../../api/notifications';
import { setNotifications, markRead, markAllRead, removeNotification, addNotification } from '../../redux/slices/notificationSlice';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

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

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Navbar() {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  // Socket listener for real-time notifications
  const { socket } = useSocket();
  useEffect(() => {
    if (socket) {
      const handleNewNotif = (notif: any) => {
        dispatch(addNotification(notif));
        toast.info(
          <div>
            <strong>{notif.title}</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{notif.message}</p>
          </div>,
          {
            onClick: () => {
              if (notif.link) navigate(notif.link);
              notificationsApi.markAsRead(notif._id);
              dispatch(markRead(notif._id));
            }
          }
        );
      };

      socket.on('newNotification', handleNewNotif);
      return () => {
        socket.off('newNotification', handleNewNotif);
      };
    }
  }, [socket, dispatch, navigate]);

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
      background: 'var(--color-navbar-bg)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-navbar-border)',
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
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-logo-text)', letterSpacing: '-0.02em' }}>
            Skill<span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sphere</span>
          </span>
        </Link>

        {/* Desktop Nav Links + Global Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
          <form onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget as HTMLFormElement).get('q') as string; if (q && q.trim()) navigate(`/gigs?search=${encodeURIComponent(q.trim())}`); }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input name="q" placeholder="Search gigs, skills…" aria-label="Search" style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', width: 260 }} />
            <button type="submit" className="btn-secondary" style={{ padding: '6px 10px' }}>Search</button>
          </form>

          <NavLink to="/gigs" style={({ isActive }) => ({
            color: isActive ? 'var(--color-nav-link-active)' : 'var(--color-nav-link)', textDecoration: 'none',
            fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.2s',
          })}>Browse Gigs</NavLink>

          {isAuthenticated && (
            <NavLink to={dashboardLink()} style={({ isActive }) => ({
              color: isActive ? 'var(--color-nav-link-active)' : 'var(--color-nav-link)', textDecoration: 'none',
              fontWeight: 500, fontSize: '0.9rem',
            })}>Dashboard</NavLink>
          )}

          {isAuthenticated && (
            <NavLink to="/chat" style={({ isActive }) => ({
              color: isActive ? 'var(--color-nav-link-active)' : 'var(--color-nav-link)', textDecoration: 'none',
              fontWeight: 500, fontSize: '0.9rem',
            })}>Messages</NavLink>
          )}

          {/* role-specific quick links */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <NavLink to="/admin/payments" style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Payments</NavLink>
              <NavLink to="/admin/reviews" style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Reviews</NavLink>
              <NavLink to="/admin/analytics" style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Analytics</NavLink>
            </>
          )}
          {isAuthenticated && user?.role === 'freelancer' && (
            <>
              <NavLink to="/freelancer/earnings" style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Earnings</NavLink>
              <NavLink to="/freelancer/analytics" style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Analytics</NavLink>
            </>
          )}
          {isAuthenticated && user?.role === 'client' && (
            <>
              <NavLink to="/client/payments" style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Payments</NavLink>
              <NavLink to="/client/gigs/new" style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Post Gig</NavLink>
            </>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              background: 'transparent', border: 'none', color: 'var(--color-nav-link)',
              cursor: 'pointer', padding: 6, borderRadius: 8,
              transition: 'color 0.2s, background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-nav-link-active)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-nav-link)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notification bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  id="notif-bell-btn"
                  onClick={() => setNotifOpen(v => !v)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--color-nav-link)',
                    cursor: 'pointer', position: 'relative', padding: '6px',
                    borderRadius: 8, transition: 'color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-nav-link-active)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-nav-link)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
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
                    background: 'var(--color-dropdown-bg)', border: '1px solid var(--color-dropdown-border)',
                    borderRadius: 16, boxShadow: 'var(--shadow-dropdown)',
                    zIndex: 100,
                  }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-dropdown-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => { notificationsApi.markAllAsRead(); dispatch(markAllRead()); }}
                          style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >Mark all read</button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-faint)' }}>No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} style={{
                          padding: '0.875rem 1.25rem',
                          borderBottom: '1px solid var(--color-dropdown-divider)',
                          background: n.isRead ? 'transparent' : 'var(--color-notif-unread-bg)',
                          cursor: 'pointer', transition: 'background 0.2s',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem',
                        }}
                          onClick={() => { if (!n.isRead) { notificationsApi.markAsRead(n._id); dispatch(markRead(n._id)); } if (n.link) navigate(n.link); setNotifOpen(false); }}
                        >
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: n.isRead ? 'var(--color-text-muted)' : 'var(--color-text)', marginBottom: '0.2rem' }}>{n.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>{n.message}</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); notificationsApi.deleteNotification(n._id); dispatch(removeNotification(n._id)); }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-faint)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 2, flexShrink: 0 }}
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
                    background: 'var(--color-user-btn-bg)', border: '1px solid var(--color-user-btn-border)',
                    borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                    color: 'var(--color-text)', fontWeight: 600, fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-user-btn-border-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-user-btn-border)'; }}
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
                    minWidth: 180, background: 'var(--color-dropdown-bg)',
                    border: '1px solid var(--color-dropdown-border)', borderRadius: 12,
                    boxShadow: 'var(--shadow-dropdown)', zIndex: 100, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-dropdown-divider)', fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>
                      {user?.email}
                      <div style={{ fontWeight: 600, color: 'var(--color-text-muted)', marginTop: 2, textTransform: 'capitalize' }}>{user?.role}</div>
                    </div>
                    <Link to={dashboardLink()} onClick={() => setUserMenuOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-dropdown-hover)'; }}
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

          {/* Mobile menu toggle (always visible for easier access) */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            style={{ background: 'none', border: 'none', color: 'var(--color-nav-link)', cursor: 'pointer', padding: 4, display: 'block' }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ background: 'var(--color-dropdown-bg)', borderTop: '1px solid var(--color-dropdown-divider)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <form onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget as HTMLFormElement).get('q') as string; setMobileOpen(false); if (q && q.trim()) navigate(`/gigs?search=${encodeURIComponent(q.trim())}`); }}>
            <input name="q" placeholder="Search gigs, skills…" aria-label="Search" style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', width: '100%' }} />
          </form>
          <Link to="/gigs" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Browse Gigs</Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardLink()} onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
              <Link to="/chat" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Messages</Link>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/payments" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Payments</Link>
                  <Link to="/admin/reviews" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Reviews</Link>
                  <Link to="/admin/analytics" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Analytics</Link>
                </>
              )}
              {user?.role === 'freelancer' && (
                <>
                  <Link to="/freelancer/earnings" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Earnings</Link>
                  <Link to="/freelancer/analytics" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Analytics</Link>
                </>
              )}
              {user?.role === 'client' && (
                <>
                  <Link to="/client/payments" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Payments</Link>
                  <Link to="/client/gigs/new" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Post Gig</Link>
                </>
              )}
              <Link to={user?.role === 'client' ? '/client/profile' : user?.role === 'freelancer' ? '/freelancer/profile' : '/'} onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>My Profile</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontWeight: 500, padding: 0 }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-nav-link)', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 700 }}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
