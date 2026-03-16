import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { StatBox } from '../components/ui/StatBox';
import { useEvents } from '../hooks/useEvents';
import { api } from '../api/client';
import type { User, ThemeTokens } from '../types';

interface EventsPageProps {
  user: User | null;
  onNavigate: (path: string) => void;
}

type DrillAttendee = {
  id: string; name: string; email: string; company: string; title: string;
  type: string; checkedIn: boolean; checkedInAt: string; checkedInBy: string;
};

function tierColor(tier: string, T: ThemeTokens) {
  return tier === 'Gold' ? T.gold : tier === 'Silver' ? T.subtle : T.accent;
}

export function EventsPage({ user, onNavigate }: EventsPageProps) {
  const { T } = useTheme();
  const { events } = useEvents();
  const isAdmin = user?.role === 'admin';

  const [drillOpen, setDrillOpen] = useState<{
    eventId: string; eventName: string; label: string; filter?: string;
  } | null>(null);
  const [drillData, setDrillData] = useState<DrillAttendee[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);

  const openDrill = async (eventId: string, eventName: string, label: string, filter?: string) => {
    if (!isAdmin) return;
    setDrillOpen({ eventId, eventName, label, filter });
    setDrillLoading(true);
    try {
      const data = await api.getAdminEventAttendees(eventId, filter);
      setDrillData(data);
    } catch {
      setDrillData([]);
    }
    setDrillLoading(false);
  };

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
                  {isAdmin && (
                    <button
                      title="Launch Kiosk"
                      onClick={() => window.open(`/kiosk?event=${evt.id}&token=atlanta-iam-kiosk-2026&station=admin`, '_blank')}
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 6,
                        padding: '5px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'background 0.2s, border-color 0.2s',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: 9,
                        letterSpacing: '0.1em',
                        color: T.accent,
                      }}>
                        KIOSK
                      </span>
                    </button>
                  )}
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

              {/* Stats row — clickable for admins */}
              <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                <div
                  onClick={() => openDrill(evt.id, evt.name, 'Registered')}
                  style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                  title={isAdmin ? 'Click to view all registered attendees' : undefined}
                >
                  <StatBox label="Registered" value={evt.stats.registered} color={T.accent} />
                </div>
                <div
                  onClick={() => openDrill(evt.id, evt.name, 'Checked In', 'checked_in')}
                  style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                  title={isAdmin ? 'Click to view checked-in attendees' : undefined}
                >
                  <StatBox label="Checked In" value={evt.stats.checkedIn} color={T.green} sub={evt.stats.registered ? `${Math.round((evt.stats.checkedIn / evt.stats.registered) * 100)}%` : '0%'} />
                </div>
                <div
                  onClick={() => openDrill(evt.id, evt.name, 'Enterprise', 'enterprise')}
                  style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                  title={isAdmin ? 'Click to view enterprise attendees' : undefined}
                >
                  <StatBox label="Enterprise" value={evt.stats.enterprise} color={T.purple} />
                </div>
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

      {/* Drill-down Modal */}
      {drillOpen && (
        <AttendeeDrillModal
          T={T}
          label={drillOpen.label}
          eventName={drillOpen.eventName}
          attendees={drillData}
          loading={drillLoading}
          onClose={() => { setDrillOpen(null); setDrillData([]); }}
        />
      )}
    </div>
  );
}

// ── Attendee Drill-Down Modal ──
function AttendeeDrillModal({ T, label, eventName, attendees, loading, onClose }: {
  T: ThemeTokens; label: string; eventName: string;
  attendees: DrillAttendee[]; loading: boolean; onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = search.length >= 2
    ? attendees.filter(a => {
        const q = search.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.company.toLowerCase().includes(q);
      })
    : attendees;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.card, borderRadius: 16, border: `1px solid ${T.border}`,
          width: '100%', maxWidth: 720, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: T.shadow,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: T.text, margin: 0 }}>
              {label}
            </h3>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, marginTop: 2 }}>
              {eventName} — {filtered.length} attendee{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: T.muted, fontSize: 24,
            cursor: 'pointer', fontWeight: 700, lineHeight: 1,
          }}>x</button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}` }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            style={{
              width: '100%', background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: '10px 14px',
              fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.text, outline: 'none',
            }}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Inter', sans-serif", color: T.muted }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Inter', sans-serif", color: T.muted }}>No attendees found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'Company', 'Title', 'Type', 'Status', 'Checked In At'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 6px',
                      fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.1em', color: T.muted, borderBottom: `1px solid ${T.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${T.border}22` }}>
                    <td style={{ padding: '8px 6px' }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.text }}>{a.name}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted }}>{a.email}</div>
                    </td>
                    <td style={{ padding: '8px 6px', fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.text }}>{a.company}</td>
                    <td style={{ padding: '8px 6px', fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted }}>{a.title}</td>
                    <td style={{ padding: '8px 6px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                        background: (a.type === 'enterprise' ? T.accent : T.gold) + '22',
                        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                        color: a.type === 'enterprise' ? T.accent : T.gold,
                        letterSpacing: '0.06em',
                      }}>
                        {a.type === 'enterprise' ? 'ENT' : 'VND'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 6px' }}>
                      {a.checkedIn ? (
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                          background: T.green + '22',
                          fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                          color: T.green, letterSpacing: '0.06em',
                        }}>IN</span>
                      ) : (
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                          background: T.muted + '22',
                          fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                          color: T.muted, letterSpacing: '0.06em',
                        }}>--</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 6px', fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted }}>
                      {a.checkedInAt ? new Date(a.checkedInAt).toLocaleString() : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
