import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
import { Icon } from '../components/ui/Icon';
import type { EventType } from '../types';
import { EVENT_TYPE_LABELS } from '../types';
import QRCode from 'qrcode';

/* ── Atlanta Skyline SVG ── */
function KioskSkyline({ color, opacity = 0.1 }: { color: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: 200, display: 'block' }}>
      <path
        d={
          'M0 200 L0 160 L60 160 L60 130 L80 130 L80 110 L100 110 L100 130 L120 130 ' +
          'L120 100 L140 100 L140 80 L150 80 L150 60 L160 60 L160 80 L170 80 L170 100 ' +
          'L190 100 L190 120 L210 120 L210 90 L220 90 L220 70 L230 40 L240 70 L250 70 ' +
          'L250 90 L270 90 L270 110 L290 110 L290 140 L320 140 L320 110 L340 110 L340 80 ' +
          'L350 80 L350 50 L355 30 L360 50 L365 50 L365 80 L380 80 L380 110 L400 110 ' +
          'L400 130 L430 130 L430 100 L450 100 L450 70 L460 70 L460 45 L465 20 L470 45 ' +
          'L480 45 L480 70 L500 70 L500 100 L520 100 L520 120 L550 120 L550 90 L570 90 ' +
          'L570 60 L580 60 L580 40 L590 40 L590 60 L600 60 L600 90 L620 90 L620 110 ' +
          'L660 110 L660 130 L700 130 L700 100 L720 100 L720 75 L730 75 L730 55 L735 35 ' +
          'L740 55 L750 55 L750 75 L770 75 L770 100 L790 100 L790 120 L830 120 L830 140 ' +
          'L870 140 L870 110 L890 110 L890 85 L900 85 L900 65 L910 65 L910 85 L920 85 ' +
          'L920 110 L950 110 L950 130 L990 130 L990 100 L1010 100 L1010 75 L1020 75 ' +
          'L1020 50 L1025 25 L1030 50 L1040 50 L1040 75 L1060 75 L1060 100 L1090 100 ' +
          'L1090 120 L1120 120 L1120 140 L1160 140 L1160 110 L1180 110 L1180 85 L1190 85 ' +
          'L1190 65 L1200 65 L1200 85 L1220 85 L1220 110 L1250 110 L1250 130 L1300 130 ' +
          'L1300 150 L1350 150 L1350 130 L1380 130 L1380 150 L1440 150 L1440 200 Z'
        }
        fill={color}
        opacity={opacity}
      />
    </svg>
  );
}

/* ── Shield/keyhole security pattern ── */
function KioskSecurityPattern({ color, opacity = 0.08 }: { color: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" style={{ width: '100%', height: '100%', opacity }}>
      <path d="M200 40 L300 90 L300 200 C300 280 200 340 200 340 C200 340 100 280 100 200 L100 90 Z" stroke={color} strokeWidth="1.5" />
      <circle cx="200" cy="160" r="25" stroke={color} strokeWidth="1.5" />
      <path d="M200 185 L190 230 L210 230 Z" stroke={color} strokeWidth="1.5" />
      <line x1="100" y1="90" x2="50" y2="60" stroke={color} strokeWidth="0.8" />
      <line x1="300" y1="90" x2="350" y2="60" stroke={color} strokeWidth="0.8" />
      <line x1="100" y1="200" x2="40" y2="200" stroke={color} strokeWidth="0.8" />
      <line x1="300" y1="200" x2="360" y2="200" stroke={color} strokeWidth="0.8" />
      <circle cx="50" cy="60" r="4" stroke={color} strokeWidth="1" />
      <circle cx="350" cy="60" r="4" stroke={color} strokeWidth="1" />
      <circle cx="40" cy="200" r="4" stroke={color} strokeWidth="1" />
      <circle cx="360" cy="200" r="4" stroke={color} strokeWidth="1" />
      <path d="M160 300 Q200 270 240 300" stroke={color} strokeWidth="0.8" fill="none" />
      <path d="M150 310 Q200 275 250 310" stroke={color} strokeWidth="0.8" fill="none" />
      <path d="M140 320 Q200 280 260 320" stroke={color} strokeWidth="0.8" fill="none" />
      <circle cx="50" cy="340" r="3" stroke={color} strokeWidth="1" />
      <circle cx="350" cy="340" r="3" stroke={color} strokeWidth="1" />
      <line x1="50" y1="340" x2="140" y2="320" stroke={color} strokeWidth="0.5" />
      <line x1="350" y1="340" x2="260" y2="320" stroke={color} strokeWidth="0.5" />
    </svg>
  );
}

// Color palette — matches main site dark theme
const K = {
  bg: '#080D18',
  surface: '#0E1525',
  card: '#172035',
  border: 'rgba(255,255,255,0.07)',
  accent: '#E8560A',
  accentDim: 'rgba(232,86,10,0.12)',
  gold: '#F5A623',
  green: '#00E096',
  red: '#FF4D6D',
  purple: '#A78BFA',
  text: '#DDE6F0',
  muted: '#6B7E96',
  subtle: '#A8B8CC',
};

