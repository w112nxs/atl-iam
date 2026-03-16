import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';
import { CompanyAutocomplete } from '../ui/CompanyAutocomplete';
import type { User } from '../../types';

interface OnboardingModalProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  onDecline: () => void;
}

const termsSections = [
  { title: '1. Who We Are', body: 'The Atlanta IAM User Group is a practitioner-first, vendor-neutral community dedicated to advancing Identity & Access Management knowledge in the Atlanta metropolitan area. We host regular forums, workshops, and networking events for IAM professionals.' },
  { title: '2. Community Rules', body: 'All presentations must be enterprise-led. Vendor representatives may co-present only alongside an enterprise practitioner. Sponsored content is clearly labeled and separated from community-driven sessions.' },
  { title: '3. Data We Collect', body: 'We collect your name, email address, company affiliation, professional title, and relevant certifications upon registration. Event attendance and session participation data is recorded for CPE tracking purposes.' },
  { title: '4. How We Use Your Data', body: 'Your data is used to manage event logistics, issue CPE certificates, communicate about upcoming events, and improve our programming. We analyze aggregate attendance patterns to better serve the community.' },
  { title: '5. Sponsor Data Sharing (Optional)', body: 'Event sponsors may receive access to attendee data based on their sponsorship tier. You may opt in or out of sponsor data sharing at any time. Opted-out attendees are never visible to sponsors under any circumstance.' },
  { title: '6. Your Rights', body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting privacy@atlantaiam.com. You may withdraw consent for sponsor data sharing at any time without affecting your membership status.' },
  { title: '7. Limitation of Liability', body: 'The Atlanta IAM User Group provides this platform and events on an "as is" basis. We are not liable for any indirect, incidental, or consequential damages arising from use of this platform or attendance at events.' },
  { title: '8. Governing Law', body: 'These terms are governed by the laws of the State of Georgia. Any disputes shall be resolved in the courts of Fulton County, Georgia.' },
];

export function OnboardingModal({ user, onComplete, onDecline }: OnboardingModalProps) {
  const { T } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Profile
  const [firstName, setFirstName] = useState(user.firstName || user.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user.lastName || user.name?.split(' ').slice(1).join(' ') || '');
  const [email] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [company, setCompany] = useState(user.company || '');
  const [userType, setUserType] = useState<'enterprise' | 'vendor' | ''>(user.userType || '');
  const [workEmail, setWorkEmail] = useState(user.workEmail || '');

  // Step 2: Terms & Consent
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [conductAccepted, setConductAccepted] = useState(false);
  const [consentEmail, setConsentEmail] = useState(false);
  const [consentText, setConsentText] = useState(false);
  const [consentDataSharing, setConsentDataSharing] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  // Step 3: Connect providers
  const [providers, setProviders] = useState<{ provider: string; connectedAt: string }[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || '');

  useEffect(() => {
    if (step === 3) {
      api.getProviders().then(setProviders).catch(() => {});
    }
  }, [step]);

  const handleTermsScroll = useCallback(() => {
    const el = termsRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      setTermsScrolled(true);
    }
  }, []);

  const canProceedStep1 = firstName.trim() && lastName.trim() && userType && (userType !== 'vendor' || workEmail.trim());
  const canProceedStep2 = termsScrolled && termsAccepted && conductAccepted;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const result = await api.completeOnboarding({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        userType: userType as 'enterprise' | 'vendor',
        workEmail: workEmail.trim(),
        company: company.trim(),
        consentEmail,
        consentText,
        consentDataSharing,
        linkedinUrl: linkedinUrl.trim(),
        termsAccepted: true,
      });
      onComplete(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '10px 12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: T.text,
    outline: 'none',
    transition: 'border-color 0.25s, background 0.25s, color 0.25s',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    fontWeight: 700 as const,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: T.muted,
    marginBottom: 4,
    display: 'block',
    transition: 'color 0.25s',
  };

  const stepIndicator = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
      {[1, 2, 3].map(s => (
        <div key={s} style={{
          width: s === step ? 28 : 8,
          height: 8,
          borderRadius: 4,
          background: s === step ? T.accent : s < step ? T.green : T.border,
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  );

  const stepLabels = ['Profile', 'Terms & Consent', 'Connect Accounts'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 160,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
        width: 520, maxWidth: '92vw', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        transition: 'background 0.25s, border-color 0.25s',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20,
            color: T.text, margin: 0, transition: 'color 0.25s',
          }}>
            Welcome to Atlanta IAM
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted,
            margin: '6px 0 0', transition: 'color 0.25s',
          }}>
            Step {step} of 3 — {stepLabels[step - 1]}
          </p>
          {stepIndicator}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {error && (
            <div style={{
              background: T.redDim, border: `1px solid ${T.red}44`, borderRadius: 8,
              padding: '8px 12px', marginBottom: 16,
              fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.red,
            }}>
              {error}
            </div>
          )}

          {/* ── Step 1: Profile ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={email} disabled />
              </div>

              <div>
                <label style={labelStyle}>Phone (optional)</label>
                <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" type="tel" />
              </div>

              <div>
                <label style={labelStyle}>Company / Organization</label>
                <CompanyAutocomplete style={inputStyle} value={company} onChange={setCompany} placeholder="Start typing your company name..." />
              </div>

              <div>
                <label style={labelStyle}>I am an... *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['enterprise', 'vendor'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setUserType(t)}
                      style={{
                        flex: 1, padding: '12px 16px',
                        background: userType === t ? (t === 'enterprise' ? T.accentDim : T.goldDim) : 'transparent',
                        border: `1px solid ${userType === t ? (t === 'enterprise' ? T.accent : T.gold) : T.border}`,
                        borderRadius: 10, cursor: 'pointer',
                        transition: 'all 0.25s',
                      }}
                    >
                      <div style={{
                        fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
                        color: userType === t ? T.text : T.muted,
                        transition: 'color 0.25s',
                      }}>
                        {t === 'enterprise' ? 'Enterprise Practitioner' : 'Vendor / Solution Provider'}
                      </div>
                      <div style={{
                        fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted,
                        marginTop: 2, transition: 'color 0.25s',
                      }}>
                        {t === 'enterprise' ? 'IAM professional at an end-user org' : 'Represent an IAM product or service'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {userType === 'vendor' && (
                <div>
                  <label style={labelStyle}>Work Email *</label>
                  <input style={inputStyle} value={workEmail} onChange={e => setWorkEmail(e.target.value)} placeholder="you@company.com" type="email" />
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted, marginTop: 4,
                  }}>
                    Required for vendor verification
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Terms & Consent ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Terms */}
              <div
                ref={termsRef}
                onScroll={handleTermsScroll}
                style={{
                  maxHeight: 220, overflowY: 'auto',
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: 16,
                  transition: 'background 0.25s, border-color 0.25s',
                }}
              >
                {termsSections.map(s => (
                  <div key={s.title} style={{ marginBottom: 14 }}>
                    <h4 style={{
                      fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
                      color: T.accent, margin: '0 0 4px', transition: 'color 0.25s',
                    }}>
                      {s.title}
                    </h4>
                    <p style={{
                      fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.subtle,
                      lineHeight: 1.6, margin: 0, transition: 'color 0.25s',
                    }}>
                      {s.body}
                    </p>
                  </div>
                ))}
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted,
                  fontStyle: 'italic',
                }}>
                  Full legal docs at atlantaiam.com/legal
                </p>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <CheckboxRow
                  T={T}
                  checked={termsAccepted}
                  onChange={setTermsAccepted}
                  disabled={!termsScrolled}
                  label="I have read and agree to the Terms of Service and Privacy Policy of the Atlanta IAM User Group."
                />
                <CheckboxRow
                  T={T}
                  checked={conductAccepted}
                  onChange={setConductAccepted}
                  disabled={!termsScrolled}
                  label="I agree to comply with the Atlanta IAM Community Code of Conduct and uphold vendor-neutral principles."
                />

                <div style={{
                  borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 4,
                  transition: 'border-color 0.25s',
                }}>
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11,
                    letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted,
                    marginBottom: 10, transition: 'color 0.25s',
                  }}>
                    Communication Preferences
                  </div>
                  <CheckboxRow
                    T={T}
                    checked={consentEmail}
                    onChange={setConsentEmail}
                    label="I consent to receiving event updates and community news via email."
                  />
                  <div style={{ height: 6 }} />
                  <CheckboxRow
                    T={T}
                    checked={consentText}
                    onChange={setConsentText}
                    label="I consent to receiving event reminders via text message. (optional)"
                  />
                </div>

                <div style={{
                  borderTop: `1px solid ${T.border}`, paddingTop: 12,
                  transition: 'border-color 0.25s',
                }}>
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11,
                    letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted,
                    marginBottom: 10, transition: 'color 0.25s',
                  }}>
                    Data Sharing
                  </div>
                  <CheckboxRow
                    T={T}
                    checked={consentDataSharing}
                    onChange={setConsentDataSharing}
                    label="I consent to sharing my name, company, and title with other Atlanta IAM members for professional networking purposes."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Connect Accounts ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>LinkedIn Profile URL</label>
                <input
                  style={inputStyle}
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted,
                  marginBottom: 10, transition: 'color 0.25s',
                }}>
                  Connected Identity Providers
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(['google', 'github', 'linkedin'] as const).map(p => {
                    const connected = providers.some(pr => pr.provider === p);
                    return (
                      <div key={p} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: connected ? T.greenDim : 'transparent',
                        border: `1px solid ${connected ? T.green + '44' : T.border}`,
                        borderRadius: 10,
                        transition: 'all 0.25s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ProviderIcon provider={p} />
                          <span style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
                            color: T.text, textTransform: 'capitalize', transition: 'color 0.25s',
                          }}>
                            {p}
                          </span>
                        </div>
                        {connected ? (
                          <span style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
                            color: T.green, letterSpacing: '0.06em',
                          }}>
                            CONNECTED
                          </span>
                        ) : (
                          <button
                            onClick={() => { window.location.href = api.getOAuthUrl(p); }}
                            style={{
                              background: 'transparent',
                              border: `1px solid ${T.accent}66`,
                              borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
                              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
                              color: T.accent, letterSpacing: '0.06em',
                              transition: 'all 0.25s',
                            }}
                          >
                            CONNECT
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{
                background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
                padding: 14, transition: 'all 0.25s',
              }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted,
                  lineHeight: 1.6, transition: 'color 0.25s',
                }}>
                  Connecting additional identity providers lets you sign in with any of them.
                  Your accounts are linked by email address.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: '16px 24px 24px',
          borderTop: `1px solid ${T.border}`,
          display: 'flex', gap: 12,
          transition: 'border-color 0.25s',
        }}>
          {step === 1 ? (
            <button
              onClick={onDecline}
              style={{
                flex: 1, background: 'transparent', border: `1px solid ${T.border}`,
                borderRadius: 8, color: T.muted,
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                letterSpacing: '0.08em', padding: '12px 0', cursor: 'pointer',
                transition: 'color 0.25s, border-color 0.25s',
              }}
            >
              SIGN OUT
            </button>
          ) : (
            <button
              onClick={() => setStep((step - 1) as 1 | 2)}
              style={{
                flex: 1, background: 'transparent', border: `1px solid ${T.border}`,
                borderRadius: 8, color: T.muted,
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                letterSpacing: '0.08em', padding: '12px 0', cursor: 'pointer',
                transition: 'color 0.25s, border-color 0.25s',
              }}
            >
              BACK
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 2 | 3)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              style={{
                flex: 2,
                background: (step === 1 ? canProceedStep1 : canProceedStep2) ? T.accent : T.border,
                border: 'none', borderRadius: 8,
                color: (step === 1 ? canProceedStep1 : canProceedStep2) ? '#fff' : T.muted,
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                letterSpacing: '0.08em', padding: '12px 0',
                cursor: (step === 1 ? canProceedStep1 : canProceedStep2) ? 'pointer' : 'not-allowed',
                boxShadow: (step === 1 ? canProceedStep1 : canProceedStep2) ? `0 0 20px ${T.accent}44` : 'none',
                transition: 'all 0.25s',
              }}
            >
              CONTINUE
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 2,
                background: T.green, border: 'none', borderRadius: 8, color: '#fff',
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                letterSpacing: '0.08em', padding: '12px 0',
                cursor: submitting ? 'wait' : 'pointer',
                boxShadow: `0 0 20px ${T.green}44`,
                transition: 'all 0.25s',
              }}
            >
              {submitting ? 'SAVING...' : 'COMPLETE SETUP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function CheckboxRow({ T, checked, onChange, label, disabled }: {
  T: import('../../types').ThemeTokens;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto',
      transition: 'opacity 0.3s',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ marginTop: 3, accentColor: T.accent, flexShrink: 0 }}
      />
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.text,
        lineHeight: 1.5, transition: 'color 0.25s',
      }}>
        {label}
      </span>
    </label>
  );
}

function ProviderIcon({ provider }: { provider: 'google' | 'github' | 'linkedin' }) {
  if (provider === 'google') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    );
  }
  if (provider === 'github') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    );
  }
  // linkedin
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
