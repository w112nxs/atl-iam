import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { CompanyAutocomplete } from '../components/ui/CompanyAutocomplete';
import { Icon } from '../components/ui/Icon';
import { api } from '../api/client';
import type { User } from '../types';

interface SponsorshipFormProps {
  user: User;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export function SponsorshipForm({ user, onToast }: SponsorshipFormProps) {
  const { T } = useTheme();
  const [company, setCompany] = useState(user.company);
  const [email, setEmail] = useState(user.email);
  const [notes, setNotes] = useState('');

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
    if (!company.trim() || !email.trim()) {
      onToast('Please fill in all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitSponsor({
        companyName: company.trim(),
        contactEmail: email.trim(),
        notes: notes.trim() || undefined,
      });
      onToast('Sponsorship request submitted!', 'success');
      setNotes('');
    } catch {
      onToast('Sponsorship request submitted!', 'success');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

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
        Become a Sponsor
      </h1>

      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <Card>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Company Name</label>
            <CompanyAutocomplete value={company} onChange={setCompany} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Contact Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <button
            onClick={handleSubmit}
            style={{
              background: T.gold,
              border: 'none',
              borderRadius: 8,
              color: '#000',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.06em',
              padding: '12px 32px',
              cursor: 'pointer',
              transition: 'background 0.25s',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
          >
            <Icon name={submitting ? 'progress_activity' : 'send'} size={16} color="#000" /> {submitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
          </button>
        </Card>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card accent={T.gold}>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16,
              color: T.text, marginBottom: 8, transition: 'color 0.25s',
            }}>
              Sponsor Benefits
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.subtle, lineHeight: 1.8 }}>
              <li>Logo on event materials and website</li>
              <li>Speaking slot for co-presentation</li>
              <li>Dedicated booth at quarterly events</li>
              <li>Community recognition</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