/* ── Floating security icons grid pattern ── */
function SecurityIconsGrid({ color, opacity = 0.05 }: { color: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 800 600" fill="none" style={{ width: '100%', height: '100%', opacity }}>
      {/* Row 1 — shields & locks */}
      <path d="M80 60 L110 75 L110 110 C110 135 80 150 80 150 C80 150 50 135 50 110 L50 75 Z" stroke={color} strokeWidth="1" />
      <rect x="230" y="65" width="30" height="22" rx="4" stroke={color} strokeWidth="1" />
      <path d="M245 65 L245 55 C245 45 255 45 255 55 L255 65" stroke={color} strokeWidth="1" fill="none" />
      <circle cx="245" cy="78" r="3" fill={color} opacity="0.5" />
      <circle cx="400" cy="80" r="20" stroke={color} strokeWidth="1" />
      <path d="M400 70 L400 85 M393 78 L407 78" stroke={color} strokeWidth="1.2" />
      <path d="M540 60 L570 75 L570 110 C570 135 540 150 540 150 C540 150 510 135 510 110 L510 75 Z" stroke={color} strokeWidth="1" />
      <path d="M530 90 L537 97 L552 82" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M700 65 L700 55 C700 45 720 45 720 55 L720 65" stroke={color} strokeWidth="1" fill="none" />
      <rect x="693" y="65" width="34" height="25" rx="4" stroke={color} strokeWidth="1" />
      {/* Row 2 — fingerprints & keys */}
      <path d="M90 220 Q90 200 110 200 Q130 200 130 220 Q130 240 110 240" stroke={color} strokeWidth="0.8" fill="none" />
      <path d="M95 220 Q95 205 110 205 Q125 205 125 220 Q125 235 110 235" stroke={color} strokeWidth="0.8" fill="none" />
      <path d="M100 220 Q100 210 110 210 Q120 210 120 220 Q120 230 110 230" stroke={color} strokeWidth="0.8" fill="none" />
      <circle cx="250" cy="220" r="8" stroke={color} strokeWidth="1" />
      <line x1="258" y1="220" x2="285" y2="220" stroke={color} strokeWidth="1" />
      <line x1="280" y1="215" x2="280" y2="225" stroke={color} strokeWidth="1" />
      <line x1="275" y1="215" x2="275" y2="220" stroke={color} strokeWidth="1" />
      <rect x="380" y="200" width="40" height="40" rx="6" stroke={color} strokeWidth="1" />
      <circle cx="400" cy="215" r="6" stroke={color} strokeWidth="0.8" />
      <path d="M400 221 L396 235 L404 235 Z" stroke={color} strokeWidth="0.8" fill="none" />
      <path d="M540 200 L540 240 M520 220 L560 220" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <circle cx="540" cy="220" r="15" stroke={color} strokeWidth="0.8" />
      <circle cx="540" cy="220" r="8" stroke={color} strokeWidth="0.5" />
      <circle cx="710" cy="220" r="12" stroke={color} strokeWidth="1" />
      <path d="M710 210 L710 214 M710 226 L710 230 M700 220 L704 220 M716 220 L720 220" stroke={color} strokeWidth="0.8" />
      {/* Row 3 — network & auth */}
      <circle cx="80" cy="380" r="5" fill={color} opacity="0.4" />
      <circle cx="160" cy="360" r="5" fill={color} opacity="0.4" />
      <circle cx="120" cy="410" r="5" fill={color} opacity="0.4" />
      <line x1="80" y1="380" x2="160" y2="360" stroke={color} strokeWidth="0.6" />
      <line x1="80" y1="380" x2="120" y2="410" stroke={color} strokeWidth="0.6" />
      <line x1="160" y1="360" x2="120" y2="410" stroke={color} strokeWidth="0.6" />
      <circle cx="250" cy="380" r="16" stroke={color} strokeWidth="1" />
      <path d="M244 380 L249 385 L258 376" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M400 360 L400 400 M380 380 L420 380" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <rect x="388" y="368" width="24" height="24" rx="12" stroke={color} strokeWidth="1" />
      <path d="M396 380 L400 384 L408 376" stroke={color} strokeWidth="1" fill="none" />
      <path d="M530 370 C530 360 550 360 550 370 L550 375 L530 375 Z" stroke={color} strokeWidth="0.8" fill="none" />
      <rect x="525" y="375" width="30" height="20" rx="3" stroke={color} strokeWidth="0.8" />
      <circle cx="710" cy="380" r="18" stroke={color} strokeWidth="0.8" strokeDasharray="3 3" />
      <circle cx="710" cy="380" r="6" fill={color} opacity="0.3" />
      {/* Scattered dots */}
      <circle cx="320" cy="120" r="2" fill={color} opacity="0.3" />
      <circle cx="640" cy="140" r="2" fill={color} opacity="0.3" />
      <circle cx="180" cy="300" r="2" fill={color} opacity="0.3" />
      <circle cx="460" cy="300" r="2" fill={color} opacity="0.3" />
      <circle cx="620" cy="300" r="2" fill={color} opacity="0.3" />
      <circle cx="350" cy="460" r="2" fill={color} opacity="0.3" />
      <circle cx="600" cy="480" r="2" fill={color} opacity="0.3" />
    </svg>
  );
}

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
  title: string; type: string; checkedIn: boolean; linkedinUrl?: string;
};

type Screen = 'welcome' | 'search' | 'walkin' | 'linkedin' | 'confirm' | 'printing';

