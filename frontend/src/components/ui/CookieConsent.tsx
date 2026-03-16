import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const STORAGE_KEY = 'atlanta-iam-cookies';

type CookiePrefs = {
  essential: boolean;   // always true
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

const DEFAULT_PREFS: CookiePrefs = {
  essential: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

function getSavedPrefs(): CookiePrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const { T } = useTheme();
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_PREFS);

  useEffect(() => {
    // Don't show if already accepted
    if (!getSavedPrefs()) {
      // Small delay for a smoother entrance
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (p: CookiePrefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setVisible(false);
  };

  const acceptAll = () => {
    save({ essential: true, analytics: true, marketing: true, personalization: true });
  };

  const savePreferences = () => {
    save(prefs);
  };

  const rejectNonEssential = () => {
    save(DEFAULT_PREFS);
  };

  if (!visible) return null;

  const categories: { key: keyof CookiePrefs; label: string; desc: string; locked?: boolean }[] = [
    { key: 'essential', label: 'Essential', desc: 'Required for the website to function. Cannot be disabled.', locked: true },
    { key: 'analytics', label: 'Analytics', desc: 'Help us understand how visitors interact with our website.' },
    { key: 'marketing', label: 'Marketing', desc: 'Used to deliver relevant advertisements and track campaigns.' },
    { key: 'personalization', label: 'Personalization', desc: 'Allow us to remember your preferences and customize your experience.' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      display: 'flex', justifyContent: 'center',
      padding: '0 16px 16px',
      animation: 'cookieSlideUp 0.4s ease-out',
    }}>
      <style>{`
        @keyframes cookieSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 520,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: managing ? '24px 28px 20px' : '28px 28px 24px',
        boxShadow: T.mode === 'dark'
          ? '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)'
          : '0 -4px 40px rgba(0,0,0,0.12)',
      }}>
        {!managing ? (
          /* ── Main View ── */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>🍪</span>
              <h3 style={{
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
                fontSize: 22, color: T.text, margin: 0,
              }}>
                Guess what? Cookies!
              </h3>
            </div>

            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13, lineHeight: 1.6,
              color: T.muted, margin: '0 0 20px',
            }}>
              We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve your experience and analyze usage. Learn more in our{' '}
              <a
                href="/privacy"
                style={{ color: T.accent, textDecoration: 'underline', textUnderlineOffset: 2 }}
              >
                privacy policy
              </a>.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={acceptAll}
                style={{
                  background: T.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 24px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                Accept All
              </button>
              <button
                onClick={() => setManaging(true)}
                style={{
                  background: 'transparent',
                  color: T.text,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 10,
                  padding: '12px 24px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                Manage Cookies
              </button>
            </div>
          </>
        ) : (
          /* ── Manage View ── */
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
                fontSize: 20, color: T.text, margin: 0,
              }}>
                Manage Cookie Preferences
              </h3>
              <button
                onClick={() => setManaging(false)}
                style={{
                  background: 'none', border: 'none', color: T.muted,
                  fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
                }}
                aria-label="Back"
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 18 }}>
              {categories.map((cat, i) => (
                <div
                  key={cat.key}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0',
                    borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                    <div style={{
                      fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
                      color: T.text, marginBottom: 2,
                    }}>
                      {cat.label}
                      {cat.locked && (
                        <span style={{
                          marginLeft: 8, fontSize: 10, fontWeight: 600,
                          color: T.muted, letterSpacing: '0.06em',
                        }}>
                          ALWAYS ON
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif", fontSize: 11.5,
                      color: T.muted, lineHeight: 1.4,
                    }}>
                      {cat.desc}
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={() => {
                      if (cat.locked) return;
                      setPrefs(p => ({ ...p, [cat.key]: !p[cat.key] }));
                    }}
                    disabled={cat.locked}
                    style={{
                      position: 'relative',
                      width: 42, height: 24, flexShrink: 0,
                      borderRadius: 12,
                      border: 'none',
                      cursor: cat.locked ? 'not-allowed' : 'pointer',
                      background: (cat.locked || prefs[cat.key])
                        ? T.accent
                        : T.mode === 'dark' ? '#333' : '#ccc',
                      transition: 'background 0.2s',
                      padding: 0,
                      opacity: cat.locked ? 0.6 : 1,
                    }}
                    aria-label={`Toggle ${cat.label}`}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: (cat.locked || prefs[cat.key]) ? 21 : 3,
                      width: 18, height: 18,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={savePreferences}
                style={{
                  background: T.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '11px 22px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                style={{
                  background: 'transparent',
                  color: T.text,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 10,
                  padding: '11px 22px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                Accept All
              </button>
              <button
                onClick={rejectNonEssential}
                style={{
                  background: 'transparent',
                  color: T.muted,
                  border: 'none',
                  borderRadius: 10,
                  padding: '11px 12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                }}
              >
                Reject All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Helper to read saved cookie preferences (use from other components) */
export function getCookiePrefs(): CookiePrefs {
  return getSavedPrefs() || DEFAULT_PREFS;
}
