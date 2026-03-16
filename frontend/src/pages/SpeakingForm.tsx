import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { CompanyAutocomplete } from '../components/ui/CompanyAutocomplete';
import { api } from '../api/client';
import type { User, SpeakingFormData, SpeakingSubmissionSummary, SpeakingSubmissionStatus, ThemeTokens } from '../types';

const STEPS = ['Submitter', 'Speaker', 'Session', 'Consent', 'Review'];

const emptyForm: SpeakingFormData = {
  submitterName: '', submitterEmail: '', submitterPhone: '', submitterCompany: '',
  presenterType: 'enterprise',
  speakerName: '', speakerEmail: '', speakerPhone: '', speakerCompany: '', speakerLinkedinUrl: '',
  coPresenter: '',
  title: '', abstract: '',
  consentNameListed: false, consentLinkedinLinked: false, consentWebsiteListed: false,
};

function prefillFromUser(user: User): Partial<SpeakingFormData> {
  return {
    submitterName: user.name,
    submitterEmail: user.workEmail || user.email,
    submitterPhone: user.phone || '',
    submitterCompany: user.company || '',
  };
}

interface SpeakingFormProps {
  user: User;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export function SpeakingForm({ user, onToast }: SpeakingFormProps) {
  const { T } = useTheme();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SpeakingFormData>({ ...emptyForm, ...prefillFromUser(user) });
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SpeakingSubmissionSummary[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [speakerSameAsSubmitter, setSpeakerSameAsSubmitter] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const set = useCallback((k: keyof SpeakingFormData, v: string | boolean) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  }, []);

  // Load past submissions
  useEffect(() => {
    api.getMySpeakingSubmissions().then(setSubmissions).catch(() => {});
  }, [submitted]);

  // Sync speaker fields when "same as submitter" is checked
  useEffect(() => {
    if (speakerSameAsSubmitter) {
      setForm(prev => ({
        ...prev,
        speakerName: prev.submitterName,
        speakerEmail: prev.submitterEmail,
        speakerPhone: prev.submitterPhone,
        speakerCompany: prev.submitterCompany,
      }));
    }
  }, [speakerSameAsSubmitter, form.submitterName, form.submitterEmail, form.submitterPhone, form.submitterCompany]);

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.submitterName.trim()) errs.submitterName = 'Required';
      if (!form.submitterEmail.trim()) errs.submitterEmail = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitterEmail)) errs.submitterEmail = 'Invalid email';
      if (!form.submitterPhone.trim()) errs.submitterPhone = 'Required';
      if (!form.submitterCompany.trim()) errs.submitterCompany = 'Required';
    } else if (s === 2) {
      if (!form.speakerName.trim()) errs.speakerName = 'Required';
      if (!form.speakerEmail.trim()) errs.speakerEmail = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.speakerEmail)) errs.speakerEmail = 'Invalid email';
      if (!form.speakerPhone.trim()) errs.speakerPhone = 'Required';
      if (form.presenterType === 'copresenter' && !form.coPresenter.trim()) errs.coPresenter = 'Required';
    } else if (s === 3) {
      if (!form.title.trim()) errs.title = 'Required';
      if (!form.abstract.trim()) errs.abstract = 'Required';
    } else if (s === 4) {
      if (!form.consentNameListed) errs.consentNameListed = 'Required';
      if (!form.consentLinkedinLinked) errs.consentLinkedinLinked = 'Required';
      if (!form.consentWebsiteListed) errs.consentWebsiteListed = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const payload = { ...form, type: form.presenterType, currentStep: step };
      if (submissionId) {
        await api.updateSpeakingDraft(submissionId, payload);
      } else {
        const res = await api.saveSpeakingDraft(payload);
        setSubmissionId(res.id);
      }
      onToast('Draft saved', 'success');
    } catch {
      onToast('Failed to save draft', 'error');
    }
    setSaving(false);
  };

  const goNext = async () => {
    if (!validateStep(step)) return;
    // Auto-save on step advance
    setSaving(true);
    try {
      const payload = { ...form, type: form.presenterType, currentStep: step + 1 };
      if (submissionId) {
        await api.updateSpeakingDraft(submissionId, payload);
      } else {
        const res = await api.saveSpeakingDraft(payload);
        setSubmissionId(res.id);
      }
    } catch { /* proceed even if auto-save fails */ }
    setSaving(false);
    setStep(step + 1);
  };

  const goBack = () => { setStep(step - 1); setErrors({}); };

  const submitFinal = async () => {
    if (!submissionId) return;
    setSubmitting(true);
    try {
      // Save latest state first
      await api.updateSpeakingDraft(submissionId, { ...form, type: form.presenterType, currentStep: 5 });
      await api.submitSpeakingFinal(submissionId);
      setSubmitted(true);
      setStep(5);
      onToast('Proposal submitted for review!', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      onToast(msg, 'error');
    }
    setSubmitting(false);
  };

  const resumeDraft = async (id: string) => {
    try {
      const data = await api.getSpeakingSubmission(id) as Record<string, unknown>;
      setSubmissionId(id);
      setForm({
        submitterName: (data.submitterName as string) || '',
        submitterEmail: (data.submitterEmail as string) || '',
        submitterPhone: (data.submitterPhone as string) || '',
        submitterCompany: (data.submitterCompany as string) || '',
        presenterType: ((data.presenterType as string) || 'enterprise') as 'enterprise' | 'copresenter',
        speakerName: (data.speakerName as string) || '',
        speakerEmail: (data.speakerEmail as string) || '',
        speakerPhone: (data.speakerPhone as string) || '',
        speakerCompany: (data.speakerCompany as string) || '',
        speakerLinkedinUrl: (data.speakerLinkedinUrl as string) || '',
        coPresenter: (data.coPresenter as string) || '',
        title: (data.title as string) || '',
        abstract: (data.abstract as string) || '',
        consentNameListed: Boolean(data.consentNameListed),
        consentLinkedinLinked: Boolean(data.consentLinkedinLinked),
        consentWebsiteListed: Boolean(data.consentWebsiteListed),
      });
      setSpeakerSameAsSubmitter(false);
      setStep((data.currentStep as number) || 1);
      setSubmitted(false);
      setErrors({});
    } catch {
      onToast('Failed to load draft', 'error');
    }
  };

  const startNew = () => {
    setSubmissionId(null);
    setForm({ ...emptyForm, ...prefillFromUser(user) });
    setSpeakerSameAsSubmitter(true);
    setStep(1);
    setSubmitted(false);
    setErrors({});
  };

  const deleteDraft = async (id: string) => {
    try {
      await api.deleteSpeakingDraft(id);
      setSubmissions(prev => prev.filter(s => s.id !== id));
      if (submissionId === id) startNew();
      onToast('Draft deleted', 'success');
    } catch {
      onToast('Failed to delete draft', 'error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.inputBg, color: T.text,
    fontFamily: "'Inter', sans-serif", fontSize: 14, outline: 'none',
    transition: 'background 0.25s, color 0.25s, border-color 0.25s',
    boxSizing: 'border-box',
  };
  const errorStyle: React.CSSProperties = { ...inputStyle, border: `1px solid ${T.red}` };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted,
    display: 'block', marginBottom: 4,
  };
  const star = <span style={{ color: T.red, marginLeft: 2 }}>*</span>;

  const fieldErr = (k: string) => errors[k] ? (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.red, marginTop: 3 }}>{errors[k]}</div>
  ) : null;

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28,
        color: T.text, margin: '0 0 20px',
      }}>
        Submit a Talk
      </h1>

      {/* Past Submissions */}
      {submissions.length > 0 && !submitted && (
        <div style={{ marginBottom: 20 }}>
          <SectionLabel text="My Submissions" color={T.accent} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {submissions.map(s => (
              <SubmissionRow key={s.id} T={T} submission={s} onResume={s.status === 'draft' || s.status === 'rejected' ? () => resumeDraft(s.id) : undefined} onDelete={s.status === 'draft' ? () => deleteDraft(s.id) : undefined} />
            ))}
          </div>
        </div>
      )}

      {/* Step Indicator */}
      {!submitted && <StepIndicator T={T} steps={STEPS} current={step} onStepClick={(s) => { if (s < step) setStep(s); }} />}

      {submitted ? (
        /* Confirmation */
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.green, margin: '0 0 8px' }}>
            Proposal Submitted
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.muted, margin: '0 0 24px', lineHeight: 1.6 }}>
            Your talk proposal has been submitted for review. You&apos;ll see the status update on this page once an admin reviews it.
          </p>
          <button onClick={startNew} style={{
            background: T.accent, border: 'none', borderRadius: 8, color: '#fff',
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
            padding: '10px 24px', cursor: 'pointer',
          }}>
            SUBMIT ANOTHER TALK
          </button>
        </Card>
      ) : (
        <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: 24, alignItems: 'start', marginTop: 16 }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {step === 1 && (
              <Card>
                <SectionLabel text="Submitter Information" color={T.accent} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, margin: '8px 0 16px', lineHeight: 1.5 }}>
                  Your contact details as the person submitting this proposal.
                </p>
                <Field label="Full Name" required value={form.submitterName} onChange={v => set('submitterName', v)} style={errors.submitterName ? errorStyle : inputStyle} labelStyle={labelStyle} star={star} error={fieldErr('submitterName')} />
                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                  <div>
                    <label style={labelStyle}>Email {star}</label>
                    <input type="email" value={form.submitterEmail} onChange={e => set('submitterEmail', e.target.value)} style={errors.submitterEmail ? errorStyle : inputStyle} />
                    {fieldErr('submitterEmail')}
                  </div>
                  <div>
                    <label style={labelStyle}>Phone {star}</label>
                    <input type="tel" value={form.submitterPhone} onChange={e => set('submitterPhone', e.target.value)} placeholder="+1 (555) 123-4567" style={errors.submitterPhone ? errorStyle : inputStyle} />
                    {fieldErr('submitterPhone')}
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={labelStyle}>Company {star}</label>
                  <CompanyAutocomplete value={form.submitterCompany} onChange={v => set('submitterCompany', v)} style={errors.submitterCompany ? errorStyle : inputStyle} />
                  {fieldErr('submitterCompany')}
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <SectionLabel text="Speaker Information" color={T.purple} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 16px', cursor: 'pointer' }}>
                  <Checkbox T={T} checked={speakerSameAsSubmitter} onChange={setSpeakerSameAsSubmitter} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.text }}>Speaker is the same as submitter</span>
                </label>

                {!speakerSameAsSubmitter && (
                  <>
                    <Field label="Speaker Name" required value={form.speakerName} onChange={v => set('speakerName', v)} style={errors.speakerName ? errorStyle : inputStyle} labelStyle={labelStyle} star={star} error={fieldErr('speakerName')} />
                    <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                      <div>
                        <label style={labelStyle}>Speaker Email {star}</label>
                        <input type="email" value={form.speakerEmail} onChange={e => set('speakerEmail', e.target.value)} style={errors.speakerEmail ? errorStyle : inputStyle} />
                        {fieldErr('speakerEmail')}
                      </div>
                      <div>
                        <label style={labelStyle}>Speaker Phone {star}</label>
                        <input type="tel" value={form.speakerPhone} onChange={e => set('speakerPhone', e.target.value)} style={errors.speakerPhone ? errorStyle : inputStyle} />
                        {fieldErr('speakerPhone')}
                      </div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <label style={labelStyle}>Speaker Company</label>
                      <CompanyAutocomplete value={form.speakerCompany} onChange={v => set('speakerCompany', v)} style={inputStyle} />
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <label style={labelStyle}>LinkedIn Profile URL</label>
                      <input value={form.speakerLinkedinUrl} onChange={e => set('speakerLinkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." style={inputStyle} />
                    </div>
                  </>
                )}

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', color: T.muted, marginBottom: 8 }}>
                    PRESENTER TYPE {star}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {([
                      { val: 'enterprise' as const, label: 'Enterprise Leader' },
                      { val: 'copresenter' as const, label: 'Co-Presenter (Vendor + Enterprise)' },
                    ] as const).map(opt => (
                      <button key={opt.val} onClick={() => set('presenterType', opt.val)} style={{
                        background: form.presenterType === opt.val ? T.accent + '22' : 'transparent',
                        border: `1px solid ${form.presenterType === opt.val ? T.accent + '44' : T.border}`,
                        borderRadius: 6, color: form.presenterType === opt.val ? T.accent : T.muted,
                        fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                        letterSpacing: '0.06em', padding: '8px 16px', cursor: 'pointer',
                      }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.presenterType === 'copresenter' && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ background: T.amberDim, border: `1px solid ${T.amber}44`, borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.amber }}>
                      Vendor representatives cannot present solo. An enterprise co-presenter is required.
                    </div>
                    <label style={labelStyle}>Enterprise Co-Presenter {star}</label>
                    <input value={form.coPresenter} onChange={e => set('coPresenter', e.target.value)} placeholder="Name & company" style={errors.coPresenter ? errorStyle : inputStyle} />
                    {fieldErr('coPresenter')}
                  </div>
                )}
              </Card>
            )}

            {step === 3 && (
              <Card>
                <SectionLabel text="Session Details" color={T.green} />
                <div style={{ marginTop: 12 }}>
                  <Field label="Session Title" required value={form.title} onChange={v => set('title', v)} style={errors.title ? errorStyle : inputStyle} labelStyle={labelStyle} star={star} error={fieldErr('title')} placeholder="e.g. Zero Trust Architecture at Scale" />
                  <div style={{ marginTop: 14 }}>
                    <label style={labelStyle}>Abstract {star}</label>
                    <textarea value={form.abstract} onChange={e => set('abstract', e.target.value)} rows={6} placeholder="Describe your talk — what will attendees learn?" style={{ ...(errors.abstract ? errorStyle : inputStyle), resize: 'vertical' as const }} />
                    {fieldErr('abstract')}
                  </div>
                </div>
              </Card>
            )}

            {step === 4 && (
              <>
                <Card>
                  <SectionLabel text="Consent & Permissions" color={T.gold} />
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <ConsentCheckbox T={T} checked={form.consentNameListed} onChange={v => set('consentNameListed', v)} error={errors.consentNameListed} required
                      label="I consent to having my name and session title listed on the Atlanta IAM website and event materials." />
                    <ConsentCheckbox T={T} checked={form.consentLinkedinLinked} onChange={v => set('consentLinkedinLinked', v)} error={errors.consentLinkedinLinked} required
                      label="I consent to having my LinkedIn profile linked alongside my speaker bio on the website." />
                    <ConsentCheckbox T={T} checked={form.consentWebsiteListed} onChange={v => set('consentWebsiteListed', v)} error={errors.consentWebsiteListed} required
                      label="I consent to my name and talk being tagged and shared on social media and community channels." />
                  </div>
                </Card>

                {/* Review Summary */}
                <Card>
                  <SectionLabel text="Review Your Submission" color={T.accent} />
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <ReviewRow T={T} label="Submitter" value={`${form.submitterName} — ${form.submitterEmail}`} onEdit={() => setStep(1)} />
                    <ReviewRow T={T} label="Speaker" value={`${form.speakerName} — ${form.speakerEmail}`} onEdit={() => setStep(2)} />
                    <ReviewRow T={T} label="Type" value={form.presenterType === 'copresenter' ? `Co-Presenter (with ${form.coPresenter})` : 'Enterprise Leader'} onEdit={() => setStep(2)} />
                    <ReviewRow T={T} label="Title" value={form.title} onEdit={() => setStep(3)} />
                    <ReviewRow T={T} label="Abstract" value={form.abstract.length > 120 ? form.abstract.slice(0, 120) + '...' : form.abstract} onEdit={() => setStep(3)} />
                  </div>
                </Card>
              </>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {step > 1 && (
                <button onClick={goBack} style={{
                  background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8,
                  color: T.muted, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
                  padding: '10px 24px', cursor: 'pointer',
                }}>
                  BACK
                </button>
              )}
              {step < 4 && (
                <button onClick={goNext} style={{
                  background: T.accent, border: 'none', borderRadius: 8, color: '#fff',
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
                  padding: '10px 24px', cursor: 'pointer',
                }}>
                  NEXT
                </button>
              )}
              {step === 4 && (
                <button onClick={() => { if (validateStep(4)) submitFinal(); }} disabled={submitting} style={{
                  background: T.green, border: 'none', borderRadius: 8, color: '#fff',
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
                  padding: '10px 24px', cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}>
                  {submitting ? 'SUBMITTING...' : 'SUBMIT PROPOSAL'}
                </button>
              )}
              <button onClick={saveDraft} disabled={saving} style={{
                background: 'transparent', border: `1px solid ${T.accent}44`, borderRadius: 8,
                color: T.accent, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                padding: '10px 20px', cursor: saving ? 'wait' : 'pointer',
                letterSpacing: '0.04em',
              }}>
                {saving ? 'SAVING...' : 'SAVE DRAFT'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {step === 1 && (
              <Card accent={T.accent}>
                <SidebarTitle T={T}>About You</SidebarTitle>
                <p style={sidebarText(T)}>
                  We pre-fill your contact info from your profile. This is who we contact about logistics and scheduling.
                </p>
              </Card>
            )}
            {step === 2 && (
              <>
                <Card accent={T.purple}>
                  <SidebarTitle T={T}>Speaker vs Submitter</SidebarTitle>
                  <p style={sidebarText(T)}>
                    If you&apos;re submitting on behalf of someone else, uncheck &quot;Speaker is same as submitter&quot; and enter the speaker&apos;s details separately.
                  </p>
                </Card>
                <Card accent={T.accent}>
                  <SidebarTitle T={T}>Presenter Types</SidebarTitle>
                  <ul style={{ ...sidebarText(T), paddingLeft: 16, margin: 0 }}>
                    <li>Enterprise Leaders present solo</li>
                    <li>Co-Presenters pair a vendor with an enterprise practitioner</li>
                    <li>Vendor-only sessions are not accepted</li>
                  </ul>
                </Card>
              </>
            )}
            {step === 3 && (
              <>
                <Card accent={T.green}>
                  <SidebarTitle T={T}>Session Guidelines</SidebarTitle>
                  <ul style={{ ...sidebarText(T), paddingLeft: 16, margin: 0 }}>
                    <li>Sessions are 30-45 minutes</li>
                    <li>Focus on real-world implementation</li>
                    <li>No product demos or sales pitches</li>
                  </ul>
                </Card>
                <Card accent={T.purple}>
                  <SidebarTitle T={T}>Great Talk Topics</SidebarTitle>
                  <ul style={{ ...sidebarText(T), paddingLeft: 16, margin: 0 }}>
                    <li>Production deployment lessons</li>
                    <li>Architecture trade-offs</li>
                    <li>Migration stories</li>
                    <li>Compliance strategies</li>
                  </ul>
                </Card>
              </>
            )}
            {step === 4 && (
              <Card accent={T.gold}>
                <SidebarTitle T={T}>Why We Ask for Consent</SidebarTitle>
                <p style={sidebarText(T)}>
                  We promote speakers across our website, LinkedIn, and event channels. Your consent lets us tag you, link your profile, and share your session with the IAM community.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function StepIndicator({ T, steps, current, onStepClick }: { T: ThemeTokens; steps: string[]; current: number; onStepClick: (s: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8 }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        const color = done ? T.green : active ? T.accent : T.border;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
            <button onClick={() => { if (done) onStepClick(num); }} style={{
              width: 28, height: 28, borderRadius: '50%', border: `2px solid ${color}`,
              background: done ? T.green : active ? T.accent : 'transparent',
              color: done || active ? '#fff' : T.muted,
              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: done ? 'pointer' : 'default', flexShrink: 0,
              transition: 'all 0.2s',
            }}>
              {done ? '\u2713' : num}
            </button>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
              color: active ? T.text : T.muted, marginLeft: 6, whiteSpace: 'nowrap',
              display: i < steps.length - 1 ? undefined : undefined,
            }}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? T.green : T.border, margin: '0 10px', transition: 'background 0.2s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubmissionRow({ T, submission: s, onResume, onDelete }: { T: ThemeTokens; submission: SpeakingSubmissionSummary; onResume?: () => void; onDelete?: () => void }) {
  const statusColors: Record<SpeakingSubmissionStatus, string> = { draft: T.muted, pending: T.amber, approved: T.green, rejected: T.red };
  return (
    <Card style={{ padding: '10px 14px', borderLeft: `3px solid ${statusColors[s.status as SpeakingSubmissionStatus] || T.muted}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.title || 'Untitled Draft'}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted, marginTop: 2 }}>
            {s.speakerName ? `Speaker: ${s.speakerName} · ` : ''}{s.updatedAt ? new Date(s.updatedAt + 'Z').toLocaleDateString() : ''}
          </div>
          {s.adminComment && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.amber, marginTop: 4, fontStyle: 'italic' }}>
              Admin: {s.adminComment}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Pill label={s.status} color={statusColors[s.status as SpeakingSubmissionStatus] || T.muted} size={9} />
          {onResume && (
            <button onClick={onResume} style={{
              background: 'transparent', border: `1px solid ${T.accent}44`, borderRadius: 5,
              color: T.accent, fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
              padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.06em',
            }}>
              {s.status === 'rejected' ? 'EDIT & RESUBMIT' : 'RESUME'}
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this draft?')) onDelete(); }} style={{
              background: 'transparent', border: `1px solid ${T.red}44`, borderRadius: 5,
              color: T.red, fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
              padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.06em',
            }}>
              DELETE
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ReviewRow({ T, label, value, onEdit }: { T: ThemeTokens; label: string; value: string; onEdit: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.text, marginTop: 2, wordBreak: 'break-word' }}>{value || '—'}</div>
      </div>
      <button onClick={onEdit} style={{
        background: 'transparent', border: 'none', color: T.accent,
        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
        cursor: 'pointer', flexShrink: 0, padding: '2px 6px',
      }}>
        EDIT
      </button>
    </div>
  );
}

function Field({ label, required, value, onChange, style, labelStyle, star, error, placeholder }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
  style: React.CSSProperties; labelStyle: React.CSSProperties; star: React.ReactNode; error: React.ReactNode; placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label} {required && star}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
      {error}
    </div>
  );
}

function Checkbox({ T, checked, onChange }: { T: ThemeTokens; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
      border: `2px solid ${checked ? T.green : T.border}`,
      background: checked ? T.green : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}

function ConsentCheckbox({ T, checked, onChange, label, required, error }: {
  T: ThemeTokens; checked: boolean; onChange: (v: boolean) => void; label: string; required?: boolean; error?: string;
}) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <Checkbox T={T} checked={checked} onChange={onChange} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: T.text, lineHeight: 1.5 }}>
          {label}{required && <span style={{ color: T.red, marginLeft: 2 }}>*</span>}
        </span>
      </label>
      {error && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.red, marginTop: 3, marginLeft: 28 }}>{error}</div>}
    </div>
  );
}

function SidebarTitle({ T, children }: { T: ThemeTokens; children: React.ReactNode }) {
  return <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 8 }}>{children}</div>;
}

function sidebarText(T: ThemeTokens): React.CSSProperties {
  return { margin: 0, fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.subtle, lineHeight: 1.8 };
}
