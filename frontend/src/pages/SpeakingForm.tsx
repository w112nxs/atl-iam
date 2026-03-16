import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { CompanyAutocomplete } from '../components/ui/CompanyAutocomplete';
import { SectionLabel } from '../components/ui/SectionLabel';
import { api } from '../api/client';
import type { User } from '../types';

interface SpeakingFormProps {
  user: User;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export function SpeakingForm({ user, onToast }: SpeakingFormProps) {
  const { T } = useTheme();
  const [type, setType] = useState<'enterprise' | 'copresenter'>('enterprise');
  const [company, setCompany] = useState(user.company);
  const [email, setEmail] = useState(user.workEmail || user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || '');
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [coPresenter, setCoPresenter] = useState('');

  const [consentNameListed, setConsentNameListed] = useState(false);
  const [consentLinkedinLinked, setConsentLinkedinLinked] = useState(false);
  const [consentWebsiteListed, setConsentWebsiteListed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.inputBg,
    color: T.text,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    outline: 'none',
    transition: 'background 0.25s, color 0.25s, border-color 0.25s',
    boxSizing: 'border-box' as const,
  };

  const errorInputStyle = { ...inputStyle, border: `1px solid ${T.red}` };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted,
    display: 'block', marginBottom: 4, transition: 'color 0.25s',
  };

