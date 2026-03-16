import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { StatBox } from '../components/ui/StatBox';
import { CalendarGrid } from '../components/CalendarGrid';
import { useEvents } from '../hooks/useEvents';
import { api } from '../api/client';
import type { User, ThemeTokens, EventType } from '../types';
import { EVENT_TYPE_LABELS } from '../types';

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

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [calMenuOpen, setCalMenuOpen] = useState(false);
  const calMenuRef = useRef<HTMLDivElement>(null);

  // Close calendar menu on outside click
  useEffect(() => {
    if (!calMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (calMenuRef.current && !calMenuRef.current.contains(e.target as Node)) setCalMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calMenuOpen]);

  const filteredEvents = typeFilter === 'all' ? events : events.filter(e => e.eventType === typeFilter);

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

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? T.accent : T.surface,
    color: active ? '#fff' : T.muted,
    border: `1px solid ${active ? T.accent : T.border}`,
    borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 10,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    transition: 'all 0.2s',
  });

  const handleDownloadIcs = () => {
    const url = api.getCalendarUrl(typeFilter !== 'all' ? { eventType: typeFilter } : undefined);
    window.open(url, '_blank');
    setCalMenuOpen(false);
  };

  const handleSubscribe = () => {
    const url = api.getCalendarSubscribeUrl(typeFilter !== 'all' ? { eventType: typeFilter } : undefined);
    window.location.href = url;
    setCalMenuOpen(false);
  };

  const handleGoogleCal = () => {
    const icsUrl = api.getCalendarUrl(typeFilter !== 'all' ? { eventType: typeFilter } : undefined);
    const webcalUrl = icsUrl.replace(/^https?:/, 'webcal:');
    window.open(`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`, '_blank');
    setCalMenuOpen(false);
  };

  const handleCopyUrl = async () => {
    const url = api.getCalendarUrl(typeFilter !== 'all' ? { eventType: typeFilter } : undefined);
    try {
      await navigator.clipboard.writeText(url);
    } catch { /* ignore */ }
    setCalMenuOpen(false);
  };

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 32,
          color: T.text,
          margin: 0,
          letterSpacing: '0.04em',
          transition: 'color 0.25s',
        }}>
          Events
        </h1>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, transition: 'color 0.25s' }}>
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', gap: 0 }}>
            <button onClick={() => setView('list')} style={{
              ...toggleBtnStyle(view === 'list'),
              borderRadius: '6px 0 0 6px', borderRight: 'none',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                LIST
              </span>
            </button>
            <button onClick={() => setView('calendar')} style={{
              ...toggleBtnStyle(view === 'calendar'),
              borderRadius: '0 6px 6px 0',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                CALENDAR
              </span>
            </button>
          </div>

          {/* Event type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as EventType | 'all')}
            style={{
              background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 6,
              color: T.text, fontFamily: "'Inter', sans-serif", fontSize: 12,
              padding: '7px 12px', cursor: 'pointer', outline: 'none',
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            }}
          >
            <option value="all">All Types</option>
            {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Subscribe button */}
        <div style={{ position: 'relative' }} ref={calMenuRef}>
          <button
            onClick={() => setCalMenuOpen(!calMenuOpen)}
            style={{
              background: T.accentDim, border: `1px solid ${T.accent}44`,
              borderRadius: 6, color: T.accent, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11,
              letterSpacing: '0.06em', padding: '7px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              <line x1="12" y1="14" x2="12" y2="18" /><line x1="10" y1="16" x2="14" y2="16" />
            </svg>
            SUBSCRIBE
          </button>

          {calMenuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4,
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
              boxShadow: T.shadow, zIndex: 50, minWidth: 220, overflow: 'hidden',
            }}>
              {[
                { label: 'Download .ics File', icon: '↓', action: handleDownloadIcs },
                { label: 'Subscribe (webcal://)', icon: '🔗', action: handleSubscribe },
                { label: 'Add to Google Calendar', icon: 'G', action: handleGoogleCal },
                { label: 'Copy Calendar URL', icon: '⎘', action: handleCopyUrl },
              ].map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 14px', background: 'none', border: 'none',
                    borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                    fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.text,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surface}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: 4, background: T.surface,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: T.accent, flexShrink: 0,
                  }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <CalendarGrid
          events={filteredEvents}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
        />
      )}

      {/* List View */}
      {view === 'list' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filteredEvents.map(evt => {
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
              <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
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
      )}

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
