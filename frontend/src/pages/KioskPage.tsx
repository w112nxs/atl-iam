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

type Screen = 'welcome' | 'search' | 'walkin' | 'confirm' | 'printing';

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

  const [printAfterConfirm, setPrintAfterConfirm] = useState(false);

  const handleCheckIn = async (attendee: KioskAttendee, print = false) => {
    if (attendee.checkedIn && print) {
      // Already checked in — just reprint badge
      setConfirmedAttendee({
        name: attendee.name, company: attendee.company,
        title: attendee.title, type: attendee.type,
      });
      setPrintAfterConfirm(true);
      setScreen('confirm');
      return;
    }
    try {
      const result = await api.kioskCheckIn(eventId, attendee.id, kioskToken, stationId);
      setConfirmedAttendee(result.attendee);
      setPrintAfterConfirm(print);
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
      setPrintAfterConfirm(true);
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
            eventName={eventInfo?.name || ''}
            autoPrint={printAfterConfirm}
            onDone={() => { setConfirmedAttendee(null); setPrintAfterConfirm(false); setScreen('welcome'); }}
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
  attendees: KioskAttendee[]; onSelect: (a: KioskAttendee, print: boolean) => void;
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
            <div
              key={a.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: a.checkedIn ? K.green + '11' : K.card,
                border: `1px solid ${a.checkedIn ? K.green + '33' : K.border}`,
                borderRadius: 12, padding: '16px 20px',
                textAlign: 'left', width: '100%',
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
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                {a.checkedIn && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: K.green, letterSpacing: '0.08em', marginRight: 4 }}>
                    CHECKED IN
                  </span>
                )}
                {!a.checkedIn && (
                  <span
                    onClick={(e) => { e.stopPropagation(); onSelect(a, false); }}
                    style={{
                      background: K.accent, borderRadius: 8, padding: '8px 16px',
                      fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    CHECK IN
                  </span>
                )}
                <span
                  onClick={(e) => { e.stopPropagation(); onSelect(a, true); }}
                  style={{
                    background: a.checkedIn ? K.surface : `linear-gradient(135deg, ${K.accent}, ${K.purple})`,
                    border: a.checkedIn ? `1px solid ${K.border}` : 'none',
                    borderRadius: 8, padding: '8px 16px',
                    fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
                    color: a.checkedIn ? K.text : '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={a.checkedIn ? K.text : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  {a.checkedIn ? 'REPRINT' : 'PRINT'}
                </span>
              </div>
            </div>
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
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const companyDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); onClearError(); };

  const handleCompanyChange = (v: string) => {
    set('company', v);
    clearTimeout(companyDebounce.current);
    if (v.length >= 2) {
      companyDebounce.current = setTimeout(async () => {
        try {
          const results = await api.searchCompanies(v);
          setCompanySuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch { setCompanySuggestions([]); }
      }, 250);
    } else {
      setCompanySuggestions([]);
      setShowSuggestions(false);
    }
  };

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
          <div style={{ position: 'relative' }}>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: K.muted, letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>COMPANY</label>
            <input style={iStyle} value={form.company} onChange={e => handleCompanyChange(e.target.value)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder="Company name" />
            {showSuggestions && companySuggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: K.card, border: `1px solid ${K.border}`, borderRadius: 10,
                marginTop: 4, maxHeight: 200, overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                {companySuggestions.map(c => (
                  <div
                    key={c}
                    onMouseDown={() => { set('company', c); setShowSuggestions(false); }}
                    style={{
                      padding: '12px 16px', cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", fontSize: 16, color: K.text,
                      borderBottom: `1px solid ${K.border}22`,
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
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
          {submitting ? 'REGISTERING...' : 'REGISTER & CHECK IN + PRINT BADGE'}
        </button>
      </div>
    </div>
  );
}

// ── Confirmation Screen ──
function ConfirmScreen({ attendee, eventName, autoPrint, onDone }: {
  attendee: { name: string; company: string; title: string; type: string };
  eventName: string; autoPrint: boolean; onDone: () => void;
}) {
  const [printing, setPrinting] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss after 10 seconds (longer if printing)
  useEffect(() => {
    const t = setTimeout(onDone, printing ? 30000 : 10000);
    return () => clearTimeout(t);
  }, [onDone, printing]);

  // Auto-print if requested
  useEffect(() => {
    if (autoPrint) {
      setTimeout(() => printBadge(), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const printBadge = () => {
    setPrinting(true);
    const badgeEl = badgeRef.current;
    if (!badgeEl) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      setPrinting(false);
      return;
    }

    const typeColor = attendee.type === 'enterprise' ? '#4f8cff' : '#f0b429';
    const typeLabel = attendee.type === 'enterprise' ? 'ENTERPRISE' : 'VENDOR';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Badge — ${attendee.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Inter:wght@400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: 4in 3in; margin: 0; }
          body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
          .badge {
            width: 4in; height: 3in; padding: 0.3in 0.4in;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            text-align: center; border: 2px dashed #ccc; border-radius: 12px;
          }
          .event-name { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #888; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
          .name { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 32px; color: #111; text-transform: uppercase; line-height: 1.1; }
          .detail { font-family: 'Inter', sans-serif; font-size: 14px; color: #555; margin-top: 2px; }
          .type-bar { margin-top: 12px; padding: 6px 24px; border-radius: 6px; background: ${typeColor}; color: #fff; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; }
        </style>
      </head>
      <body>
        <div class="badge">
          <div class="event-name">${eventName}</div>
          <div class="name">${attendee.name}</div>
          ${attendee.title ? `<div class="detail">${attendee.title}</div>` : ''}
          ${attendee.company ? `<div class="detail">${attendee.company}</div>` : ''}
          <div class="type-bar">${typeLabel}</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 400);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => setPrinting(false), 2000);
  };

  const typeColor = attendee.type === 'enterprise' ? K.accent : K.gold;

  return (
    <div
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40,
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
      <div ref={badgeRef} style={{
        background: '#fff', borderRadius: 16, padding: '24px 32px', minWidth: 360,
        textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.1em', marginBottom: 6 }}>
          {eventName}
        </div>
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

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <button
          onClick={printBadge}
          disabled={printing}
          style={{
            background: `linear-gradient(135deg, ${K.accent}, ${K.purple})`,
            border: 'none', borderRadius: 12, padding: '14px 32px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#fff' }}>
            {printing ? 'PRINTING...' : 'PRINT BADGE'}
          </span>
        </button>

        <button
          onClick={onDone}
          style={{
            background: 'transparent', border: `2px solid ${K.border}`,
            borderRadius: 12, padding: '14px 32px', cursor: 'pointer',
          }}
        >
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: K.muted }}>
            DONE
          </span>
        </button>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: K.muted, margin: 0 }}>
        Screen auto-resets in a few seconds
      </p>
    </div>
  );
}
