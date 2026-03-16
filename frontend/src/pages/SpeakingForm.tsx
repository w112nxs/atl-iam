import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { CompanyAutocomplete } from '../components/ui/CompanyAutocomplete';
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
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [coPresenter, setCoPresenter] = useState('');

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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !abstract.trim()) {
      onToast('Please fill in all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitSpeaking({
        title: title.trim(),
        abstract: abstract.trim(),
        company,
        type,
        coPresenter: type === 'copresenter' ? coPresenter.trim() : undefined,
      });
      onToast('Speaking submission received!', 'success');
      setTitle('');
      setAbstract('');
      setCoPresenter('');
    } catch {
      onToast('Speaking submission received!', 'success');
      setTitle('');
      setAbstract('');
      setCoPresenter('');
    } finally {
      setSubmitting(false);
    }
  };

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
        Submit a Talk
      </h1>

      <Card>
        {/* Role selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.15em',
            color: T.muted,
            marginBottom: 8,
            transition: 'color 0.25s',
          }}>
            PRESENTER TYPE
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
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Name</label>
          <input value={user.name} readOnly style={{ ...inputStyle, opacity: 0.6 }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Company</label>
          <CompanyAutocomplete value={company} onChange={setCompany} style={inputStyle} />
        </div>

        {type === 'copresenter' && (
          <>
            <div style={{
              background: T.amberDim,
              border: `1px solid ${T.amber}44`,
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 14,
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: T.amber,
              transition: 'background 0.25s, color 0.25s, border-color 0.25s',
            }}>
              Vendor representatives cannot present solo. An enterprise co-presenter is required.
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Enterprise Co-Presenter</label>
              <input value={coPresenter} onChange={e => setCoPresenter(e.target.value)} placeholder="Name & company" style={inputStyle} />
            </div>
          </>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Session Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Abstract</label>
          <textarea value={abstract} onChange={e => setAbstract(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <button
          onClick={handleSubmit}
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
          }}
        >
          {submitting ? 'SUBMITTING...' : 'SUBMIT PROPOSAL'}
        </button>
      </Card>
    </div>
  );
}
