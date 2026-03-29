import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { Pill } from '../ui/Pill';
import { Icon } from '../ui/Icon';
import type { User } from '../../types';

interface NavbarProps {
  user: User | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onInvite?: () => void;
}

export function Navbar({ user, currentPath, onNavigate, onSignIn, onSignOut, onInvite }: NavbarProps) {
  const { T } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const tabs: { label: string; path: string; color: string; roles?: string[] }[] = [
    { label: 'Home', path: '/', color: T.accent },
    { label: 'About', path: '/about', color: T.accent },
    { label: 'Events', path: '/events', color: T.accent },
    { label: 'Sponsors', path: '/sponsors', color: T.accent },
    { label: 'Members', path: '/members', color: T.accent, roles: ['member', 'admin'] },
    { label: '\u25CF Admin', path: '/admin', color: T.red, roles: ['admin'] },
  ];

  const visibleTabs = tabs.filter(t => !t.roles || (user && t.roles.includes(user.role)));
  const roleColor = user?.role === 'admin' ? T.red : T.accent;

  const handleNav = (path: string) => {
    onNavigate(path);
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const isAdmin = user?.role === 'admin';
  const userMenuItems: { icon: string; label: string; action: () => void; color?: string; divider?: boolean }[] = [
    { icon: 'account_circle', label: 'My Account', action: () => handleNav('/my-profile') },
    ...(onInvite ? [{ icon: 'person_add', label: 'Invite Colleague', action: () => { setUserMenuOpen(false); onInvite(); } }] : []),
    ...(isAdmin ? [{ icon: 'admin_panel_settings', label: 'Admin Portal', action: () => handleNav('/admin'), color: T.red, divider: true }] : []),
    { icon: 'logout', label: 'Sign Out', action: () => { setUserMenuOpen(false); onSignOut(); }, color: T.red, divider: !isAdmin },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: T.navBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `2px solid ${T.accent}`,
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background 0.25s, border-color 0.25s',
      }}>
        {/* Left: Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => handleNav('/')}
        >
          <img src="/badge.png" alt="Atlanta IAM" width="28" height="28" style={{ borderRadius: '50%' }} />
          <span style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: T.text,
            letterSpacing: '0.04em',
            transition: 'color 0.25s',
          }}>
            Atlanta IAM
          </span>
        </div>

        {/* Center: Tabs — hidden on mobile via CSS */}
        <div className="nav-tabs" style={{ display: 'flex', gap: 2, height: '100%' }}>
          {visibleTabs.map(tab => {
            const active = currentPath === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => handleNav(tab.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? `2px solid ${tab.color}` : '2px solid transparent',
                  color: active ? tab.color : T.muted,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  padding: '0 10px',
                  cursor: 'pointer',
                  transition: 'color 0.25s, border-color 0.25s',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Theme + Auth + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <ThemeToggle />
          {user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  background: userMenuOpen ? T.accentDim : 'transparent',
                  border: `1px solid ${userMenuOpen ? T.accent + '44' : 'transparent'}`,
                  borderRadius: 8,
                  padding: '4px 10px 4px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <Avatar name={user.name} size={26} role={user.role} />
                <span className="nav-user-name" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.text,
                  transition: 'color 0.25s',
                }}>
                  {user.name.split(' ')[0]}
                </span>
                <Pill label={user.role} color={roleColor} size={8} />
                <Icon name={userMenuOpen ? 'expand_less' : 'expand_more'} size={16} color={T.muted} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  minWidth: 200,
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  boxShadow: T.shadow,
                  padding: '6px 0',
                  zIndex: 200,
                  animation: 'scaleIn 0.15s ease-out',
                }}>
                  {/* User header */}
                  <div style={{
                    padding: '10px 16px 8px',
                    borderBottom: `1px solid ${T.border}`,
                    marginBottom: 4,
                  }}>
                    <div style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: T.text,
                    }}>{user.name}</div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      color: T.muted,
                      marginTop: 1,
                    }}>{user.email}</div>
                  </div>

                  {/* Menu items */}
                  {userMenuItems.map((item, i) => (
                    <div key={i}>
                      {item.divider && (
                        <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
                      )}
                      <button
                        onClick={item.action}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          width: '100%',
                          padding: '9px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          color: item.color || T.text,
                          transition: 'background 0.15s',
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = T.surface)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Icon name={item.icon} size={18} color={item.color || T.muted} />
                        {item.label}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignIn}
              style={{
                background: T.accent,
                border: 'none',
                borderRadius: 5,
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.08em',
                padding: '4px 12px',
                cursor: 'pointer',
                transition: 'background 0.25s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Icon name="login" size={14} /> SIGN IN
            </button>
          )}
          {/* Hamburger — shown only on mobile via CSS */}
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              flexDirection: 'column',
              gap: 4,
            }}
            aria-label="Menu"
          >
            <span style={{ width: 20, height: 2, background: T.text, borderRadius: 1, transition: 'background 0.25s' }} />
            <span style={{ width: 20, height: 2, background: T.text, borderRadius: 1, transition: 'background 0.25s' }} />
            <span style={{ width: 20, height: 2, background: T.text, borderRadius: 1, transition: 'background 0.25s' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div style={{
          position: 'sticky',
          top: 56,
          zIndex: 99,
          background: T.navBg,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${T.border}`,
          padding: '8px 20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: 'background 0.25s, border-color 0.25s',
        }}>
          {visibleTabs.map(tab => {
            const active = currentPath === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => handleNav(tab.path)}
                style={{
                  background: active ? T.accentDim : 'none',
                  border: 'none',
                  borderRadius: 6,
                  color: active ? tab.color : T.muted,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  transition: 'color 0.25s, background 0.25s',
                  textAlign: 'left',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {tab.label}
              </button>
            );
          })}
          {user && (
            <>
              <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
              <button
                onClick={() => handleNav('/my-profile')}
                style={{
                  background: currentPath === '/my-profile' ? T.accentDim : 'none',
                  border: 'none',
                  borderRadius: 6,
                  color: T.text,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  transition: 'color 0.25s, background 0.25s',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="account_circle" size={18} color={T.muted} /> MY ACCOUNT
              </button>
              <button
                onClick={() => { onSignOut(); setMenuOpen(false); }}
                style={{
                  background: 'none',
                  border: `1px solid ${T.border}`,
                  borderRadius: 6,
                  color: T.red,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  transition: 'color 0.25s, border-color 0.25s',
                  textAlign: 'left',
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="logout" size={18} /> SIGN OUT
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
