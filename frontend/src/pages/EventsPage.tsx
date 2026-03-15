import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { StatBox } from '../components/ui/StatBox';
import { useEvents } from '../hooks/useEvents';
import type { User } from '../types';

interface EventsPageProps {
  user: User | null;
  onNavigate: (path: string) => void;
}

function tierColor(tier: string, T: ReturnType<typeof useTheme>['T']) {
  return tier === 'Gold' ? T.gold : tier === 'Silver' ? T.subtle : T.accent;
}

export function EventsPage({ user, onNavigate }: EventsPageProps) {
  const { T } = useTheme();
  const { events } = useEvents();

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 32,
          color: T.text,
          margin: 0,
          transition: 'color 0.25s',
        }}>
          Events
        </h1>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, transition: 'color 0.25s' }}>
          {events.length} events
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {events.map(evt => {
          const userSponsor = user?.sponsorId
            ? evt.sponsors.find(s => s.id === user.sponsorId)
            : null;

          return (
            <Card key={evt.id}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color: T.muted,
                    marginBottom: 4,
                    transition: 'color 0.25s',
                  }}>
                    {evt.date} &middot; {evt.venue}
                  </div>
                  <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: 20,
                    color: T.text,
                    margin: '0 0 8px',
                    transition: 'color 0.25s',
                  }}>
                    {evt.name}
                  </h2>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {evt.sponsors.map(sp => (
                      <Pill key={sp.id} label={`${sp.name} \u00B7 ${sp.tier}`} color={tierColor(sp.tier, T)} size={9} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <Pill label={`${evt.stats.checkedIn} attended`} color={T.green} />
                  {userSponsor && (
                    <>
                      <Pill label="YOU SPONSORED THIS" color={T.gold} />
                      <button
                        onClick={() => onNavigate('/sponsor-portal')}
                        style={{
                          background: T.goldDim,
                          border: `1px solid ${T.gold}44`,
                          borderRadius: 5,
                          color: T.gold,
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 700,
                          fontSize: 10,
                          letterSpacing: '0.08em',
                          padding: '4px 12px',
                          cursor: 'pointer',
                          transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                        }}
                      >
                        VIEW PORTAL
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                <StatBox label="Registered" value={evt.stats.registered} color={T.accent} />
                <StatBox label="Checked In" value={evt.stats.checkedIn} color={T.green} sub={`${Math.round((evt.stats.checkedIn / evt.stats.registered) * 100)}%`} />
                <StatBox label="Enterprise" value={evt.stats.enterprise} color={T.purple} />
                <StatBox label="Sessions" value={evt.sessions.length} color={T.gold} />
              </div>

              {/* Sessions */}
              <SectionLabel text="Sessions" color={T.accent} />
              <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                {evt.sessions.map(s => (
                  <div key={s.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: T.surface,
                    transition: 'background 0.25s',
                  }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: 10,
                      color: T.muted,
                      minWidth: 50,
                      transition: 'color 0.25s',
                    }}>
                      {s.time}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: T.text, transition: 'color 0.25s' }}>
                        {s.title}
                      </div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted, transition: 'color 0.25s' }}>
                        {s.speaker} &middot; {s.cpe} CPE
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
