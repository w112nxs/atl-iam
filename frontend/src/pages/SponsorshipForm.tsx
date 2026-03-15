import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { api } from '../api/client';
import type { User, Tier } from '../types';

interface SponsorshipFormProps {
  user: User;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export function SponsorshipForm({ user, onToast }: SponsorshipFormProps) {
  const { T } = useTheme();
  const [tier, setTier] = useState<Tier>('Gold');
  const [company, setCompany] = useState(user.company);
  const [email, setEmail] = useState(user.email);
  const [notes, setNotes] = useState('');

  const tierColors: Record<Tier, string> = { Gold: T.gold, Silver: T.subtle, Community: T.accent };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.inputBg,
    color: T.text,
    fontFamily: "'Poppins', sans-serif",
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
        tier,
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
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 700,
        fontSize: 32,
        color: T.text,
        margin: '0 0 20px',
        transition: 'color 0.25s',
      }}>
        Become a Sponsor
      </h1>

      <Card>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.15em',
            color: T.muted,
            marginBottom: 8,
            transition: 'color 0.25s',
          }}>
            SPONSORSHIP TIER
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Gold', 'Silver', 'Community'] as Tier[]).map(t => (
              <button
                key={t}
                onClick={() => setTier(t)}
                style={{
                  background: tier === t ? tierColors[t] + '22' : 'transparent',
                  border: `1px solid ${tier === t ? tierColors[t] + '44' : T.border}`,
                  borderRadius: 20,
                  color: tier === t ? tierColors[t] : T.muted,
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  padding: '6px 18px',
                  cursor: 'pointer',
                  transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Company Name</label>
          <input value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Contact Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: T.muted, display: 'block', marginBottom: 4, transition: 'color 0.25s' }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            background: tierColors[tier],
            border: 'none',
            borderRadius: 8,
            color: tier === 'Gold' ? '#000' : '#fff',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '0.06em',
            padding: '12px 32px',
            cursor: 'pointer',
            transition: 'background 0.25s',
          }}
        >
          {submitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
        </button>
      </Card>
    </div>
  );
}
