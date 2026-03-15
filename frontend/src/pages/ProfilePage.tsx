import { useState } from 'react';
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
}

export function ProfilePage({ user, onNavigate }: ProfilePageProps) {
  const { T, isDark, isAuto, resetToSystem } = useTheme();
  const [passkeyStatus, setPasskeyStatus] = useState<'idle' | 'registering' | 'done' | 'error'>('idle');

  const registerPasskey = async () => {
    setPasskeyStatus('registering');
    try {
      const { startRegistration } = await import('@simplewebauthn/browser');
      const options = await api.passkeyRegisterOptions();
      const credential = await startRegistration({ optionsJSON: options });
      const result = await api.passkeyRegisterVerify(credential);
      setPasskeyStatus(result.verified ? 'done' : 'error');
    } catch {
      setPasskeyStatus('error');
    }
  };
  const roleColor = user.role === 'admin' ? T.red : user.role === 'sponsor' ? T.gold : T.accent;

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: "'Poppins', sans-serif",
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
                  fontFamily: "'Poppins', sans-serif",
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
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: T.muted, transition: 'color 0.25s' }}>{row.label}</span>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: T.text, transition: 'color 0.25s' }}>{row.value}</span>
                </div>
              ))}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: `1px solid ${T.border}`,
                transition: 'border-color 0.25s',
              }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: T.muted, transition: 'color 0.25s' }}>Terms Accepted</span>
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
              fontFamily: "'Poppins', sans-serif",
              fontSize: 13,
              color: T.text,
              marginBottom: 3,
              transition: 'color 0.25s',
            }}>
              {isDark ? 'Dark mode active' : 'Light mode active'}
            </div>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
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
                    fontFamily: "'Poppins', sans-serif",
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
              fontFamily: "'Poppins', sans-serif",
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
                fontFamily: "'Poppins', sans-serif",
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
                  fontFamily: "'Poppins', sans-serif",
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
                  fontFamily: "'Poppins', sans-serif",
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
