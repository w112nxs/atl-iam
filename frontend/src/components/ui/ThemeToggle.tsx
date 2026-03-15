import { useTheme } from '../../context/ThemeContext';

export function SystemBadge() {
  const { isAuto, T } = useTheme();
  if (!isAuto) return null;
  return (
    <span style={{
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
      fontSize: 9,
      letterSpacing: '0.1em',
      padding: '1px 5px',
      borderRadius: 3,
      background: T.accent + '22',
      color: T.accent,
      border: `1px solid ${T.accent}44`,
      transition: 'background 0.25s, color 0.25s, border-color 0.25s',
    }}>
      AUTO
    </span>
  );
}

export function ThemeToggle() {
  const { isDark, toggle, T } = useTheme();
  const trackColor = isDark ? T.accent : T.gold;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <SystemBadge />
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: trackColor + '44',
          border: `1px solid ${trackColor}66`,
          position: 'relative',
          cursor: 'pointer',
          padding: 0,
          transition: 'background 0.25s, border-color 0.25s',
        }}
      >
        <div style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: trackColor,
          position: 'absolute',
          top: 1,
          left: 1,
          transform: isDark ? 'translateX(0)' : 'translateX(20px)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s, box-shadow 0.25s',
          boxShadow: `0 0 8px ${trackColor}88`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
        }}>
          {isDark ? '🌙' : '☀️'}
        </div>
      </button>
      <span style={{
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.1em',
        color: T.muted,
        transition: 'color 0.25s',
      }}>
        {isDark ? 'DARK' : 'LIGHT'}
      </span>
    </div>
  );
}
