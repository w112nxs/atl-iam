import { useTheme } from '../context/ThemeContext';

export function AccessDenied({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { T } = useTheme();
  return (
    <div style={{
      width: '90%',
      maxWidth: 500,
      margin: '80px auto',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        fontSize: 36,
        color: T.red,
        margin: '0 0 12px',
        transition: 'color 0.25s',
      }}>
        Access Denied
      </h1>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 15,
        color: T.muted,
        margin: '0 0 24px',
        transition: 'color 0.25s',
      }}>
        You don't have permission to view this page.
      </p>
      <button
        onClick={() => onNavigate('/')}
        style={{
          background: T.accent,
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.06em',
          padding: '12px 28px',
          cursor: 'pointer',
          transition: 'background 0.25s',
        }}
      >
        GO HOME
      </button>
    </div>
  );
}
