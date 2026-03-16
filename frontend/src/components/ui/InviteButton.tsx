import { useTheme } from '../../context/ThemeContext';

interface InviteButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'default' | 'compact' | 'cta';
}

export function InviteButton({ onClick, label = 'Invite a Colleague', variant = 'default' }: InviteButtonProps) {
  const { T } = useTheme();

  if (variant === 'compact') {
    return (
      <button onClick={onClick} style={{
        background: T.accentDim, border: `1px solid ${T.accent}44`,
        borderRadius: 6, color: T.accent, cursor: 'pointer',
        fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 10,
        letterSpacing: '0.06em', padding: '6px 12px',
        display: 'flex', alignItems: 'center', gap: 5,
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
        </svg>
        {label.toUpperCase()}
      </button>
    );
  }

  if (variant === 'cta') {
    return (
      <button onClick={onClick} style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${T.accent}`, borderRadius: 10,
        padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
        width: '100%', transition: 'border-color 0.25s, background 0.25s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: T.accentDim,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16,
              color: T.text, letterSpacing: '0.04em',
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted, marginTop: 2,
            }}>
              Share a personalized invite link with your network
            </div>
          </div>
        </div>
      </button>
    );
  }

  // default
  return (
    <button onClick={onClick} style={{
      background: T.accent, border: 'none', borderRadius: 8,
      color: '#fff', cursor: 'pointer', padding: '10px 20px',
      fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
      letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 7,
      transition: 'background 0.2s',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
      </svg>
      {label}
    </button>
  );
}
