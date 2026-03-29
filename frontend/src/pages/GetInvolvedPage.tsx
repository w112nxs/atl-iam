import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Icon } from '../components/ui/Icon';
import { SpeakingForm } from './SpeakingForm';
import { SponsorshipForm } from './SponsorshipForm';
import type { User } from '../types';

interface GetInvolvedPageProps {
  user: User;
  onToast: (msg: string, type: 'success' | 'error') => void;
  initialTab?: 'speak' | 'sponsor';
}

export function GetInvolvedPage({ user, onToast, initialTab = 'speak' }: GetInvolvedPageProps) {
  const { T } = useTheme();
  const [tab, setTab] = useState<'speak' | 'sponsor'>(initialTab);

  const tabs: { id: 'speak' | 'sponsor'; label: string; icon: string; color: string }[] = [
    { id: 'speak', label: 'Submit a Talk', icon: 'mic', color: T.accent },
    { id: 'sponsor', label: 'Sponsor an Event', icon: 'handshake', color: T.gold },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        width: '90%',
        margin: '0 auto',
        padding: '28px 24px 0',
      }}>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          color: T.text,
          margin: '0 0 16px',
          transition: 'color 0.25s',
        }}>
          Get Involved
        </h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          {tabs.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: active ? t.color + '18' : 'transparent',
                  border: `1px solid ${active ? t.color + '44' : T.border}`,
                  borderRadius: 8,
                  color: active ? t.color : T.muted,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon name={t.icon} size={16} color={active ? t.color : T.muted} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form content */}
      {tab === 'speak' ? (
        <SpeakingForm user={user} onToast={onToast} />
      ) : (
        <SponsorshipForm user={user} onToast={onToast} />
      )}
    </div>
  );
}
