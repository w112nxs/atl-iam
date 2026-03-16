import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from '../components/ui/Avatar';
import { Pill } from '../components/ui/Pill';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { api } from '../api/client';
import type { User, Session } from '../types';

interface ProfilePageProps {
  user: User;
  onNavigate?: (path: string) => void;
  onUserUpdate?: (user: User) => void;
}

export function ProfilePage({ user, onNavigate, onUserUpdate }: ProfilePageProps) {
  const { T, isDark, isAuto, resetToSystem } = useTheme();
  const [passkeyStatus, setPasskeyStatus] = useState<'idle' | 'registering' | 'done' | 'error'>('idle');
  const [passkeyError, setPasskeyError] = useState('');
  const [passkeys, setPasskeys] = useState<{ credentialId: string; createdAt: string }[]>([]);
  const [passkeysLoading, setPasskeysLoading] = useState(true);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [providers, setProviders] = useState<{ provider: string; connectedAt: string }[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [privacy, setPrivacy] = useState({
    privacyShowEmail: user.privacyShowEmail ?? false,
    privacyShowPhone: user.privacyShowPhone ?? false,
    privacyShowCompany: user.privacyShowCompany ?? true,
    privacyShowTitle: user.privacyShowTitle ?? true,
    privacyShowLinkedin: user.privacyShowLinkedin ?? false,
    privacyShowType: user.privacyShowType ?? true,
    privacyListed: user.privacyListed ?? true,
  });

  useEffect(() => {
    api.getProviders().then(setProviders).catch(() => {});
    api.getSessions().then(s => { setSessions(s); setSessionsLoading(false); }).catch(() => setSessionsLoading(false));
    api.getPasskeys().then(p => { setPasskeys(p); setPasskeysLoading(false); }).catch(() => setPasskeysLoading(false));
  }, []);

  const revokeSession = async (id: string) => {
    await api.revokeSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const revokeOthers = async () => {
    await api.revokeOtherSessions();
    setSessions(prev => prev.filter(s => s.current));
  };

  const savePrivacy = useCallback(async (updates: Partial<typeof privacy>) => {
    const newPrivacy = { ...privacy, ...updates };
    setPrivacy(newPrivacy);
    setPrivacySaving(true);
    try {
      const result = await api.updatePrivacy(newPrivacy);
      onUserUpdate?.(result.user);
    } catch {}
    setPrivacySaving(false);
  }, [privacy, onUserUpdate]);

  const registerPasskey = async () => {
    setPasskeyStatus('registering');
    setPasskeyError('');
    try {
      const { startRegistration } = await import('@simplewebauthn/browser');
      const rawOptions = await api.passkeyRegisterOptions();
      // Extract our custom field before passing to WebAuthn
      const challengeId = (rawOptions as unknown as Record<string, unknown>)._challengeId as string;
      // Remove _challengeId so it doesn't confuse WebAuthn
      delete (rawOptions as unknown as Record<string, unknown>)._challengeId;

      const credential = await startRegistration({ optionsJSON: rawOptions });

      // Send credential with challengeId to server
      const payload = JSON.parse(JSON.stringify(credential));
      payload._challengeId = challengeId;

      const result = await api.passkeyRegisterVerify(payload);
      if (result.verified) {
        setPasskeyStatus('done');
        // Refresh passkey list
        api.getPasskeys().then(setPasskeys).catch(() => {});
      } else {
        setPasskeyStatus('error');
        setPasskeyError('Verification returned false');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('NotAllowedError') || msg.includes('abort')) {
        setPasskeyStatus('idle'); // User cancelled — reset
      } else {
        setPasskeyStatus('error');
        setPasskeyError(msg);
      }
    }
  };

  const roleColor = user.role === 'admin' ? T.red : user.role === 'sponsor' ? T.gold : T.accent;

  const lastLoginFormatted = user.lastLogin
    ? new Date(user.lastLogin + 'Z').toLocaleString()
    : '—';

  const accountRows = [
    { label: 'Name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Company', value: user.company || '—' },
    { label: 'Type', value: user.userType === 'enterprise' ? 'Enterprise' : user.userType === 'vendor' ? 'Vendor' : '—' },
    { label: 'Role', value: user.role },
    { label: 'Last Login', value: lastLoginFormatted },
    { label: 'Profile Updated', value: user.profileUpdatedAt
      ? new Date(user.profileUpdatedAt + 'Z').toLocaleDateString()
      : '—' },
  ];

  const allProviders: { id: 'google' | 'github' | 'linkedin'; label: string; color: string; bg: string }[] = [
    { id: 'google', label: 'Google', color: '#4285F4', bg: '#4285F410' },
    { id: 'github', label: 'GitHub', color: T.text, bg: T.surface },
    { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', bg: '#0A66C210' },
  ];

  return (
    <div style={{ width: '90%', maxWidth: 900, margin: '0 auto', padding: 'clamp(20px, 4vw, 32px) 0' }}>
      {/* Profile Header */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar name={user.name} size={56} role={user.role} />
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 24,
              color: T.text, margin: '0 0 6px', transition: 'color 0.25s',
            }}>
              {user.name}
            </h1>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Pill label={user.role} color={roleColor} size={9} />
              {user.company && <Pill label={user.company} color={T.subtle} size={9} />}
              {user.userType && (
                <Pill label={user.userType} color={user.userType === 'enterprise' ? T.accent : T.gold} size={9} />
              )}
              <Pill
                label={user.termsAccepted ? 'Terms Accepted' : 'Terms Pending'}
                color={user.termsAccepted ? T.green : T.amber}
                size={9}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid-2col" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start', marginTop: 16,
      }}>
        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Account Info */}
          <SectionLabel text="Account Info" color={T.accent} />
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {accountRows.map((row, i) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0',
                  borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  transition: 'border-color 0.25s',
                }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, transition: 'color 0.25s' }}>
                    {row.label}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: T.text, transition: 'color 0.25s' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Identity Providers */}
          <SectionLabel text="Identity Providers" color={T.accent} />
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allProviders.map(p => {
                const connected = providers.some(pr => pr.provider === p.id);
                const connectedAt = providers.find(pr => pr.provider === p.id)?.connectedAt;
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: connected ? T.greenDim : 'transparent',
                    border: `1px solid ${connected ? T.green + '33' : T.border}`,
                    borderRadius: 8, transition: 'all 0.25s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ProviderIcon provider={p.id} color={p.color} />
                      <div>
                        <div style={{
                          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
                          color: T.text, transition: 'color 0.25s',
                        }}>
                          {p.label}
                        </div>
                        {connected && connectedAt && (
                          <div style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted,
                          }}>
                            Connected {new Date(connectedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    {connected ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                        color: T.green, letterSpacing: '0.06em',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        CONNECTED
                      </div>
                    ) : (
                      <button
                        onClick={() => { window.location.href = api.getOAuthUrl(p.id); }}
                        style={{
                          background: 'transparent', border: `1px solid ${T.accent}55`,
                          borderRadius: 6, padding: '5px 14px', cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                          color: T.accent, letterSpacing: '0.06em', transition: 'all 0.25s',
                        }}
                      >
                        CONNECT
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Active Sessions */}
          <SectionLabel text="Active Sessions" color={T.green} />
          <Card>
            {sessionsLoading ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted }}>
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted }}>
                No active sessions found.
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sessions.map(s => (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: s.current ? T.greenDim : 'transparent',
                      border: `1px solid ${s.current ? T.green + '33' : T.border}`,
                      borderRadius: 8, transition: 'all 0.25s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div style={{ fontSize: 18, flexShrink: 0 }}>
                          {s.device === 'Mobile' ? '📱' : s.device === 'Tablet' ? '📱' : '💻'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                            color: T.text, transition: 'color 0.25s',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {s.browser} on {s.os}
                            {s.current && (
                              <span style={{ color: T.green, marginLeft: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
                                THIS DEVICE
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted,
                            transition: 'color 0.25s',
                          }}>
                            {s.ip && `${s.ip} · `}
                            {new Date(s.lastActive + 'Z').toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {!s.current && (
                        <button
                          onClick={() => revokeSession(s.id)}
                          style={{
                            background: 'transparent', border: `1px solid ${T.red}44`,
                            borderRadius: 5, padding: '3px 10px', cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700,
                            color: T.red, letterSpacing: '0.06em', flexShrink: 0,
                            transition: 'all 0.25s',
                          }}
                        >
                          REVOKE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {sessions.filter(s => !s.current).length > 0 && (
                  <button
                    onClick={revokeOthers}
                    style={{
                      width: '100%', marginTop: 10, padding: '8px 0',
                      background: 'transparent', border: `1px solid ${T.red}33`,
                      borderRadius: 6, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                      color: T.red, letterSpacing: '0.06em',
                      transition: 'all 0.25s',
                    }}
                  >
                    REVOKE ALL OTHER SESSIONS
                  </button>
                )}
              </>
            )}
          </Card>

          {/* Passkeys */}
          <SectionLabel text="Passkeys" color={T.accent} />
          <Card>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.text,
              marginBottom: 10, transition: 'color 0.25s',
            }}>
              Passwordless sign-in using Touch ID, Face ID, or Windows Hello.
            </div>

            {/* Registered passkeys list */}
            {passkeysLoading ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, marginBottom: 10 }}>
                Loading...
              </div>
            ) : passkeys.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {passkeys.map((pk, i) => (
                  <div key={pk.credentialId} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: T.greenDim,
                    border: `1px solid ${T.green}33`,
                    borderRadius: 8, transition: 'all 0.25s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/>
                        <circle cx="16.5" cy="7.5" r=".5" fill={T.green}/>
                      </svg>
                      <div>
                        <div style={{
                          fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                          color: T.text, transition: 'color 0.25s',
                        }}>
                          Passkey {passkeys.length > 1 ? i + 1 : ''}
                        </div>
                        <div style={{
                          fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted,
                        }}>
                          Registered {new Date(pk.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await api.deletePasskey(pk.credentialId);
                        setPasskeys(prev => prev.filter(p => p.credentialId !== pk.credentialId));
                      }}
                      style={{
                        background: 'transparent', border: `1px solid ${T.red}44`,
                        borderRadius: 5, padding: '3px 10px', cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700,
                        color: T.red, letterSpacing: '0.06em', flexShrink: 0,
                        transition: 'all 0.25s',
                      }}
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Register new passkey button */}
            <button
              onClick={() => { setPasskeyStatus('idle'); registerPasskey(); }}
              disabled={passkeyStatus === 'registering'}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: passkeyStatus === 'done' ? T.greenDim : 'transparent',
                border: `1px solid ${passkeyStatus === 'done' ? T.green + '44' : passkeyStatus === 'error' ? T.red + '44' : T.border}`,
                borderRadius: 8, color: passkeyStatus === 'done' ? T.green : passkeyStatus === 'error' ? T.red : T.accent,
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11,
                letterSpacing: '0.08em', padding: '10px 18px',
                cursor: passkeyStatus === 'registering' ? 'wait' : 'pointer',
                transition: 'all 0.25s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>
              </svg>
              {passkeyStatus === 'idle' && (passkeys.length > 0 ? 'ADD ANOTHER PASSKEY' : 'REGISTER PASSKEY')}
              {passkeyStatus === 'registering' && 'WAITING FOR BIOMETRIC...'}
              {passkeyStatus === 'done' && 'PASSKEY REGISTERED'}
              {passkeyStatus === 'error' && 'FAILED — TAP TO RETRY'}
            </button>
            {passkeyError && (
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.red,
                marginTop: 8, transition: 'color 0.25s',
              }}>
                {passkeyError}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Data Visibility */}
          <SectionLabel text="Data Visibility" color={T.purple} />
          <Card>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted,
              marginBottom: 12, lineHeight: 1.5, transition: 'color 0.25s',
            }}>
              Control what other members see in the Member Directory.
              {privacySaving && <span style={{ color: T.accent, marginLeft: 6 }}>Saving...</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <PrivacyToggle T={T} label="Listed in Directory" checked={privacy.privacyListed}
                onChange={v => savePrivacy({ privacyListed: v })} />
              <div style={{ height: 1, background: T.border, margin: '2px 0', transition: 'background 0.25s' }} />
              <PrivacyToggle T={T} label="Show Company" checked={true} onChange={() => {}} locked />
              <PrivacyToggle T={T} label="Show Title" checked={true} onChange={() => {}} locked />
              <PrivacyToggle T={T} label="Show User Type" checked={true} onChange={() => {}} locked />
              <PrivacyToggle T={T} label="Show Email" checked={privacy.privacyShowEmail}
                onChange={v => savePrivacy({ privacyShowEmail: v })} disabled={!privacy.privacyListed} />
              <PrivacyToggle T={T} label="Show Phone" checked={privacy.privacyShowPhone}
                onChange={v => savePrivacy({ privacyShowPhone: v })} disabled={!privacy.privacyListed} />
              <PrivacyToggle T={T} label="Show LinkedIn" checked={privacy.privacyShowLinkedin}
                onChange={v => savePrivacy({ privacyShowLinkedin: v })} disabled={!privacy.privacyListed} />
            </div>
          </Card>

          {/* Display Preferences */}
          <SectionLabel text="Display Preferences" color={T.purple} />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
                  color: T.text, transition: 'color 0.25s',
                }}>
                  {isDark ? 'Dark mode' : 'Light mode'}
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted,
                  transition: 'color 0.25s',
                }}>
                  {isAuto ? 'Following system' : 'Manual'}
                </div>
              </div>
              <ThemeToggle />
            </div>
            {!isAuto && (
              <button
                onClick={resetToSystem}
                style={{
                  background: 'transparent', border: `1px solid ${T.border}`,
                  borderRadius: 5, color: T.muted,
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 10,
                  letterSpacing: '0.08em', padding: '5px 12px', cursor: 'pointer',
                  transition: 'color 0.25s, border-color 0.25s',
                }}
              >
                RESET TO SYSTEM
              </button>
            )}
          </Card>

          {/* Quick Actions */}
          <SectionLabel text="Quick Actions" color={T.green} />
          <Card>
            {[
              { label: 'View Events', color: T.accent, path: '/events' },
              { label: 'Member Directory', color: T.accent, path: '/members' },
              { label: 'Submit a Talk', color: T.accent, path: '/submit-speaking' },
              { label: 'Sponsorship Info', color: T.gold, path: '/submit-sponsor' },
            ].map((item, i) => (
              <div
                key={item.label}
                onClick={() => onNavigate?.(item.path)}
                style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13, color: item.color,
                  padding: '7px 0',
                  borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  cursor: 'pointer', transition: 'color 0.25s, border-color 0.25s',
                }}
              >
                {item.label} &rarr;
              </div>
            ))}
          </Card>

          {/* Sponsor Portal (if applicable) */}
          {user.sponsorId && (
            <>
              <SectionLabel text="Sponsor Access" color={T.gold} />
              <Card accent={T.gold}>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.text,
                  marginBottom: 6, transition: 'color 0.25s',
                }}>
                  You have active sponsor portal access.
                </div>
                <div onClick={() => onNavigate?.('/sponsor-portal')} style={{ cursor: 'pointer' }}>
                  <Pill label="View Sponsor Portal" color={T.gold} size={9} />
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function PrivacyToggle({ T, label, checked, onChange, disabled, locked }: {
  T: import('../types').ThemeTokens;
  label: string; checked: boolean;
  onChange: (v: boolean) => void; disabled?: boolean; locked?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '3px 0',
      opacity: disabled ? 0.35 : 1, pointerEvents: (disabled || locked) ? 'none' : 'auto',
      transition: 'opacity 0.25s',
    }}>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.text,
        transition: 'color 0.25s',
      }}>
        {label}
        {locked && (
          <span style={{ fontSize: 10, color: T.muted, marginLeft: 6 }}>Always visible</span>
        )}
      </span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10,
          cursor: locked ? 'default' : 'pointer',
          background: checked ? T.green : T.border,
          opacity: locked ? 0.5 : 1,
          position: 'relative', transition: 'background 0.25s',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2,
          left: checked ? 18 : 2,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

function ProviderIcon({ provider, color }: { provider: string; color: string }) {
  if (provider === 'google') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    );
  }
  if (provider === 'github') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
