import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { useEvents } from '../hooks/useEvents';
import { api } from '../api/client';
import type { User, ThemeTokens, Event, EventType } from '../types';
import { EVENT_TYPE_LABELS } from '../types';

interface EventsPageProps {
  user: User | null;
  onNavigate: (path: string) => void;
}

function parseEventDate(dateStr: string): Date {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return new Date(0);
}

function isUpcoming(dateStr: string): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return parseEventDate(dateStr) >= now;
}

export function EventsPage({ user, onNavigate }: EventsPageProps) {
  const { T } = useTheme();
  const { events } = useEvents();
  const isAdmin = user?.role === 'admin';

  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [calMenuOpen, setCalMenuOpen] = useState(false);
  const calMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (calMenuRef.current && !calMenuRef.current.contains(e.target as Node)) setCalMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calMenuOpen]);

  // Sort latest first
  const sorted = [...events].sort(
    (a, b) => parseEventDate(b.date).getTime() - parseEventDate(a.date).getTime()
  );
  const filtered = typeFilter === 'all' ? sorted : sorted.filter(e => e.eventType === typeFilter);

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
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
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
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, gap: 12, flexWrap: 'wrap',
      }}>
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

      {/* Split into upcoming vs past */}
      {(() => {
        const upcomingEvents = filtered.filter(e => isUpcoming(e.date));
        const pastEvents = filtered.filter(e => !isUpcoming(e.date));

        return (
          <>
            {/* ── UPCOMING ── */}
            {upcomingEvents.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase' as const,
                  color: T.accent,
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  Upcoming Events
                  <span style={{ flex: '0 0 40px', height: 1, background: T.accent, display: 'inline-block' }} />
                </div>
                <div className="grid-3col" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                }}>
                  {upcomingEvents.map(evt => (
                    <EventTile key={evt.id} evt={evt} upcoming T={T} onSelect={setSelectedEvent} />
                  ))}
                </div>
              </div>
            )}

            {/* ── PAST ── */}
            {pastEvents.length > 0 && (
              <div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase' as const,
                  color: T.muted,
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  Past Events
                  <span style={{ flex: '0 0 40px', height: 1, background: T.border, display: 'inline-block' }} />
                </div>
                <div className="grid-3col" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                }}>
                  {pastEvents.map(evt => (
                    <EventTile key={evt.id} evt={evt} upcoming={false} T={T} onSelect={setSelectedEvent} />
                  ))}
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          T={T}
          event={selectedEvent}
          isAdmin={isAdmin}
          onClose={() => setSelectedEvent(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

/* ── Event Tile ── */
function EventTile({ evt, upcoming, T, onSelect }: {
  evt: Event; upcoming: boolean; T: ThemeTokens; onSelect: (e: Event) => void;
}) {
  const typeLabel = EVENT_TYPE_LABELS[(evt.eventType || 'quarterly_meetup') as EventType] || 'Event';

  return (
    <div onClick={() => onSelect(evt)} style={{ cursor: 'pointer' }}>
      <Card style={{
        padding: '20px 20px',
        borderTop: upcoming ? `3px solid ${T.accent}` : `2px solid ${T.border}`,
        background: upcoming ? `linear-gradient(180deg, ${T.accentDim}, ${T.card})` : T.card,
        transition: 'border-color 0.25s, transform 0.15s, box-shadow 0.15s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow for upcoming */}
        {upcoming && (
          <div style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${T.accent}18, transparent 70%)`,
            pointerEvents: 'none',
          }} />
        )}

        {/* Top row: date + badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            color: upcoming ? T.accent : T.muted,
            fontWeight: 700,
          }}>
            {evt.date}
          </span>
          {upcoming && <Pill label="UPCOMING" color={T.green} size={8} />}
        </div>

        {/* Event name */}
        <h3 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: upcoming ? T.text : T.subtle,
          margin: '0 0 4px',
          letterSpacing: '0.03em',
          lineHeight: 1.2,
          transition: 'color 0.25s',
        }}>
          {evt.name}
        </h3>

        {/* Venue */}
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          color: T.muted,
          marginBottom: 12,
        }}>
          {evt.venue}
        </div>

        {/* Speakers */}
        {evt.sessions.length > 0 && (
          <div style={{ marginBottom: 12, flex: 1 }}>
            {evt.sessions.slice(0, 2).map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: upcoming ? T.accent : T.muted, flexShrink: 0,
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                    color: upcoming ? T.text : T.subtle,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {s.speaker}
                  </div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {s.title}
                  </div>
                </div>
              </div>
            ))}
            {evt.sessions.length > 2 && (
              <div style={{ fontSize: 10, color: T.muted, marginLeft: 13 }}>
                +{evt.sessions.length - 2} more session{evt.sessions.length - 2 > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Bottom: type + sponsors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
          <Pill label={typeLabel} color={upcoming ? T.accent : T.muted} size={8} />
          {evt.sponsors.slice(0, 2).map(sp => (
            <Pill key={sp.id} label={sp.name} color={upcoming ? T.gold : T.muted} size={8} />
          ))}
          {evt.sessions.length > 0 && (
            <Pill label={`${evt.sessions.reduce((sum, s) => sum + s.cpe, 0)} CPE`} color={upcoming ? T.purple : T.muted} size={8} />
          )}
        </div>
      </Card>
    </div>
  );
}

/* ── Event Detail Modal (LinkedIn-post style) ── */
function EventDetailModal({ T, event, isAdmin, onClose, onNavigate }: {
  T: ThemeTokens;
  event: Event;
  isAdmin: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const upcoming = isUpcoming(event.date);
  const typeLabel = EVENT_TYPE_LABELS[(event.eventType || 'quarterly_meetup') as EventType] || 'Event';

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
          width: '100%', maxWidth: 640, maxHeight: '85vh', overflowY: 'auto',
          boxShadow: T.shadow,
        }}
      >
        {/* Accent bar */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, ${T.accent}, ${T.gold})`,
          borderRadius: '16px 16px 0 0',
        }} />

        <div style={{ padding: '24px 28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <Pill label={typeLabel} color={T.accent} size={9} />
                {upcoming && <Pill label="UPCOMING" color={T.green} size={9} />}
                {event.sessions.length > 0 && (
                  <Pill label={`${event.sessions.reduce((sum, s) => sum + s.cpe, 0)} CPE Credits`} color={T.purple} size={9} />
                )}
              </div>
              <h2 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: 28,
                color: T.text,
                margin: '0 0 6px',
                letterSpacing: '0.03em',
                lineHeight: 1.15,
              }}>
                {event.name}
              </h2>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: T.muted,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}>
                <span>{event.date}</span>
                <span style={{ color: T.border }}>|</span>
                <span>{event.venue}</span>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: T.muted, fontSize: 22,
              cursor: 'pointer', fontWeight: 700, lineHeight: 1, padding: '0 0 0 12px',
            }}>x</button>
          </div>

          {/* Description */}
          {event.description && (
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: T.subtle,
              lineHeight: 1.7,
              margin: '0 0 20px',
              padding: '14px 16px',
              background: T.surface,
              borderRadius: 10,
              borderLeft: `3px solid ${T.accent}`,
            }}>
              {event.description}
            </p>
          )}

          {/* Speakers / Sessions */}
          {event.sessions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                color: T.accent,
                marginBottom: 10,
              }}>
                Speakers & Sessions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {event.sessions.map((s, i) => (
                  <div key={s.id} style={{
                    display: 'flex',
                    gap: 14,
                    padding: '14px 0',
                    borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  }}>
                    {/* Time badge */}
                    <div style={{
                      background: T.accentDim,
                      borderRadius: 8,
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 56,
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.accent,
                      }}>
                        {s.time}
                      </span>
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        color: T.accent,
                        opacity: 0.7,
                      }}>
                        {s.cpe} CPE
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: T.text,
                        marginBottom: 3,
                        lineHeight: 1.3,
                      }}>
                        {s.title}
                      </div>
                      <div style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: T.subtle,
                      }}>
                        {s.speaker}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sponsors */}
          {event.sponsors.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                color: T.gold,
                marginBottom: 8,
              }}>
                Sponsored By
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {event.sponsors.map(sp => (
                  <div key={sp.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: T.surface,
                    borderRadius: 8,
                    padding: '8px 14px',
                  }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.text,
                    }}>
                      {sp.name}
                    </span>
                    <Pill
                      label={sp.tier}
                      color={sp.tier === 'Gold' ? T.gold : sp.tier === 'Silver' ? T.subtle : T.accent}
                      size={8}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: 10, flexWrap: 'wrap',
            paddingTop: 16,
            borderTop: `1px solid ${T.border}`,
          }}>
            {upcoming && (
              <button
                onClick={() => { onClose(); onNavigate('/events'); }}
                style={{
                  background: T.accent,
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  padding: '12px 28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Register Now
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => window.open(`/kiosk?event=${event.id}&token=atlanta-iam-kiosk-2026&station=admin`, '_blank')}
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  color: T.accent,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                LAUNCH KIOSK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
