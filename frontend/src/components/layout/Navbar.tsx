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
}

export function Navbar({ user, currentPath, onNavigate, onSignIn, onSignOut }: NavbarProps) {
  const { T } = useTheme();

  const tabs: { label: string; path: string; color: string; roles?: string[] }[] = [
    { label: 'Home', path: '/', color: T.accent },
    { label: 'About', path: '/about', color: T.accent },
    { label: 'Events', path: '/events', color: T.accent },
    { label: 'Sponsors', path: '/sponsors', color: T.accent },
    { label: '\u25C6 Sponsor Portal', path: '/sponsor-portal', color: T.gold, roles: ['sponsor', 'admin'] },
    { label: '\u25CF Admin', path: '/admin', color: T.red, roles: ['admin'] },
  ];

  const visibleTabs = tabs.filter(t => !t.roles || (user && t.roles.includes(user.role)));
  const roleColor = user?.role === 'admin' ? T.red : user?.role === 'sponsor' ? T.gold : T.accent;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: T.navBg,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `2px solid ${T.accent}`,
      padding: '0 20px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      {/* Left: Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}
        onClick={() => onNavigate('/')}
      >
        <img src="/badge.png" alt="Atlanta IAM" width="32" height="32" style={{ borderRadius: '50%' }} />
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

      {/* Center: Tabs */}
      <div style={{ display: 'flex', gap: 2, height: '100%' }}>
        {visibleTabs.map(tab => {
          const active = currentPath === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => onNavigate(tab.path)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: active ? `2px solid ${tab.color}` : '2px solid transparent',
                color: active ? tab.color : T.muted,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.04em',
                padding: '0 12px',
                cursor: 'pointer',
                transition: 'color 0.25s, border-color 0.25s',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                textTransform: 'uppercase',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Theme + Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <ThemeToggle />
        <div style={{ width: 1, height: 20, background: T.border, transition: 'background 0.25s' }} />
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              onClick={() => onNavigate('/my-profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            >
              <Avatar name={user.name} size={26} role={user.role} />
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: T.text,
                transition: 'color 0.25s',
              }}>
                {user.name.split(' ')[0]}
              </span>
            </div>
            <Pill label={user.role} color={roleColor} size={9} />
            <button
              onClick={onSignOut}
              style={{
                background: 'none',
                border: `1px solid ${T.border}`,
                borderRadius: 5,
                color: T.muted,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.08em',
                padding: '3px 8px',
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
              fontSize: 11,
              letterSpacing: '0.08em',
              padding: '5px 14px',
              cursor: 'pointer',
              transition: 'background 0.25s',
            }}
          >
            SIGN IN
          </button>
        )}
      </div>
    </nav>
  );
}
