import { useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from '../components/ui/Avatar';
import { Pill } from '../components/ui/Pill';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { api } from '../api/client';
import type { User } from '../types';

interface ProfilePageProps {
  user: User;
  onNavigate?: (path: string) => void;
  onUserUpdate?: (user: User) => void;
}

export function ProfilePage({ user, onNavigate, onUserUpdate }: ProfilePageProps) {
  const { T, isDark, isAuto, resetToSystem } = useTheme();
  const [passkeyStatus, setPasskeyStatus] = useState<'idle' | 'registering' | 'done' | 'error'>('idle');
  const [privacySaving, setPrivacySaving] = useState(false);

  const [privacy, setPrivacy] = useState({
    privacyShowEmail: user.privacyShowEmail ?? false,
    privacyShowPhone: user.privacyShowPhone ?? false,
    privacyShowCompany: user.privacyShowCompany ?? true,
    privacyShowTitle: user.privacyShowTitle ?? true,
    privacyShowLinkedin: user.privacyShowLinkedin ?? true,
    privacyShowType: user.privacyShowType ?? true,
    privacyListed: user.privacyListed ?? true,
  });

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
    try {
      const { startRegistration } = await import('@simplewebauthn/browser');
      const options = await api.passkeyRegisterOptions();
      const { _challengeId, ...optionsJSON } = options as typeof options & { _challengeId: string };
      const credential = await startRegistration({ optionsJSON });
      const result = await api.passkeyRegisterVerify({ ...credential, _challengeId });
      setPasskeyStatus(result.verified ? 'done' : 'error');
    } catch {
      setPasskeyStatus('error');
    }
  };
  const roleColor = user.role === 'admin' ? T.red : user.role === 'sponsor' ? T.gold : T.accent;

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        fontSize: 32,
        color: T.text,
        margin: '0 0 20px',
        transition: 'color 0.25s',
      }}>
        My Profile
      </h1>

      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Profile header */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar name={user.name} size={50} role={user.role} />
              <div>
                <h2 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  color: T.text,
                  margin: '0 0 5px',
                  transition: 'color 0.25s',
                }}>
                  {user.name}
                </h2>
                <div style={{ display: 'flex', gap: 5 }}>
                  <Pill label={user.role} color={roleColor} size={9} />
                  <Pill label={user.company} color={T.subtle} size={9} />
                </div>
              </div>
            </div>
          </Card>

          {/* Account info */}
          <SectionLabel text="Account Info" color={T.accent} />
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Email', value: user.email },
                { label: 'Role', value: user.role },
                { label: 'Company', value: user.company },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: i > 0 ? 8 : 0,
                  borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  transition: 'border-color 0.25s',
                }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted, transition: 'color 0.25s' }}>{row.label}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: T.text, transition: 'color 0.25s' }}>{row.value}</span>
                </div>
              ))}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: `1px solid ${T.border}`,
                transition: 'border-color 0.25s',
              }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted, transition: 'color 0.25s' }}>Terms Accepted</span>
                <Pill
                  label={user.termsAccepted ? 'Accepted' : 'Pending'}
                  color={user.termsAccepted ? T.green : T.amber}
                  size={9}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Display Preferences */}
          <SectionLabel text="Display Preferences" color={T.purple} />
          <Card>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: T.text,
              marginBottom: 3,
              transition: 'color 0.25s',
            }}>
              {isDark ? 'Dark mode active' : 'Light mode active'}
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: T.muted,
              marginBottom: 14,
              transition: 'color 0.25s',
            }}>
              {isAuto ? 'Following system preference' : 'Manual override'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <ThemeToggle />
              {!isAuto && (
                <button
                  onClick={resetToSystem}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${T.border}`,
                    borderRadius: 5,
                    color: T.muted,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    padding: '5px 12px',
                    cursor: 'pointer',
                    transition: 'color 0.25s, border-color 0.25s',
                  }}
                >
                  RESET TO SYSTEM DEFAULT
                </button>
              )}
            </div>
          </Card>

          {/* Passkey */}
          <SectionLabel text="Passkey" color={T.accent} />
          <Card>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: T.text,
              marginBottom: 10,
              transition: 'color 0.25s',
            }}>
              Register a passkey for passwordless sign-in
            </div>
            <button
              onClick={registerPasskey}
              disabled={passkeyStatus === 'registering'}
              style={{
                background: passkeyStatus === 'done' ? T.greenDim : 'transparent',
                border: `1px solid ${passkeyStatus === 'done' ? T.green + '44' : T.border}`,
                borderRadius: 6,
                color: passkeyStatus === 'done' ? T.green : T.accent,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.08em',
                padding: '8px 16px',
                cursor: passkeyStatus === 'registering' ? 'wait' : 'pointer',
                transition: 'all 0.25s',
              }}
            >
              {passkeyStatus === 'idle' && 'REGISTER PASSKEY'}
              {passkeyStatus === 'registering' && 'WAITING...'}
              {passkeyStatus === 'done' && 'PASSKEY REGISTERED'}
              {passkeyStatus === 'error' && 'FAILED — TRY AGAIN'}
            </button>
          </Card>

          {/* Privacy / Data Visibility */}
          <SectionLabel text="Data Visibility" color={T.purple} />
          <Card>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted,
              marginBottom: 12, lineHeight: 1.5, transition: 'color 0.25s',
            }}>
              Control what other members can see on your profile in the Member Directory.
              {privacySaving && <span style={{ color: T.accent, marginLeft: 8 }}>Saving...</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PrivacyToggle T={T} label="Listed in Member Directory" checked={privacy.privacyListed}
                onChange={v => savePrivacy({ privacyListed: v })} />
              <PrivacyToggle T={T} label="Show Company" checked={privacy.privacyShowCompany}
                onChange={v => savePrivacy({ privacyShowCompany: v })} disabled={!privacy.privacyListed} />
              <PrivacyToggle T={T} label="Show Title" checked={privacy.privacyShowTitle}
                onChange={v => savePrivacy({ privacyShowTitle: v })} disabled={!privacy.privacyListed} />
              <PrivacyToggle T={T} label="Show User Type" checked={privacy.privacyShowType}
                onChange={v => savePrivacy({ privacyShowType: v })} disabled={!privacy.privacyListed} />
              <PrivacyToggle T={T} label="Show Email" checked={privacy.privacyShowEmail}
                onChange={v => savePrivacy({ privacyShowEmail: v })} disabled={!privacy.privacyListed} />
              <PrivacyToggle T={T} label="Show Phone" checked={privacy.privacyShowPhone}
                onChange={v => savePrivacy({ privacyShowPhone: v })} disabled={!privacy.privacyListed} />
              <PrivacyToggle T={T} label="Show LinkedIn" checked={privacy.privacyShowLinkedin}
                onChange={v => savePrivacy({ privacyShowLinkedin: v })} disabled={!privacy.privacyListed} />
            </div>
          </Card>

          {/* Quick links */}
          <SectionLabel text="Quick Actions" color={T.green} />
          <Card>
            {[
              { label: 'View Events', color: T.accent, path: '/events' },
              { label: 'Submit a Talk', color: T.accent, path: '/submit-speaking' },
              { label: 'Sponsorship Info', color: T.gold, path: '/submit-sponsor' },
              { label: 'Community Rules', color: T.green, path: '/about' },
            ].map((item, i) => (
              <div
                key={item.label}
                onClick={() => onNavigate?.(item.path)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: item.color,
                  padding: '6px 0',
                  borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  cursor: 'pointer',
                  transition: 'color 0.25s, border-color 0.25s',
                }}
              >
                {item.label} &rarr;
              </div>
            ))}
          </Card>

          {/* Sponsor info (if applicable) */}
          {user.sponsorId && (
            <>
              <SectionLabel text="Sponsor Access" color={T.gold} />
              <Card accent={T.gold}>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: T.text,
                  marginBottom: 6,
                  transition: 'color 0.25s',
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

function PrivacyToggle({ T, label, checked, onChange, disabled }: {
  T: import('../types').ThemeTokens;
  label: string; checked: boolean;
  onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 0', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.35 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: 'opacity 0.25s',
    }}>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.text,
        transition: 'color 0.25s',
      }}>
        {label}
      </span>
      <div
        onClick={e => { e.preventDefault(); onChange(!checked); }}
        style={{
          width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
          background: checked ? T.green : T.border,
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
    </label>
  );
}
