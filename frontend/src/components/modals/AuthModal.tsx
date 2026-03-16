import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';

interface AuthModalProps {
  onLogin: (key: string) => void | Promise<void>;
  onPasskeyLogin: (token: string, user: import('../../types').User) => void;
  onClose: () => void;
}

const demoAccounts = [
  { key: 'admin', label: 'Admin — Nishad', sub: 'Full access', color: 'red' as const },
  { key: 'saviynt', label: 'Sponsor — Saviynt Gold', sub: 'Sponsor portal access', color: 'gold' as const },
  { key: 'cyberark', label: 'Sponsor — CyberArk Gold', sub: 'Terms pending', color: 'gold' as const },
  { key: 'member', label: 'Member — Marcus Webb', sub: 'Terms pending', color: 'accent' as const },
];

const socialProviders = [
  {
    id: 'google' as const,
    label: 'Continue with Google',
    bg: '#fff',
    color: '#333',
    border: '#ddd',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    id: 'github' as const,
    label: 'Continue with GitHub',
    bg: '#24292f',
    color: '#fff',
    border: '#24292f',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    id: 'linkedin' as const,
    label: 'Continue with LinkedIn',
    bg: '#0A66C2',
    color: '#fff',
    border: '#0A66C2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

export function AuthModal({ onLogin, onPasskeyLogin, onClose }: AuthModalProps) {
  const { T } = useTheme();
  const [showDemo, setShowDemo] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOAuth = (provider: 'google' | 'github' | 'linkedin') => {
    window.location.href = api.getOAuthUrl(provider);
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setError('');
    try {
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const options = await api.passkeyAuthOptions();
      const credential = await startAuthentication({ optionsJSON: options });
      const result = await api.passkeyAuthVerify(credential, { challenge: options.challenge });
      if (result.verified) {
        onPasskeyLogin(result.token, result.user);
      } else {
        setError('Passkey verification failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Passkey login failed';
      if (msg.includes('ceremony was sent an abort signal') || msg.includes('NotAllowedError')) {
        setError('');
      } else {
        setError(msg);
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: 'clamp(20px, 5vw, 32px)',
          width: 400,
          maxWidth: '92vw',
          transition: 'background 0.25s, border-color 0.25s',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: '#fff',
          }}>
            A
          </div>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: T.text,
            transition: 'color 0.25s',
          }}>
            Sign in to Atlanta IAM
          </span>
        </div>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: T.muted,
          margin: '0 0 24px',
          transition: 'color 0.25s',
        }}>
          Choose how you'd like to sign in
        </p>

        {error && (
          <div style={{
            background: T.redDim,
            border: `1px solid ${T.red}44`,
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 16,
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: T.red,
          }}>
            {error}
          </div>
        )}

        {/* Social login buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {socialProviders.map(sp => (
            <button
              key={sp.id}
              onClick={() => handleOAuth(sp.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: sp.bg,
                border: `1px solid ${sp.border}`,
                borderRadius: 10,
                padding: '12px 16px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: sp.color,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {sp.icon}
              {sp.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '16px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: T.border, transition: 'background 0.25s' }} />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.1em',
            color: T.muted,
            transition: 'color 0.25s',
          }}>
            OR
          </span>
          <div style={{ flex: 1, height: 1, background: T.border, transition: 'background 0.25s' }} />
        </div>

        {/* Passkey button */}
        <button
          onClick={handlePasskeyLogin}
          disabled={passkeyLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: 'transparent',
            border: `1px solid ${T.accent}66`,
            borderRadius: 10,
            padding: '12px 16px',
            cursor: passkeyLoading ? 'wait' : 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: T.accent,
            transition: 'background 0.25s, border-color 0.25s, color 0.25s',
            marginBottom: 16,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = T.accentDim;
            e.currentTarget.style.borderColor = T.accent;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = T.accent + '66';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/>
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>
          </svg>
          {passkeyLoading ? 'Waiting for passkey...' : 'Sign in with Passkey'}
        </button>

        {/* Demo accounts toggle */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, transition: 'border-color 0.25s' }}>
          <button
            onClick={() => setShowDemo(!showDemo)}
            style={{
              background: 'none',
              border: 'none',
              color: T.muted,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.25s',
            }}
          >
            {showDemo ? 'HIDE' : 'SHOW'} DEMO ACCOUNTS
          </button>

          {showDemo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {demoAccounts.map(acc => {
                const c = T[acc.color];
                return (
                  <button
                    key={acc.key}
                    onClick={() => onLogin(acc.key)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'background 0.25s, border-color 0.25s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = c + '66';
                      e.currentTarget.style.background = c + '08';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = T.border;
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: c,
                      boxShadow: `0 0 6px ${c}66`,
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: T.text,
                        transition: 'color 0.25s',
                      }}>
                        {acc.label}
                      </div>
                      <div style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        color: T.muted,
                        transition: 'color 0.25s',
                      }}>
                        {acc.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