const kioskResponsiveCSS = `
@media (max-width: 600px) {
  .kiosk-stats-bar { flex-direction: column; gap: 8px; padding: 8px 12px !important; }
  .kiosk-stats-bar .kiosk-event-info { gap: 6px !important; }
  .kiosk-stats-bar .kiosk-event-info > span:first-child { font-size: 14px !important; }
  .kiosk-stats-bar .kiosk-event-type { display: none !important; }
  .kiosk-stats-row { gap: 12px !important; }
  .kiosk-stats-row > div > div:first-child { font-size: 18px !important; }
  .kiosk-welcome { padding: 20px !important; gap: 20px !important; }
  .kiosk-badge { width: 90px !important; height: 90px !important; }
  .kiosk-welcome-title { font-size: 32px !important; }
  .kiosk-welcome-sub { font-size: 14px !important; }
  .kiosk-welcome-btns { flex-direction: column; gap: 12px !important; margin-top: 8px !important; width: 100%; }
  .kiosk-welcome-btns > button { min-width: 0 !important; padding: 16px 24px !important; width: 100%; }
  .kiosk-welcome-btns .kiosk-btn-title { font-size: 22px !important; }
  .kiosk-modal-content { width: 98% !important; max-height: 95vh !important; border-radius: 14px !important; }
  .kiosk-search-wrap { padding: 12px 14px !important; }
  .kiosk-search-header { gap: 8px !important; margin-bottom: 12px !important; flex-wrap: wrap; }
  .kiosk-search-header > button { padding: 8px 12px !important; font-size: 12px !important; }
  .kiosk-search-header > input { font-size: 16px !important; padding: 12px 14px !important; min-width: 0; }
  .kiosk-attendee-row { flex-direction: column; align-items: stretch !important; padding: 12px !important; gap: 8px !important; }
  .kiosk-attendee-row .kiosk-attendee-name { font-size: 17px !important; }
  .kiosk-attendee-actions { justify-content: flex-end; }
  .kiosk-walkin-wrap { padding: 14px 16px !important; }
  .kiosk-walkin-inner { max-width: 100% !important; }
  .kiosk-walkin-header { flex-direction: column; gap: 8px !important; align-items: flex-start !important; }
  .kiosk-walkin-header h2 { font-size: 22px !important; }
  .kiosk-walkin-name-row { flex-direction: column !important; }
  .kiosk-walkin-input { font-size: 16px !important; padding: 12px !important; }
  .kiosk-confirm-wrap { padding: 20px !important; gap: 16px !important; }
  .kiosk-confirm-check { width: 70px !important; height: 70px !important; }
  .kiosk-confirm-check svg { width: 35px !important; height: 35px !important; }
  .kiosk-confirm-title { font-size: 28px !important; }
  .kiosk-confirm-badge { padding: 20px !important; }
  .kiosk-confirm-name { font-size: 24px !important; }
}
`;

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
  const [confirmedAttendee, setConfirmedAttendee] = useState<{ name: string; company: string; title: string; type: string; linkedinUrl?: string } | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
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
      const att = {
        name: attendee.name, company: attendee.company,
        title: attendee.title, type: attendee.type,
        linkedinUrl: attendee.linkedinUrl,
      };
      setConfirmedAttendee(att);
      setPendingEmail(attendee.email);
      setPrintAfterConfirm(true);
      // If no LinkedIn, ask first; otherwise go straight to confirm
      if (!attendee.linkedinUrl) {
        setScreen('linkedin');
      } else {
        setScreen('confirm');
      }
      return;
    }
    try {
      const result = await api.kioskCheckIn(eventId, attendee.id, kioskToken, stationId);
      setConfirmedAttendee(result.attendee);
      setPendingEmail(attendee.email);
      setPrintAfterConfirm(print);
      // Mark as checked in locally
      setAttendees(prev => prev.map(a => a.id === attendee.id ? { ...a, checkedIn: true } : a));
      setStats(prev => ({ ...prev, checkedIn: prev.checkedIn + (attendee.checkedIn ? 0 : 1) }));
      // If no LinkedIn URL, prompt for it
      if (!result.attendee.linkedinUrl) {
        setScreen('linkedin');
      } else {
        setScreen('confirm');
      }
    } catch {
      setError('Check-in failed. Please try again.');
    }
  };

  const handleWalkIn = async (data: {
    firstName: string; lastName: string; email: string; phone?: string;
    company?: string; title?: string; type?: string; linkedinUrl?: string;
    termsAccepted: boolean; consentEmail: boolean; consentText: boolean; consentDataSharing: boolean;
  }) => {
    try {
      const result = await api.kioskWalkIn(eventId, data, kioskToken);
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      setConfirmedAttendee(result.attendee);
      setPendingEmail(data.email);
      setPrintAfterConfirm(true);
      // Add to local list
      setAttendees(prev => [...prev, {
        id: result.attendee.id, name: fullName, email: data.email,
        company: data.company || '', title: data.title || '', type: data.type || 'enterprise',
        checkedIn: true, linkedinUrl: data.linkedinUrl,
      }]);
      setStats(prev => ({ ...prev, registered: prev.registered + 1, checkedIn: prev.checkedIn + 1 }));
      // If no LinkedIn, prompt for it; otherwise confirm
      if (!data.linkedinUrl) {
        setScreen('linkedin');
      } else {
        setScreen('confirm');
      }
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
      <style dangerouslySetInnerHTML={{ __html: kioskResponsiveCSS }} />
      {/* Stats bar */}
      <div className="kiosk-stats-bar" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px', background: K.surface, borderBottom: `1px solid ${K.border}`,
      }}>
        <div className="kiosk-event-info" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/badge.png" alt="" width="36" height="36" style={{ borderRadius: '50%' }} />
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: K.text }}>
            {eventInfo?.name}
          </span>
          {eventInfo?.eventType && (
            <span className="kiosk-event-type" style={{
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
        <div className="kiosk-stats-row" style={{ display: 'flex', gap: 20 }}>
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

      {/* Main content — Welcome is always rendered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <WelcomeScreen
          eventName={eventInfo?.name || ''}
          onCheckIn={() => { setScreen('search'); resetIdle(); }}
          onWalkIn={() => { setScreen('walkin'); resetIdle(); }}
        />
      </div>

      {/* Modal overlays */}
      {screen === 'search' && (
        <div style={modalOverlayStyle}>
          <div className="kiosk-modal-content" style={modalContentStyle}>
            <SearchScreen
              attendees={attendees}
              onSelect={handleCheckIn}
              onBack={() => setScreen('welcome')}
              error={error}
              onClearError={() => setError('')}
            />
          </div>
        </div>
      )}
      {screen === 'walkin' && (
        <div style={modalOverlayStyle}>
          <div className="kiosk-modal-content" style={modalContentStyle}>
            <WalkInScreen
              onSubmit={handleWalkIn}
              onBack={() => setScreen('welcome')}
              error={error}
              onClearError={() => setError('')}
            />
          </div>
        </div>
      )}
      {screen === 'linkedin' && confirmedAttendee && (
        <div style={modalOverlayStyle}>
          <div className="kiosk-modal-content" style={{ ...modalContentStyle, maxWidth: 700, maxHeight: '92vh' }}>
            <LinkedInPrompt
              attendeeName={confirmedAttendee.name}
              attendeeEmail={pendingEmail}
              kioskToken={kioskToken}
              onDone={(url) => {
                if (url) {
                  setConfirmedAttendee(prev => prev ? { ...prev, linkedinUrl: url } : prev);
                  // Update local attendee list too
                  setAttendees(prev => prev.map(a =>
                    a.email.toLowerCase() === pendingEmail.toLowerCase() ? { ...a, linkedinUrl: url } : a
                  ));
                }
                setScreen('confirm');
              }}
              onSkip={() => setScreen('confirm')}
            />
          </div>
        </div>
      )}
      {screen === 'confirm' && confirmedAttendee && (
        <div style={modalOverlayStyle}>
          <div className="kiosk-modal-content" style={{ ...modalContentStyle, maxWidth: 600, maxHeight: '92vh' }}>
            <ConfirmScreen
              attendee={confirmedAttendee}
              eventName={eventInfo?.name || ''}
              autoPrint={printAfterConfirm}
              onDone={() => { setConfirmedAttendee(null); setPrintAfterConfirm(false); setScreen('welcome'); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const fullScreen: React.CSSProperties = {
  position: 'fixed', inset: 0, background: K.bg, color: K.text,
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  userSelect: 'none', WebkitUserSelect: 'none',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 50,
  background: 'rgba(8,13,24,0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  animation: 'scaleIn 0.2s ease-out',
};

const modalContentStyle: React.CSSProperties = {
  background: K.card,
  border: `1px solid ${K.border}`,
  borderRadius: 20,
  width: '92%', maxWidth: 800, maxHeight: '88vh',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
};

// ── Welcome Screen ──
function WelcomeScreen({ eventName, onCheckIn, onWalkIn }: {
  eventName: string; onCheckIn: () => void; onWalkIn: () => void;
}) {
  return (
    <div className="kiosk-welcome" style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 32, padding: 40,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Security icons grid — full background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <SecurityIconsGrid color={K.accent} opacity={0.06} />
      </div>
      {/* Security shield pattern — left */}
      <div style={{ position: 'absolute', left: '2%', top: '8%', width: 300, height: 300, pointerEvents: 'none' }}>
        <KioskSecurityPattern color={K.accent} opacity={0.08} />
      </div>
      {/* Security shield pattern — right */}
      <div style={{ position: 'absolute', right: '2%', top: '8%', width: 300, height: 300, pointerEvents: 'none' }}>
        <KioskSecurityPattern color={K.gold} opacity={0.05} />
      </div>
      {/* Radial glow — center */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,86,10,.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(232,86,10,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,86,10,.03) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      {/* Skyline at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none' }}>
        <KioskSkyline color={K.accent} opacity={0.14} />
      </div>

      <img className="kiosk-badge" src="/badge.png" alt="Atlanta IAM" width="160" height="160" style={{ borderRadius: '50%', border: `3px solid ${K.accent}44`, position: 'relative', zIndex: 1 }} />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 className="kiosk-welcome-title" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 48, color: K.text, margin: '0 0 8px' }}>
          Welcome
        </h1>
        <p className="kiosk-welcome-sub" style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: K.muted, margin: 0 }}>
          {eventName}
        </p>
      </div>

      <div className="kiosk-welcome-btns" style={{ display: 'flex', gap: 20, marginTop: 16, position: 'relative', zIndex: 1 }}>
        <button onClick={onCheckIn} style={{
          background: `linear-gradient(135deg, ${K.accent}, ${K.purple})`,
          border: 'none', borderRadius: 16, padding: '24px 48px',
          cursor: 'pointer', minWidth: 220,
        }}>
          <div className="kiosk-btn-title" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: '#fff' }}>CHECK IN</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Already registered</div>
        </button>

        <button onClick={onWalkIn} style={{
          background: 'transparent', border: `2px solid ${K.border}`,
          borderRadius: 16, padding: '24px 48px', cursor: 'pointer', minWidth: 220,
        }}>
          <div className="kiosk-btn-title" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: K.text }}>WALK-IN</div>
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
    <div className="kiosk-search-wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 32px', position: 'relative', overflow: 'hidden' }}>
      {/* Background security icons — faded */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }}>
        <SecurityIconsGrid color={K.accent} opacity={0.04} />
      </div>
      <div className="kiosk-search-header" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <button onClick={onBack} style={{
          background: K.surface, border: `1px solid ${K.border}`, borderRadius: 10,
          padding: '10px 20px', cursor: 'pointer',
          fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: K.muted,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}><Icon name="arrow_back" size={16} color={K.muted} /> BACK</button>
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
              className="kiosk-attendee-row"
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
                <div className="kiosk-attendee-name" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: K.text }}>
                  {a.name}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: K.muted }}>
                  {[a.title, a.company].filter(Boolean).join(' — ')}
                </div>
              </div>
              <div className="kiosk-attendee-actions" style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
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
                  <Icon name="print" size={14} color={a.checkedIn ? K.text : '#fff'} />
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
  onSubmit: (data: {
    firstName: string; lastName: string; email: string; phone?: string;
    company?: string; title?: string; type?: string; linkedinUrl?: string;
    termsAccepted: boolean; consentEmail: boolean; consentText: boolean; consentDataSharing: boolean;
  }) => void;
  onBack: () => void; error: string; onClearError: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    company: '', title: '', type: 'enterprise', linkedinUrl: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentEmail, setConsentEmail] = useState(false);
  const [consentText, setConsentText] = useState(false);
  const [consentDataSharing, setConsentDataSharing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const companyDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const termsRef = useRef<HTMLDivElement>(null);
  const [termsScrolled, setTermsScrolled] = useState(false);
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

  const handleTermsScroll = () => {
    const el = termsRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      setTermsScrolled(true);
    }
  };

  const canProceedStep1 = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  const handleSubmit = async () => {
    if (!termsAccepted) return;
    setSubmitting(true);
    await onSubmit({
      ...form,
      termsAccepted,
      consentEmail,
      consentText,
      consentDataSharing,
    });
    setSubmitting(false);
  };

  const iStyle: React.CSSProperties = {
    width: '100%', background: K.surface, border: `1px solid ${K.border}`,
    borderRadius: 10, padding: '14px 16px',
    fontFamily: "'Inter', sans-serif", fontSize: 18, color: K.text, outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
    color: K.muted, letterSpacing: '0.08em', marginBottom: 4, display: 'block',
  };

  const checkboxRow = (checked: boolean, onChange: (v: boolean) => void, label: string) => (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
      fontFamily: "'Inter', sans-serif", fontSize: 14, color: K.text, lineHeight: 1.4,
    }}>
      <input
        type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ marginTop: 3, width: 18, height: 18, accentColor: K.accent, flexShrink: 0 }}
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="kiosk-walkin-wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 40px', overflowY: 'auto', position: 'relative' }}>
      {/* Background security icons */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }}>
        <SecurityIconsGrid color={K.accent} opacity={0.04} />
      </div>
      <div className="kiosk-walkin-inner" style={{ width: '100%', maxWidth: 540, position: 'relative', zIndex: 1 }}>
        <div className="kiosk-walkin-header" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <button onClick={step === 1 ? onBack : () => setStep(1)} style={{
            background: K.surface, border: `1px solid ${K.border}`, borderRadius: 10,
            padding: '10px 20px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: K.muted,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}><Icon name="arrow_back" size={16} color={K.muted} /> BACK</button>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: K.text, margin: 0 }}>
            Walk-In Registration {step === 2 ? '— Terms' : ''}
          </h2>
          <div style={{ marginLeft: 'auto', fontFamily: "'Inter', sans-serif", fontSize: 13, color: K.muted }}>
            Step {step} of 2
          </div>
        </div>

        {error && (
          <div style={{
            background: K.red + '22', border: `1px solid ${K.red}44`, borderRadius: 10,
            padding: '10px 16px', marginBottom: 12,
            fontFamily: "'Inter', sans-serif", fontSize: 14, color: K.red,
          }}>{error}</div>
        )}

        {step === 1 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="kiosk-walkin-name-row" style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>FIRST NAME *</label>
                  <input style={iStyle} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First name" autoFocus />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>LAST NAME *</label>
                  <input style={iStyle} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last name" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>EMAIL *</label>
                <input style={iStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" type="email" />
              </div>
              <div>
                <label style={labelStyle}>PHONE</label>
                <input style={iStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" type="tel" />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>COMPANY</label>
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
                <label style={labelStyle}>TITLE</label>
                <input style={iStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Job title" />
              </div>
              <div>
                <label style={labelStyle}>LINKEDIN (OPTIONAL)</label>
                <input style={iStyle} value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label style={labelStyle}>TYPE</label>
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
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              style={{
                width: '100%', marginTop: 20,
                background: canProceedStep1 ? `linear-gradient(135deg, ${K.accent}, ${K.purple})` : K.surface,
                border: 'none', borderRadius: 12, padding: '16px',
                cursor: canProceedStep1 ? 'pointer' : 'not-allowed',
                fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: '#fff',
                display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center',
              }}
            >
              <Icon name="arrow_forward" size={20} color="#fff" /> NEXT — TERMS & CONDITIONS
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Terms scroll area */}
            <div
              ref={termsRef}
              onScroll={handleTermsScroll}
              style={{
                background: K.surface, border: `1px solid ${K.border}`, borderRadius: 12,
                padding: 20, maxHeight: 220, overflowY: 'auto', marginBottom: 16,
              }}
            >
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: K.text, marginTop: 0, marginBottom: 12 }}>
                Terms & Conditions
              </h3>
              {[
                { title: '1. Who We Are', body: 'The Atlanta IAM User Group is a practitioner-first, vendor-neutral community dedicated to advancing Identity & Access Management knowledge in the Atlanta metropolitan area.' },
                { title: '2. Community Rules', body: 'All presentations must be enterprise-led. Vendor representatives may co-present only alongside an enterprise practitioner.' },
                { title: '3. Data We Collect', body: 'We collect your name, email address, company affiliation, professional title, and relevant certifications upon registration.' },
                { title: '4. How We Use Your Data', body: 'Your data is used to manage event logistics, issue CPE certificates, communicate about upcoming events, and improve our programming.' },
                { title: '5. Sponsor Data Sharing', body: 'Event sponsors may receive access to attendee data based on their sponsorship tier. You may opt in or out of sponsor data sharing at any time.' },
                { title: '6. Your Rights', body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting privacy@atlantaiam.com.' },
                { title: '7. Limitation of Liability', body: 'The Atlanta IAM User Group provides this platform and events on an "as is" basis.' },
                { title: '8. Governing Law', body: 'These terms are governed by the laws of the State of Georgia.' },
              ].map(s => (
                <div key={s.title} style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: K.text }}>{s.title}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: K.muted, lineHeight: 1.5 }}>{s.body}</div>
                </div>
              ))}
            </div>

            {!termsScrolled && (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: K.gold, marginBottom: 8, textAlign: 'center' }}>
                Please scroll to the bottom to continue
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {checkboxRow(termsAccepted, setTermsAccepted, 'I accept the Terms & Conditions and Code of Conduct *')}
              {checkboxRow(consentEmail, setConsentEmail, 'I agree to receive email updates about upcoming events')}
              {checkboxRow(consentText, setConsentText, 'I agree to receive SMS/text notifications')}
              {checkboxRow(consentDataSharing, setConsentDataSharing, 'I consent to sharing my data with event sponsors')}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !termsAccepted}
              style={{
                width: '100%',
                background: termsAccepted ? `linear-gradient(135deg, ${K.accent}, ${K.purple})` : K.surface,
                border: 'none', borderRadius: 12, padding: '16px',
                cursor: termsAccepted ? 'pointer' : 'not-allowed',
                fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: '#fff',
                display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center',
              }}
            >
              <Icon name={submitting ? 'progress_activity' : 'how_to_reg'} size={20} color="#fff" /> {submitting ? 'REGISTERING...' : 'REGISTER & CHECK IN + PRINT NAMETAG'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── LinkedIn Prompt Screen ──
function LinkedInPrompt({ attendeeName, attendeeEmail, kioskToken, onDone, onSkip }: {
  attendeeName: string; attendeeEmail: string; kioskToken: string;
  onDone: (url: string) => void; onSkip: () => void;
}) {
  const [query, setQuery] = useState(attendeeName);
  const [url, setUrl] = useState('');
  const [suggestions, setSuggestions] = useState<{ name: string; url: string; headline: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-search on mount with attendee name
  useEffect(() => {
    searchLinkedin(attendeeName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchLinkedin = async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const result = await api.kioskLinkedinSuggest(q, attendeeEmail, kioskToken);
      setSuggestions(result.suggestions);
    } catch { /* ignore */ }
    setSearching(false);
  };

  // Debounced search as user types
  const handleQueryChange = (val: string) => {
    setQuery(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchLinkedin(val), 400);
  };

  // Generate QR preview when URL changes
  useEffect(() => {
    if (!url) { setQrPreview(null); return; }
    const fullUrl = url.startsWith('http') ? url : `https://www.linkedin.com/in/${url}`;
    QRCode.toDataURL(fullUrl, { width: 160, margin: 1, errorCorrectionLevel: 'M' })
      .then(dataUrl => setQrPreview(dataUrl))
      .catch(() => setQrPreview(null));
  }, [url]);

  const selectSuggestion = (s: { url: string }) => {
    setUrl(s.url);
    inputRef.current?.focus();
  };

  const handleConfirm = async () => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `https://www.linkedin.com/in/${url}`;
    setSaving(true);
    try {
      await api.kioskSaveLinkedin(attendeeEmail, fullUrl, kioskToken);
    } catch { /* save failed, but still proceed with URL for print */ }
    setSaving(false);
    onDone(fullUrl);
  };

  const iStyle: React.CSSProperties = {
    width: '100%', background: K.surface, border: `2px solid ${K.accent}44`,
    borderRadius: 10, padding: '14px 16px',
    fontFamily: "'Inter', sans-serif", fontSize: 18, color: K.text, outline: 'none',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 32px', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }}>
        <SecurityIconsGrid color={K.accent} opacity={0.04} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <Icon name="link" size={28} color={K.accent} />
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: K.text, margin: 0 }}>
          Add Your LinkedIn Profile
        </h2>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: K.muted, margin: '0 0 16px', position: 'relative', zIndex: 1 }}>
        Add your LinkedIn URL to include a QR code on your nametag. Other attendees can scan it to connect with you.
      </p>

      <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>
        {/* Left: Search & Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {/* Search field */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: K.muted, letterSpacing: '0.06em', marginBottom: 4, display: 'block' }}>
              SEARCH BY NAME
            </label>
            <input
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Search your name..."
              style={iStyle}
            />
          </div>

          {/* Suggestions */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {searching && (
              <div style={{ padding: 12, textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: 13, color: K.muted }}>
                <Icon name="progress_activity" size={16} color={K.muted} /> Searching...
              </div>
            )}
            {!searching && suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(s)}
                style={{
                  background: url === s.url ? K.accent + '22' : K.card,
                  border: `1px solid ${url === s.url ? K.accent + '66' : K.border}`,
                  borderRadius: 10, padding: '12px 14px',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: K.text }}>
                  {s.name}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: K.accent, wordBreak: 'break-all' }}>
                  {s.url}
                </div>
                {s.headline && s.headline !== 'Suggested profile URL' && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: K.muted, marginTop: 2 }}>
                    {s.headline}
                  </div>
                )}
                {s.headline === 'Suggested profile URL' && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: K.muted, marginTop: 2, fontStyle: 'italic' }}>
                    Auto-suggested — verify this is correct
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Direct URL input */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: K.muted, letterSpacing: '0.06em', marginBottom: 4, display: 'block' }}>
              OR PASTE YOUR LINKEDIN URL
            </label>
            <input
              ref={inputRef}
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://linkedin.com/in/your-profile"
              style={iStyle}
            />
          </div>
        </div>

        {/* Right: QR Preview */}
        <div style={{
          width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          {qrPreview ? (
            <>
              <div style={{
                padding: 4, border: `3px solid ${K.accent}`,
                borderRadius: 8, background: '#fff',
              }}>
                <img src={qrPreview} alt="QR Preview" style={{ width: 140, height: 140, display: 'block' }} />
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: K.muted, textAlign: 'center' }}>
                QR Code Preview
              </div>
            </>
          ) : (
            <div style={{
              width: 148, height: 148, border: `2px dashed ${K.border}`, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: K.muted, textAlign: 'center' }}>
                QR preview<br />appears here
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, position: 'relative', zIndex: 1 }}>
        <button
          onClick={handleConfirm}
          disabled={!url || saving}
          style={{
            flex: 1,
            background: url ? `linear-gradient(135deg, ${K.accent}, ${K.purple})` : K.surface,
            border: 'none', borderRadius: 12, padding: '14px',
            cursor: url ? 'pointer' : 'not-allowed',
            fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Icon name={saving ? 'progress_activity' : 'qr_code'} size={20} color="#fff" />
          {saving ? 'SAVING...' : 'ADD TO NAMETAG'}
        </button>
        <button
          onClick={onSkip}
          style={{
            background: 'transparent', border: `2px solid ${K.border}`,
            borderRadius: 12, padding: '14px 28px',
            cursor: 'pointer',
            fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: K.muted,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <Icon name="arrow_forward" size={18} color={K.muted} /> SKIP
        </button>
      </div>
    </div>
  );
}

// ── Confirmation Screen ──
function ConfirmScreen({ attendee, eventName, autoPrint, onDone }: {
  attendee: { name: string; company: string; title: string; type: string; linkedinUrl?: string };
  eventName: string; autoPrint: boolean; onDone: () => void;
}) {
  const [printing, setPrinting] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState(autoPrint ? 30 : 10);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Generate QR code on mount if LinkedIn URL available
  useEffect(() => {
    if (attendee.linkedinUrl) {
      QRCode.toDataURL(attendee.linkedinUrl, {
        width: 200,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      }).then(url => setQrDataUrl(url)).catch(() => setQrDataUrl(null));
    }
  }, [attendee.linkedinUrl]);

  // Countdown timer — runs once on mount, no reset mid-flow
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { onDone(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-print if requested (delay slightly longer if QR needs to generate)
  useEffect(() => {
    if (autoPrint) {
      setTimeout(() => printBadge(), attendee.linkedinUrl ? 800 : 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVendorOrSponsor = attendee.type === 'vendor';
  // Label border: red for vendor/sponsor, black for everyone else
  const labelBorderColor = isVendorOrSponsor ? '#D32F2F' : '#111111';
  // QR border matches label border
  const qrBorderColor = isVendorOrSponsor ? '#D32F2F' : '#111111';
  const hasLinkedin = !!attendee.linkedinUrl;

  const printBadge = async () => {
    setPrinting(true);
    setCountdown(30);

    // Generate QR for print only if LinkedIn URL exists
    let printQrDataUrl: string | null = null;
    if (hasLinkedin) {
      printQrDataUrl = qrDataUrl;
      if (!printQrDataUrl) {
        try {
          printQrDataUrl = await QRCode.toDataURL(attendee.linkedinUrl!, {
            width: 300, margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          });
        } catch { /* no QR */ }
      }
    }

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      setPrinting(false);
      return;
    }

    const typeLabel = attendee.type === 'enterprise' ? 'ENTERPRISE' : 'VENDOR';
    const borderColor = isVendorOrSponsor ? '#D32F2F' : '#111111';
    const hasQR = !!printQrDataUrl;
    // DK-2251: 62mm wide continuous roll, auto-cut height
    // Shorter label when no QR code
    const labelHeight = hasQR ? '90mm' : '54mm';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nametag — ${attendee.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Inter:wght@400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: 62mm ${labelHeight}; margin: 0; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
          .nametag {
            width: 62mm; height: ${labelHeight}; padding: 2.5mm 3mm;
            display: flex; flex-direction: column; align-items: center;
            text-align: center; overflow: hidden;
            border: 2.5px solid ${borderColor}; border-radius: 3px;
          }
          .event-name {
            font-family: 'Inter', sans-serif; font-size: 6.5px; font-weight: 700;
            color: #888; letter-spacing: 0.08em; text-transform: uppercase;
            width: 100%; padding-bottom: 1.5mm; margin-bottom: 1mm;
            border-bottom: 0.5px solid #ccc;
          }
          .name {
            font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 28px;
            color: #000; text-transform: uppercase; line-height: 1.05;
            word-break: break-word; max-width: 100%; margin: 1mm 0;
          }
          .title {
            font-family: 'Inter', sans-serif; font-size: 9px; color: #444;
            word-break: break-word; max-width: 100%; margin-top: 0.5mm;
          }
          .company {
            font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 700;
            color: #333; word-break: break-word; max-width: 100%; margin-top: 0.5mm;
          }
          .type-bar {
            margin-top: 1.5mm; padding: 1.5px 10px; border-radius: 2px;
            background: ${borderColor}; color: #fff;
            font-family: 'Inter', sans-serif; font-size: 7px; font-weight: 700;
            letter-spacing: 0.1em;
          }
          .qr-section {
            margin-top: auto; padding-top: 1.5mm;
            display: flex; flex-direction: column; align-items: center;
          }
          .qr-wrap {
            padding: 1.5px; border: 2px solid ${borderColor}; border-radius: 3px;
            display: inline-block; background: #fff;
          }
          .qr-wrap img { display: block; width: 20mm; height: 20mm; }
          .qr-label {
            font-family: 'Inter', sans-serif; font-size: 5.5px; color: #999;
            margin-top: 0.5mm; letter-spacing: 0.05em;
          }
        </style>
      </head>
      <body>
        <div class="nametag">
          <div class="event-name">${eventName}</div>
          <div class="name">${attendee.name}</div>
          ${attendee.title ? `<div class="title">${attendee.title}</div>` : ''}
          ${attendee.company ? `<div class="company">${attendee.company}</div>` : ''}
          <div class="type-bar">${typeLabel}</div>
          ${hasQR ? `
            <div class="qr-section">
              <div class="qr-wrap">
                <img src="${printQrDataUrl}" alt="LinkedIn QR" />
              </div>
              <div class="qr-label">SCAN FOR LINKEDIN</div>
            </div>
          ` : ''}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 600);
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
      className="kiosk-confirm-wrap"
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Skyline at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none' }}>
        <KioskSkyline color={K.green} opacity={0.1} />
      </div>
      {/* Security icons behind */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }}>
        <SecurityIconsGrid color={K.green} opacity={0.04} />
      </div>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,224,150,.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Big checkmark */}
      <div className="kiosk-confirm-check" style={{
        width: 100, height: 100, borderRadius: '50%',
        background: K.green + '22', border: `3px solid ${K.green}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke={K.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="kiosk-confirm-title" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 42, color: K.green, margin: 0 }}>
        You&apos;re Checked In!
      </h1>

      {/* Badge preview */}
      <div className="kiosk-confirm-badge" ref={badgeRef} style={{
        background: '#fff', borderRadius: 12, padding: '24px 32px', minWidth: 280,
        textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: '90%',
        border: `3px solid ${labelBorderColor}`,
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.1em', marginBottom: 6, borderBottom: '1px solid #ddd', paddingBottom: 6 }}>
          {eventName}
        </div>
        <div className="kiosk-confirm-name" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 38, color: '#000', textTransform: 'uppercase', lineHeight: 1.05 }}>
          {attendee.name}
        </div>
        {attendee.title && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#444', marginTop: 4 }}>
            {attendee.title}
          </div>
        )}
        {attendee.company && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#333', fontWeight: 700 }}>
            {attendee.company}
          </div>
        )}
        <div style={{
          marginTop: 10, padding: '5px 0', borderRadius: 4,
          background: labelBorderColor, color: '#fff',
          fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          {attendee.type === 'enterprise' ? 'ENTERPRISE' : 'VENDOR'}
        </div>

        {/* QR Code — only if LinkedIn URL exists */}
        {hasLinkedin && qrDataUrl && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              padding: 3,
              border: `3px solid ${qrBorderColor}`,
              borderRadius: 6,
              display: 'inline-block',
            }}>
              <img src={qrDataUrl} alt="LinkedIn QR" style={{ width: 80, height: 80, display: 'block' }} />
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: '#999', marginTop: 4, letterSpacing: '0.05em' }}>
              SCAN FOR LINKEDIN
            </div>
          </div>
        )}
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
          <Icon name={printing ? 'progress_activity' : 'print'} size={20} color="#fff" />
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#fff' }}>
            {printing ? 'PRINTING...' : 'PRINT NAMETAG'}
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

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: K.muted, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        Screen auto-resets in
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '50%',
          background: K.surface, border: `1.5px solid ${K.border}`,
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, color: K.text,
        }}>
          {countdown}
        </span>
        {countdown === 1 ? 'second' : 'seconds'}
      </p>
    </div>
  );
}
