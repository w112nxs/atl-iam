import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
import type { EventType } from '../types';
import { EVENT_TYPE_LABELS } from '../types';

// Color palette (always dark mode for kiosk)
const K = {
  bg: '#0a0a12',
  surface: '#12121f',
  card: '#1a1a2e',
  border: '#2a2a40',
  accent: '#4f8cff',
  gold: '#f0b429',
  green: '#34d399',
  red: '#f87171',
  purple: '#a78bfa',
  text: '#f0f0f5',
  muted: '#8888aa',
  subtle: '#555570',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  quarterly_meetup: K.accent,
  training: K.gold,
  webinar: K.purple,
  vendor_demo: K.gold,
  executive_roundtable: K.red,
  social: K.green,
  study_group: K.purple,
  hackathon: K.red,
};

type KioskAttendee = {
  id: string; name: string; email: string; company: string;
  title: string; type: string; checkedIn: boolean;
};

type Screen = 'welcome' | 'search' | 'walkin' | 'confirm';

export function KioskPage() {
  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('event') || '';
  const kioskToken = params.get('token') || '';
  const stationId = params.get('station') || 'kiosk-1';

  const [screen, setScreen] = useState<Screen>('welcome');
  const [eventInfo, setEventInfo] = useState<{ id: string; name: string; date: string; venue: string; eventType: string } | null>(null);
  const [attendees, setAttendees] = useState<KioskAttendee[]>([]);
  const [stats, setStats] = useState({ registered: 0, checkedIn: 0, enterprise: 0, vendor: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmedAttendee, setConfirmedAttendee] = useState<{ name: string; company: string; title: string; type: string } | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load event data
  const loadData = useCallback(async () => {
    if (!eventId || !kioskToken) {
      setError('Missing event ID or kiosk token. URL format: /kiosk?event=e1&token=YOUR_TOKEN');
      setLoading(false);
      return;
    }
    try {
      const data = await api.kioskGetEventData(eventId, kioskToken);
      setEventInfo(data.event);
      setAttendees(data.attendees);
      setStats(data.stats);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event data');
    }
    setLoading(false);
  }, [eventId, kioskToken]);

  useEffect(() => { loadData(); }, [loadData]);

  // Refresh stats periodically
  useEffect(() => {
    if (!eventId || !kioskToken) return;
    const interval = setInterval(async () => {
      try {
        const s = await api.kioskGetStats(eventId, kioskToken);
        setStats(s);
      } catch { /* ignore */ }
    }, 30000);
    return () => clearInterval(interval);
  }, [eventId, kioskToken]);

  // Idle timeout — return to welcome after 60s of inactivity
  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setScreen('welcome');
      setConfirmedAttendee(null);
    }, 60000);
  }, []);

  useEffect(() => {
    const handler = () => resetIdle();
    window.addEventListener('touchstart', handler);
    window.addEventListener('click', handler);
    return () => {
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('click', handler);
      clearTimeout(idleTimer.current);
    };
  }, [resetIdle]);

  const handleCheckIn = async (attendee: KioskAttendee) => {
    try {
      const result = await api.kioskCheckIn(eventId, attendee.id, kioskToken, stationId);
      setConfirmedAttendee(result.attendee);
      setScreen('confirm');
      // Mark as checked in locally
      setAttendees(prev => prev.map(a => a.id === attendee.id ? { ...a, checkedIn: true } : a));
      setStats(prev => ({ ...prev, checkedIn: prev.checkedIn + (attendee.checkedIn ? 0 : 1) }));
    } catch {
      setError('Check-in failed. Please try again.');
    }
  };

  const handleWalkIn = async (data: { name: string; email: string; company?: string; title?: string; type?: string }) => {
    try {
      const result = await api.kioskWalkIn(eventId, data, kioskToken);
      setConfirmedAttendee(result.attendee);
      setScreen('confirm');
      // Add to local list
      setAttendees(prev => [...prev, { id: result.attendee.id, ...data, company: data.company || '', title: data.title || '', type: data.type || 'enterprise', checkedIn: true }]);
      setStats(prev => ({ ...prev, registered: prev.registered + 1, checkedIn: prev.checkedIn + 1 }));
    } catch {
      setError('Registration failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ ...fullScreen, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 32, color: K.muted }}>Loading event data...</div>
      </div>
    );
  }

  if (error && !eventInfo) {
    return (
      <div style={{ ...fullScreen, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, color: K.red, textAlign: 'center', maxWidth: 500, padding: 40 }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={fullScreen}>
      {/* Stats bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px', background: K.surface, borderBottom: `1px solid ${K.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/badge.png" alt="" width="36" height="36" style={{ borderRadius: '50%' }} />
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: K.text }}>
            {eventInfo?.name}
          </span>
          {eventInfo?.eventType && (
            <span style={{
              background: (EVENT_TYPE_COLORS[eventInfo.eventType] || K.accent) + '22',
              border: `1px solid ${(EVENT_TYPE_COLORS[eventInfo.eventType] || K.accent)}44`,
              borderRadius: 12, padding: '2px 10px',
              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
              color: EVENT_TYPE_COLORS[eventInfo.eventType] || K.accent,
            }}>
              {EVENT_TYPE_LABELS[eventInfo.eventType as EventType] || eventInfo.eventType}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Registered', val: stats.registered, color: K.accent },
            { label: 'Checked In', val: stats.checkedIn, color: K.green },
            { label: 'Remaining', val: stats.registered - stats.checkedIn, color: K.gold },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: s.color }}>{s.val}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: K.muted, letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {screen === 'welcome' && (
          <WelcomeScreen
            eventName={eventInfo?.name || ''}
            onCheckIn={() => { setScreen('search'); resetIdle(); }}
            onWalkIn={() => { setScreen('walkin'); resetIdle(); }}
          />
        )}
        {screen === 'search' && (
          <SearchScreen
            attendees={attendees}
            onSelect={handleCheckIn}
            onBack={() => setScreen('welcome')}
            error={error}
            onClearError={() => setError('')}
          />
        )}
        {screen === 'walkin' && (
          <WalkInScreen
            onSubmit={handleWalkIn}
            onBack={() => setScreen('welcome')}
            error={error}
            onClearError={() => setError('')}
          />
        )}
        {screen === 'confirm' && confirmedAttendee && (
          <ConfirmScreen
            attendee={confirmedAttendee}
            onDone={() => { setConfirmedAttendee(null); setScreen('welcome'); }}
          />
        )}
      </div>
    </div>
  );
}

const fullScreen: React.CSSProperties = {
  position: 'fixed', inset: 0, background: K.bg, color: K.text,
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  userSelect: 'none', WebkitUserSelect: 'none',
};

// ── Welcome Screen ──
function WelcomeScreen({ eventName, onCheckIn, onWalkIn }: {
  eventName: string; onCheckIn: () => void; onWalkIn: () => void;
}) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 32, padding: 40,
    }}>
      <img src="/badge.png" alt="Atlanta IAM" width="160" height="160" style={{ borderRadius: '50%', border: `3px solid ${K.accent}44` }} />
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 48, color: K.text, margin: '0 0 8px' }}>
          Welcome
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: K.muted, margin: 0 }}>
          {eventName}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        <button onClick={onCheckIn} style={{
          background: `linear-gradient(135deg, ${K.accent}, ${K.purple})`,
          border: 'none', borderRadius: 16, padding: '24px 48px',
          cursor: 'pointer', minWidth: 220,
        }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: '#fff' }}>CHECK IN</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Already registered</div>
        </button>

        <button onClick={onWalkIn} style={{
          background: 'transparent', border: `2px solid ${K.border}`,
          borderRadius: 16, padding: '24px 48px', cursor: 'pointer', minWidth: 220,
        }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: K.text }}>WALK-IN</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: K.muted, marginTop: 4 }}>New registration</div>
        </button>
      </div>
    </div>
  );
}

// ── Search Screen ──
function SearchScreen({ attendees, onSelect, onBack, error, onClearError }: {
  attendees: KioskAttendee[]; onSelect: (a: KioskAttendee) => void;
  onBack: () => void; error: string; onClearError: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = query.length >= 2
    ? attendees.filter(a => {
        const q = query.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.company.toLowerCase().includes(q);
      }).slice(0, 20)
    : [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: K.surface, border: `1px solid ${K.border}`, borderRadius: 10,
          padding: '10px 20px', cursor: 'pointer',
          fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: K.muted,
        }}>BACK</button>
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); onClearError(); }}
          placeholder="Type your name or email..."
          style={{
            flex: 1, background: K.surface, border: `2px solid ${K.accent}44`,
            borderRadius: 12, padding: '16px 20px',
            fontFamily: "'Inter', sans-serif", fontSize: 20, color: K.text, outline: 'none',
          }}
        />
      </div>

      {error && (
        <div style={{
          background: K.red + '22', border: `1px solid ${K.red}44`, borderRadius: 10,
          padding: '10px 16px', marginBottom: 12,
          fontFamily: "'Inter', sans-serif", fontSize: 14, color: K.red,
        }}>{error}</div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {query.length < 2 ? (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Inter', sans-serif", fontSize: 16, color: K.muted }}>
            Start typing to search {attendees.length} registered attendees
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Inter', sans-serif", fontSize: 16, color: K.muted }}>
            No matches found
          </div>
        ) : (
          filtered.map(a => (
            <button
              key={a.id}
              onClick={() => onSelect(a)}
              disabled={a.checkedIn}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: a.checkedIn ? K.green + '11' : K.card,
                border: `1px solid ${a.checkedIn ? K.green + '33' : K.border}`,
                borderRadius: 12, padding: '16px 20px', cursor: a.checkedIn ? 'default' : 'pointer',
                textAlign: 'left', width: '100%',
                opacity: a.checkedIn ? 0.6 : 1,
              }}
            >
              {/* Type indicator */}
              <div style={{
                width: 6, height: 40, borderRadius: 3,
                background: a.type === 'enterprise' ? K.accent : K.gold,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: K.text }}>
                  {a.name}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: K.muted }}>
                  {[a.title, a.company].filter(Boolean).join(' — ')}
                </div>
              </div>
              {a.checkedIn ? (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: K.green, letterSpacing: '0.08em' }}>
                  CHECKED IN
                </span>
              ) : (
                <span style={{
                  background: K.accent, borderRadius: 8, padding: '8px 20px',
                  fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff',
                }}>
                  CHECK IN
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ── Walk-In Screen ──
function WalkInScreen({ onSubmit, onBack, error, onClearError }: {
  onSubmit: (data: { name: string; email: string; company?: string; title?: string; type?: string }) => void;
  onBack: () => void; error: string; onClearError: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', company: '', title: '', type: 'enterprise' });
  const [submitting, setSubmitting] = useState(false);
  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); onClearError(); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  const iStyle: React.CSSProperties = {
    width: '100%', background: K.surface, border: `1px solid ${K.border}`,
    borderRadius: 10, padding: '14px 16px',
    fontFamily: "'Inter', sans-serif", fontSize: 18, color: K.text, outline: 'none',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={onBack} style={{
            background: K.surface, border: `1px solid ${K.border}`, borderRadius: 10,
            padding: '10px 20px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: K.muted,
          }}>BACK</button>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: K.text, margin: 0 }}>
            Walk-In Registration
          </h2>
        </div>

        {error && (
          <div style={{
            background: K.red + '22', border: `1px solid ${K.red}44`, borderRadius: 10,
            padding: '10px 16px', marginBottom: 12,
            fontFamily: "'Inter', sans-serif", fontSize: 14, color: K.red,
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: K.muted, letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>NAME *</label>
            <input style={iStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" autoFocus />
          </div>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: K.muted, letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>EMAIL *</label>
            <input style={iStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" type="email" />
          </div>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: K.muted, letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>COMPANY</label>
            <input style={iStyle} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company name" />
          </div>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: K.muted, letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>TITLE</label>
            <input style={iStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Job title" />
          </div>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: K.muted, letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>TYPE</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ val: 'enterprise', label: 'Enterprise' }, { val: 'vendor', label: 'Vendor' }].map(t => (
                <button key={t.val} onClick={() => set('type', t.val)} style={{
                  flex: 1, padding: '12px',
                  background: form.type === t.val ? (t.val === 'enterprise' ? K.accent : K.gold) + '22' : 'transparent',
                  border: `2px solid ${form.type === t.val ? (t.val === 'enterprise' ? K.accent : K.gold) : K.border}`,
                  borderRadius: 10, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700,
                  color: form.type === t.val ? K.text : K.muted,
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !form.name.trim() || !form.email.trim()}
          style={{
            width: '100%', marginTop: 20,
            background: form.name.trim() && form.email.trim() ? `linear-gradient(135deg, ${K.accent}, ${K.purple})` : K.surface,
            border: 'none', borderRadius: 12, padding: '16px',
            cursor: form.name.trim() && form.email.trim() ? 'pointer' : 'not-allowed',
            fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: '#fff',
          }}
        >
          {submitting ? 'REGISTERING...' : 'REGISTER & CHECK IN'}
        </button>
      </div>
    </div>
  );
}

// ── Confirmation Screen ──
function ConfirmScreen({ attendee, onDone }: {
  attendee: { name: string; company: string; title: string; type: string };
  onDone: () => void;
}) {
  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const t = setTimeout(onDone, 8000);
    return () => clearTimeout(t);
  }, [onDone]);

  const typeColor = attendee.type === 'enterprise' ? K.accent : K.gold;

  return (
    <div
      onClick={onDone}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40,
        cursor: 'pointer',
      }}
    >
      {/* Big checkmark */}
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: K.green + '22', border: `3px solid ${K.green}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke={K.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 42, color: K.green, margin: 0 }}>
        You're Checked In!
      </h1>

      {/* Badge preview */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '24px 32px', minWidth: 360,
        textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 32, color: '#111', textTransform: 'uppercase' }}>
          {attendee.name}
        </div>
        {attendee.title && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: '#555', marginTop: 4 }}>
            {attendee.title}
          </div>
        )}
        {attendee.company && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: '#555' }}>
            {attendee.company}
          </div>
        )}
        <div style={{
          marginTop: 12, padding: '6px 0', borderRadius: 6,
          background: typeColor, color: '#fff',
          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          {attendee.type === 'enterprise' ? 'ENTERPRISE' : 'VENDOR'}
        </div>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: K.muted, margin: 0 }}>
        Tap anywhere to continue
      </p>
    </div>
  );
}
