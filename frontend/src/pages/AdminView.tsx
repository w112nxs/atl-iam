import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { StatBox } from '../components/ui/StatBox';
import { useEvents } from '../hooks/useEvents';

export function AdminView() {
  const { T } = useTheme();
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  const tierColor = (tier: string) =>
    tier === 'Gold' ? T.gold : tier === 'Silver' ? T.subtle : T.accent;

  if (!selectedEvent) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: T.muted, fontFamily: "'Poppins', sans-serif" }}>
        Loading events...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 700,
        fontSize: 32,
        color: T.text,
        margin: '0 0 24px',
        transition: 'color 0.25s',
      }}>
        <span style={{ color: T.red }}>●</span> Admin Dashboard
      </h1>

      {/* Event selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {events.map(evt => (
          <button
            key={evt.id}
            onClick={() => setSelectedEventId(evt.id)}
            style={{
              background: selectedEventId === evt.id ? T.red + '22' : 'transparent',
              border: `1px solid ${selectedEventId === evt.id ? T.red + '44' : T.border}`,
              borderRadius: 20,
              color: selectedEventId === evt.id ? T.red : T.muted,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.06em',
              padding: '6px 16px',
              cursor: 'pointer',
              transition: 'background 0.25s, color 0.25s, border-color 0.25s',
            }}
          >
            {evt.name}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatBox label="Registered" value={selectedEvent.stats.registered} color={T.accent} />
        <StatBox
          label="Checked In"
          value={selectedEvent.stats.checkedIn}
          color={T.green}
          sub={`${Math.round((selectedEvent.stats.checkedIn / selectedEvent.stats.registered) * 100)}% of registered`}
        />
        <StatBox label="Enterprise" value={selectedEvent.stats.enterprise} color={T.purple} />
        <StatBox label="Sponsors" value={selectedEvent.sponsors.length} color={T.gold} />
      </div>

      {/* Sponsor breakdown */}
      <Card>
        <div style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.2em',
          color: T.muted,
          marginBottom: 14,
          transition: 'color 0.25s',
        }}>
          SPONSOR BREAKDOWN
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectedEvent.sponsors.map(sp => (
            <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Pill label={sp.tier} color={tierColor(sp.tier)} />
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: T.text,
                transition: 'color 0.25s',
              }}>
                {sp.name}
              </span>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 12,
                color: T.muted,
                transition: 'color 0.25s',
              }}>
                Portal access active
              </span>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: T.green,
                animation: 'pulse 2s infinite',
              }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
