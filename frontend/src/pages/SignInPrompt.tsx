import { useTheme } from '../context/ThemeContext';
import { Icon } from '../components/ui/Icon';

export function SignInPrompt({ onSignIn, onNavigate }: { onSignIn: () => void; onNavigate: (path: string) => void }) {
  const { T } = useTheme();
  return (
    <div style={{
      width: '90%',
      maxWidth: 440,
      margin: 'clamp(60px, 12vw, 120px) auto',
      textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <Icon name="login" size={28} color={T.accent} />
      </div>
      <h1 style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        fontSize: 28,
        color: T.text,
        margin: '0 0 10px',
        transition: 'color 0.25s',
      }}>
        Sign in to continue
      </h1>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        color: T.muted,
        margin: '0 0 28px',
        lineHeight: 1.6,
        transition: 'color 0.25s',
      }}>
        You need to be a member to access this page. Sign in or create an account to get started.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={onSignIn}
          style={{
            background: T.accent,
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '0.06em',
            padding: '12px 32px',
            cursor: 'pointer',
            transition: 'background 0.25s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="login" size={16} color="#fff" /> SIGN IN
        </button>
        <button
          onClick={() => onNavigate('/')}
          style={{
            background: 'transparent',
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.muted,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '0.06em',
            padding: '12px 24px',
            cursor: 'pointer',
            transition: 'all 0.25s',
          }}
        >
          GO HOME
        </button>
      </div>
    </div>
  );
}
