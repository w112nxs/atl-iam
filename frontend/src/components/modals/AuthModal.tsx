import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';

interface AuthModalProps {
  onPasskeyLogin: (token: string, user: import('../../types').User) => void;
  onClose: () => void;
}

const socialProviders = [
  {
    id: 'google' as const,
    label: 'Google',
    bg: '#fff',
    color: '#333',
    border: '#ddd',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    id: 'github' as const,
    label: 'GitHub',
    bg: '#24292f',
    color: '#fff',
    border: '#24292f',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    id: 'linkedin' as const,
    label: 'LinkedIn',
    bg: '#0A66C2',
    color: '#fff',
    border: '#0A66C2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

export function AuthModal({ onPasskeyLogin, onClose }: AuthModalProps) {
  const { T } = useTheme();
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
      const { _challengeId, ...optionsJSON } = options as typeof options & { _challengeId: string };
      const credential = await startAuthentication({ optionsJSON });
      const result = await api.passkeyAuthVerify({ ...credential, _challengeId }, { challenge: optionsJSON.challenge });
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
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="auth-modal-container"
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          overflow: 'hidden',
          width: 720,
          maxWidth: '95vw',
          display: 'flex',
          transition: 'background 0.25s, border-color 0.25s',
          boxShadow: T.shadow,
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 14,
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1,
            zIndex: 2,
          }}
        >
          &times;
        </button>

        {/* ── Left Column: Branding ── */}
        <div
          className="auth-modal-left"
          style={{
            width: 280,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
            padding: '40px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <img
              src="/badge.png"
              alt="Atlanta IAM"
              width="144"
              height="144"
              style={{
                borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.25)',
                marginBottom: 16,
              }}
            />
            <h2 style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: 26,
              color: '#fff',
              margin: '0 0 6px',
              letterSpacing: '0.03em',
            }}>
              Atlanta IAM
            </h2>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: 'rgba(255,255,255,0.75)',
              margin: '0 0 24px',
              lineHeight: 1.5,
              letterSpacing: '0.02em',
            }}>
              Identity & Access Management<br />User Group
            </p>

            {/* Feature highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
              {[
                { icon: '🎤', text: 'Exclusive speaking events' },
                { icon: '🤝', text: 'Member directory & networking' },
                { icon: '🔐', text: 'IAM community resources' },
                { icon: '📜', text: 'CPE-eligible sessions' },
              ].map(f => (
                <div key={f.text} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: "'Inter', sans-serif", fontSize: 11,
                  color: 'rgba(255,255,255,0.85)', letterSpacing: '0.01em',
                }}>
                  <span style={{ fontSize: 14 }}>{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column: Sign In ── */}
        <div style={{
          flex: 1,
          padding: '32px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 0,
        }}>
          <h3 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: T.text,
            margin: '0 0 4px',
            transition: 'color 0.25s',
          }}>
            Welcome
          </h3>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: T.muted,
            margin: '0 0 20px',
            transition: 'color 0.25s',
          }}>
            Sign in to access your account
          </p>

          {error && (
            <div style={{
              background: T.redDim,
              border: `1px solid ${T.red}44`,
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 14,
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
                  justifyContent: 'center',
                  gap: 10,
                  background: sp.bg,
                  border: `1px solid ${sp.border}`,
                  borderRadius: 10,
                  padding: '11px 16px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: sp.color,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {sp.icon}
                Continue with {sp.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '6px 0 14px',
          }}>
            <div style={{ flex: 1, height: 1, background: T.border, transition: 'background 0.25s' }} />
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.12em',
              color: T.subtle,
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
              border: `1.5px solid ${T.accent}55`,
              borderRadius: 10,
              padding: '11px 16px',
              cursor: passkeyLoading ? 'wait' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: T.accent,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = T.accentDim;
              e.currentTarget.style.borderColor = T.accent;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = T.accent + '55';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/>
              <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>
            </svg>
            {passkeyLoading ? 'Waiting for passkey...' : 'Sign in with Passkey'}
          </button>

        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 600px) {
          .auth-modal-container {
            flex-direction: column !important;
            width: 92vw !important;
            max-height: 90vh;
            overflow-y: auto;
          }
          .auth-modal-left {
            width: 100% !important;
            padding: 24px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