  const requiredStar = <span style={{ color: T.red, marginLeft: 2 }}>*</span>;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Session title is required';
    if (!abstract.trim()) errs.abstract = 'Abstract is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email address';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    else if (!/\d{7,}/.test(phone.replace(/[\s\-().+]/g, ''))) errs.phone = 'Enter a valid phone number';
    if (!company.trim()) errs.company = 'Company is required';
    if (type === 'copresenter' && !coPresenter.trim()) errs.coPresenter = 'Co-presenter is required';
    if (!consentNameListed) errs.consentNameListed = 'You must consent to have your name listed';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      onToast('Please fix the highlighted fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitSpeaking({
        title: title.trim(),
        abstract: abstract.trim(),
        company: company.trim(),
        type,
        coPresenter: type === 'copresenter' ? coPresenter.trim() : undefined,
        email: email.trim(),
        phone: phone.trim(),
        linkedinUrl: linkedinUrl.trim(),
        consentNameListed,
        consentLinkedinLinked,
        consentWebsiteListed,
      });
      onToast('Speaking submission received!', 'success');
      setTitle('');
      setAbstract('');
      setCoPresenter('');
      setConsentNameListed(false);
      setConsentLinkedinLinked(false);
      setConsentWebsiteListed(false);
      setErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      onToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (key: string) => errors[key] ? (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.red, marginTop: 3 }}>
      {errors[key]}
    </div>
  ) : null;

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        fontSize: 28,
        color: T.text,
        margin: '0 0 20px',
        transition: 'color 0.25s',
      }}>
        Submit a Talk
      </h1>

      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Presenter Info */}
          <Card>
            <SectionLabel text="Presenter Info" color={T.accent} />
            <div style={{ marginTop: 12 }}>
              {/* Role selector */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.15em', color: T.muted, marginBottom: 8,
                }}>
                  PRESENTER TYPE {requiredStar}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { val: 'enterprise' as const, label: 'Enterprise Leader' },
                    { val: 'copresenter' as const, label: 'Co-Presenter (Vendor + Enterprise)' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setType(opt.val)}
                      style={{
                        background: type === opt.val ? T.accent + '22' : 'transparent',
                        border: `1px solid ${type === opt.val ? T.accent + '44' : T.border}`,
                        borderRadius: 6,
                        color: type === opt.val ? T.accent : T.muted,
                        fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                        letterSpacing: '0.06em', padding: '8px 16px', cursor: 'pointer',
                        transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Name {requiredStar}</label>
                <input value={user.name} readOnly style={{ ...inputStyle, opacity: 0.6 }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Company {requiredStar}</label>
                <CompanyAutocomplete value={company} onChange={setCompany} style={errors.company ? errorInputStyle : inputStyle} />
                {fieldError('company')}
              </div>

              <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Email {requiredStar}</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="work@company.com" style={errors.email ? errorInputStyle : inputStyle} />
                  {fieldError('email')}
                </div>
                <div>
                  <label style={labelStyle}>Phone {requiredStar}</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+1 (555) 123-4567" style={errors.phone ? errorInputStyle : inputStyle} />
                  {fieldError('phone')}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={labelStyle}>LinkedIn Profile URL</label>
                <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" style={inputStyle} />
              </div>

              {type === 'copresenter' && (
                <div style={{ marginTop: 14 }}>
                  <div style={{
                    background: T.amberDim, border: `1px solid ${T.amber}44`, borderRadius: 8,
                    padding: '10px 14px', marginBottom: 14,
                    fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.amber,
                  }}>
                    Vendor representatives cannot present solo. An enterprise co-presenter is required.
                  </div>
                  <label style={labelStyle}>Enterprise Co-Presenter {requiredStar}</label>
                  <input value={coPresenter} onChange={e => setCoPresenter(e.target.value)} placeholder="Name & company" style={errors.coPresenter ? errorInputStyle : inputStyle} />
                  {fieldError('coPresenter')}
                </div>
              )}
            </div>
          </Card>

          {/* Session Details */}
          <Card>
            <SectionLabel text="Session Details" color={T.purple} />
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Session Title {requiredStar}</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Zero Trust Architecture at Scale" style={errors.title ? errorInputStyle : inputStyle} />
                {fieldError('title')}
              </div>
              <div>
                <label style={labelStyle}>Abstract {requiredStar}</label>
                <textarea value={abstract} onChange={e => setAbstract(e.target.value)} rows={5} placeholder="Describe your talk — what will attendees learn?" style={errors.abstract ? { ...errorInputStyle, resize: 'vertical' as const } : { ...inputStyle, resize: 'vertical' as const }} />
                {fieldError('abstract')}
              </div>
            </div>
          </Card>

          {/* Consent */}
          <Card>
            <SectionLabel text="Consent & Permissions" color={T.green} />
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ConsentCheckbox
                T={T}
                checked={consentNameListed}
                onChange={setConsentNameListed}
                required
                error={errors.consentNameListed}
                label="I consent to having my name and session title listed on the Atlanta IAM website and event materials."
              />
              <ConsentCheckbox
                T={T}
                checked={consentLinkedinLinked}
                onChange={setConsentLinkedinLinked}
                label="I consent to having my LinkedIn profile linked alongside my speaker bio on the website."
              />
              <ConsentCheckbox
                T={T}
                checked={consentWebsiteListed}
                onChange={setConsentWebsiteListed}
                label="I consent to my name and talk being tagged and shared on social media and community channels."
              />
            </div>
          </Card>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: T.accent,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.06em',
              padding: '14px 32px',
              cursor: submitting ? 'wait' : 'pointer',
              transition: 'background 0.25s',
              opacity: submitting ? 0.7 : 1,
              alignSelf: 'flex-start',
            }}
          >
            {submitting ? 'SUBMITTING...' : 'SUBMIT PROPOSAL'}
          </button>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card accent={T.accent}>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16,
              color: T.text, marginBottom: 8, transition: 'color 0.25s',
            }}>
              Submission Guidelines
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.subtle, lineHeight: 1.8 }}>
              <li>Sessions are typically 30-45 minutes</li>
              <li>Enterprise practitioners present solo or with a vendor co-presenter</li>
              <li>Vendor-only presentations are not accepted</li>
              <li>Focus on real-world implementation, not product demos</li>
            </ul>
          </Card>
          <Card accent={T.purple}>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16,
              color: T.text, marginBottom: 8, transition: 'color 0.25s',
            }}>
              What Makes a Great Talk
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.subtle, lineHeight: 1.8 }}>
              <li>Lessons learned from production deployments</li>
              <li>Architecture decisions and trade-offs</li>
              <li>Migration stories and integration challenges</li>
              <li>Compliance and governance strategies</li>
            </ul>
          </Card>
          <Card accent={T.green}>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16,
              color: T.text, marginBottom: 8, transition: 'color 0.25s',
            }}>
              Why We Ask for Consent
            </div>
            <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.subtle, lineHeight: 1.8 }}>
              We promote speakers across our website, LinkedIn, and event channels.
              Your consent lets us tag you, link your profile, and share your session
              with the IAM community. You can update your preferences at any time.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ConsentCheckbox({ T, checked, onChange, label, required, error }: {
  T: import('../types').ThemeTokens;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
      }}>
        <div
          onClick={() => onChange(!checked)}
          style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
            border: `2px solid ${error ? T.red : checked ? T.green : T.border}`,
            background: checked ? T.green : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', cursor: 'pointer',
          }}
        >
          {checked && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: T.text,
          lineHeight: 1.5, transition: 'color 0.25s',
        }}>
          {label}
          {required && <span style={{ color: T.red, marginLeft: 2 }}>*</span>}
        </span>
      </label>
      {error && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.red, marginTop: 3, marginLeft: 28 }}>
          {error}
        </div>
      )}
    </div>
  );
}
