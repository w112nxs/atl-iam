import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { Pill } from '../ui/Pill';
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

  const tabs: { label: string; path: string; color: string; roles?: string[] }[] = [
    { label: 'Home', path: '/', color: T.accent },
    { label: 'About', path: '/about', color: T.accent },
    { label: 'Events', path: '/events', color: T.accent },
    { label: 'Sponsors', path: '/sponsors', color: T.accent },
    { label: 'Members', path: '/members', color: T.accent, roles: ['member', 'sponsor', 'admin'] },
    { label: '\u25C6 Sponsor Portal', path: '/sponsor-portal', color: T.gold, roles: ['sponsor', 'admin'] },
    { label: '\u25CF Admin', path: '/admin', color: T.red, roles: ['admin'] },
  ];

  const visibleTabs = tabs.filter(t => !t.roles || (user && t.roles.includes(user.role)));
  const roleColor = user?.role === 'admin' ? T.red : user?.role === 'sponsor' ? T.gold : T.accent;

  const handleNav = (path: string) => {
    onNavigate(path);
    setMenuOpen(false);
  };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                onClick={() => handleNav('/my-profile')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              >
                <Avatar name={user.name} size={24} role={user.role} />
                <span className="nav-user-name" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.text,
                  transition: 'color 0.25s',
                }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <Pill label={user.role} color={roleColor} size={8} />
              {onInvite && (
                <button
                  onClick={onInvite}
                  className="nav-user-name"
                  style={{
                    background: T.accentDim,
                    border: `1px solid ${T.accent}44`,
                    borderRadius: 5,
                    color: T.accent,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: 9,
                    letterSpacing: '0.08em',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    transition: 'background 0.25s, border-color 0.25s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  title="Invite a colleague"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  INVITE
                </button>
              )}
              <button
                onClick={onSignOut}
                className="nav-user-name"
                style={{
                  background: 'none',
                  border: `1px solid ${T.border}`,
                  borderRadius: 5,
                  color: T.muted,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  transition: 'color 0.25s, border-color 0.25s',
                }}
              >
                SIGN OUT
              </button>
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
              }}
            >
              SIGN IN
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
                }}
              >
                {tab.label}
              </button>
            );
          })}
          {user && (
            <button
              onClick={() => { onSignOut(); setMenuOpen(false); }}
              style={{
                background: 'none',
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                color: T.muted,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.06em',
                padding: '10px 14px',
                cursor: 'pointer',
                transition: 'color 0.25s, border-color 0.25s',
                textAlign: 'left',
                marginTop: 4,
              }}
            >
              SIGN OUT
            </button>
          )}
        </div>
      )}
    </>
  );
}
