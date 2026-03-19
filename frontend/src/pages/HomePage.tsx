import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { useEvents } from '../hooks/useEvents';
import type { User, ThemeTokens, Event } from '../types';

/* ── Atlanta Skyline SVG (simplified silhouette) ── */
function AtlantaSkyline({ color, opacity = 0.08 }: { color: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: 100, display: 'block' }}>
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

/* ── Floating identity/security circuit pattern ── */
function SecurityPattern({ T }: { T: ThemeTokens }) {
  const accent = T.accent;
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      style={{
        position: 'absolute',
        width: 400,
        height: 400,
        opacity: T.mode === 'dark' ? 0.12 : 0.05,
        pointerEvents: 'none',
      }}
    >
      {/* Shield */}
      <path d="M200 40 L300 90 L300 200 C300 280 200 340 200 340 C200 340 100 280 100 200 L100 90 Z" stroke={accent} strokeWidth="1.5" />
      {/* Keyhole */}
      <circle cx="200" cy="160" r="25" stroke={accent} strokeWidth="1.5" />
      <path d="M200 185 L190 230 L210 230 Z" stroke={accent} strokeWidth="1.5" />
      {/* Circuit lines */}
      <line x1="100" y1="90" x2="50" y2="60" stroke={accent} strokeWidth="0.8" />
      <line x1="300" y1="90" x2="350" y2="60" stroke={accent} strokeWidth="0.8" />
      <line x1="100" y1="200" x2="40" y2="200" stroke={accent} strokeWidth="0.8" />
      <line x1="300" y1="200" x2="360" y2="200" stroke={accent} strokeWidth="0.8" />
      <circle cx="50" cy="60" r="4" stroke={accent} strokeWidth="1" />
      <circle cx="350" cy="60" r="4" stroke={accent} strokeWidth="1" />
      <circle cx="40" cy="200" r="4" stroke={accent} strokeWidth="1" />
      <circle cx="360" cy="200" r="4" stroke={accent} strokeWidth="1" />
      {/* Fingerprint arcs */}
      <path d="M160 300 Q200 270 240 300" stroke={accent} strokeWidth="0.8" fill="none" />
      <path d="M150 310 Q200 275 250 310" stroke={accent} strokeWidth="0.8" fill="none" />
      <path d="M140 320 Q200 280 260 320" stroke={accent} strokeWidth="0.8" fill="none" />
      {/* Nodes */}
      <circle cx="50" cy="340" r="3" stroke={accent} strokeWidth="1" />
      <circle cx="350" cy="340" r="3" stroke={accent} strokeWidth="1" />
      <line x1="50" y1="340" x2="140" y2="320" stroke={accent} strokeWidth="0.5" />
      <line x1="350" y1="340" x2="260" y2="320" stroke={accent} strokeWidth="0.5" />
    </svg>
  );
}

/* ── Connecting dots/nodes network pattern ── */
function NetworkPattern({ T }: { T: ThemeTokens }) {
  const c = T.accent;
  const o = T.mode === 'dark' ? 0.1 : 0.04;
  return (
    <svg viewBox="0 0 600 120" fill="none" preserveAspectRatio="none"
      style={{ width: '100%', height: 48, display: 'block', opacity: o }}>
      {/* Connection lines */}
      <line x1="60" y1="40" x2="150" y2="70" stroke={c} strokeWidth="1" />
      <line x1="150" y1="70" x2="250" y2="30" stroke={c} strokeWidth="1" />
      <line x1="250" y1="30" x2="350" y2="80" stroke={c} strokeWidth="1" />
      <line x1="350" y1="80" x2="450" y2="50" stroke={c} strokeWidth="1" />
      <line x1="450" y1="50" x2="540" y2="90" stroke={c} strokeWidth="1" />
      <line x1="150" y1="70" x2="350" y2="80" stroke={c} strokeWidth="0.5" strokeDasharray="4 4" />
      <line x1="60" y1="40" x2="250" y2="30" stroke={c} strokeWidth="0.5" strokeDasharray="4 4" />
      {/* Nodes */}
      <circle cx="60" cy="40" r="5" fill={c} opacity="0.3" />
      <circle cx="60" cy="40" r="2" fill={c} />
      <circle cx="150" cy="70" r="5" fill={c} opacity="0.3" />
      <circle cx="150" cy="70" r="2" fill={c} />
      <circle cx="250" cy="30" r="7" fill={c} opacity="0.3" />
      <circle cx="250" cy="30" r="3" fill={c} />
      <circle cx="350" cy="80" r="5" fill={c} opacity="0.3" />
      <circle cx="350" cy="80" r="2" fill={c} />
      <circle cx="450" cy="50" r="6" fill={c} opacity="0.3" />
      <circle cx="450" cy="50" r="2.5" fill={c} />
      <circle cx="540" cy="90" r="5" fill={c} opacity="0.3" />
      <circle cx="540" cy="90" r="2" fill={c} />
    </svg>
  );
}

interface HomePageProps {
  user: User | null;
  onNavigate: (path: string) => void;
  onSignIn: () => void;
  onLogin?: (key: string) => void | Promise<void>;
  onInvite?: () => void;
}

const aboutCards = [
  {
    icon: (color: string) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, stroke: color }}>
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    title: 'Practitioner Community',
    desc: '140+ members across 17 countries. Engineers, architects, and leaders working on real enterprise identity programs.',
  },
  {
    icon: (color: string) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, stroke: color }}>
        <path d="M12 3L22 8.5v7L12 21 2 15.5v-7z" /><path d="M12 12L22 8.5M12 12v9M12 12L2 8.5" />
      </svg>
    ),
    title: 'Quarterly Events',
    desc: 'Deep-dive technical sessions, peer panels, and case studies held quarterly in Atlanta.',
  },
  {
    icon: (color: string) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, stroke: color }}>
        <path d="M12 3L20 7v5c0 5.5-3.8 10.7-8 12C8.8 22.7 4 17.5 4 12V7z" /><path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Vendor Neutral',
    desc: 'Sponsors fund the community but don\'t control the agenda. Every session decided by practitioners, for practitioners.',
  },
  {
    icon: (color: string) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, stroke: color }}>
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <path d="M8.7 10.7l6.6-3.4M8.7 13.3l6.6 3.4" />
      </svg>
    ),
    title: 'Peer-to-Peer Learning',
    desc: 'No slide decks with vendor logos. Just practitioners sharing what works, what doesn\'t, and what they wish they\'d known.',
  },
];

function parseEventDate(dateStr: string): Date {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return new Date(0);
}

function findNextUpcomingEvent(events: Event[]): Event | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // Find the nearest future event
  const upcoming = events
    .filter(e => parseEventDate(e.date) >= now)
    .sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());
  return upcoming[0] || null;
}

export function HomePage({ user, onNavigate, onSignIn, onInvite }: HomePageProps) {
  const { T } = useTheme();
  const { events } = useEvents();
  const nextEvent = findNextUpcomingEvent(events);

  return (
    <div>
      {/* ─── HERO ─── */}
      <section style={{
        background: T.bg,
        padding: '48px 0 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(232,86,10,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,86,10,.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          pointerEvents: 'none',
        }} />
        {/* Glow — top left */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,86,10,.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Glow — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,86,10,.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Security shield pattern — right side */}
        <div style={{ position: 'absolute', right: '5%', top: '10%', pointerEvents: 'none' }}>
          <SecurityPattern T={T} />
        </div>

        <div className="grid-sidebar hero-gap" style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 60,
          alignItems: 'center',
          width: '90%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Left: Content */}
          <div>
            {/* Eyebrow */}
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.28em',
              textTransform: 'uppercase' as const,
              color: T.accent,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{ width: 32, height: 1, background: T.accent, display: 'inline-block' }} />
              IAM Practitioner Community
            </div>

            <h1 style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(52px, 8vw, 100px)',
              color: T.text,
              margin: '0 0 8px',
              lineHeight: 0.95,
              letterSpacing: '0.04em',
              transition: 'color 0.25s',
            }}>
              Atlanta{' '}
              <span style={{ color: T.accent }}>IAM</span>
            </h1>

            <p style={{
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase' as const,
              color: T.muted,
              margin: '0 0 6px',
            }}>
              Advancing Identity Security in Atlanta
            </p>

            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 15,
              color: T.accent,
              letterSpacing: '0.08em',
              marginBottom: 24,
            }}>
              atlantaiam.com
            </div>

            <p style={{
              fontSize: 17,
              color: T.subtle,
              lineHeight: 1.75,
              maxWidth: 520,
              margin: '0 0 24px',
            }}>
              A practitioner-first community for identity and access management professionals
              across the greater Atlanta metro. Peer-to-peer. Vendor-neutral. Quarterly events.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('/events')}
                style={{
                  background: T.accent,
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.06em',
                  padding: '14px 32px',
                  cursor: 'pointer',
                  transition: 'background 0.25s, transform 0.2s',
                }}
              >
                Join Next Event →
              </button>
              <button
                onClick={() => onNavigate('/about')}
                style={{
                  background: 'transparent',
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 8,
                  color: T.text,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: '0.06em',
                  padding: '14px 32px',
                  cursor: 'pointer',
                  transition: 'color 0.25s, border-color 0.25s',
                }}
              >
                About Atlanta IAM
              </button>
            </div>
          </div>

          {/* Right: Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <img
              src="/badge.png"
              alt="Atlanta IAM — Advancing Identity Security"
              style={{
                width: 'clamp(180px, 22vw, 320px)',
                height: 'auto',
                filter: 'drop-shadow(0 0 60px rgba(232,86,10,0.35)) drop-shadow(0 0 20px rgba(232,86,10,0.18))',
                animation: 'badgePulse 4s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Atlanta skyline silhouette at bottom of hero */}
        <div style={{ position: 'relative', marginTop: 20, zIndex: 1 }}>
          <AtlantaSkyline color={T.accent} opacity={T.mode === 'dark' ? 0.14 : 0.07} />
        </div>
      </section>

      {/* ─── NEXT EVENT + QUICK LINKS ─── */}
      <section style={{ padding: '28px 0 24px', width: '90%', margin: '0 auto' }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.26em',
          textTransform: 'uppercase' as const,
          color: T.accent,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          Next Event
          <span style={{ flex: '0 0 40px', height: 1, background: T.accent, display: 'inline-block' }} />
        </div>

        {nextEvent ? (
          <>
            <h2 style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              color: T.text,
              letterSpacing: '0.04em',
              margin: '0 0 12px',
              transition: 'color 0.25s',
            }}>
              {nextEvent.name.split(' ').slice(0, -1).join(' ')}{' '}
              <span style={{ color: T.accent }}>{nextEvent.name.split(' ').slice(-1)}</span>
            </h2>
            <p style={{
              fontSize: 15,
              color: T.muted,
              maxWidth: 560,
              lineHeight: 1.75,
              margin: '0 0 20px',
            }}>
              {nextEvent.date} · {nextEvent.venue}. Sponsored by {nextEvent.sponsors[0]?.name || 'our partners'}.
            </p>

            <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 300px)', gap: 20, alignItems: 'start' }}>
              {/* Left: Event card */}
              <Card style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
                {/* Accent left border */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: `linear-gradient(180deg, ${T.accent}, ${T.accent}66)`,
                  borderRadius: '10px 0 0 10px',
                }} />
                <div style={{ paddingLeft: 12 }}>
                  {/* Date badge */}
                  <div style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: T.accent,
                    padding: '7px 14px',
                    borderRadius: 7,
                    marginBottom: 16,
                  }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase' as const,
                      color: 'rgba(255,255,255,.8)',
                    }}>
                      {nextEvent.date.split(' ')[0]} {nextEvent.date.split(' ').pop()}
                    </span>
                    <span style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1,
                    }}>
                      {nextEvent.date.match(/\d+/)?.[0] || ''}
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 26,
                    fontWeight: 700,
                    color: T.text,
                    letterSpacing: '0.04em',
                    margin: '0 0 5px',
                    transition: 'color 0.25s',
                  }}>
                    {nextEvent.name}
                  </h3>
                  <div style={{ fontSize: 13, color: T.muted, marginBottom: 18 }}>
                    {nextEvent.venue}
                  </div>

                  {/* Sessions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 18 }}>
                    {nextEvent.sessions.map((s, i) => (
                      <div key={s.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 700,
                            fontSize: 11,
                            color: T.muted,
                            minWidth: 56,
                          }}>
                            {s.time}
                          </span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, transition: 'color 0.25s' }}>
                              {s.title}
                            </div>
                            <div style={{ fontSize: 11, color: T.muted }}>{s.speaker}</div>
                          </div>
                        </div>
                        <Pill label={`${s.cpe} CPE`} color={T.accent} size={9} />
                      </div>
                    ))}
                  </div>

                  {/* Featured Speakers */}
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase' as const,
                    color: T.accent,
                    marginBottom: 9,
                  }}>
                    Featured Speakers
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    {nextEvent.sessions.slice(0, 2).map(s => (
                      <div key={s.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 5,
                        fontSize: 13,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
                        <span style={{ color: T.text, fontWeight: 600 }}>{s.speaker.split('—')[0].trim()}</span>
                        {s.speaker.includes('—') && (
                          <span style={{ color: T.muted }}>— {s.speaker.split('—')[1].trim()}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onNavigate('/events')}
                    style={{
                      background: T.accent,
                      border: 'none',
                      borderRadius: 7,
                      color: '#fff',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: '0.06em',
                      padding: '11px 24px',
                      cursor: 'pointer',
                      transition: 'background 0.25s',
                    }}
                  >
                    Register at atlantaiam.com →
                  </button>
                </div>
              </Card>

              {/* Right: Quick Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <SectionLabel text="Quick Links" color={T.accent} />
                <Card>
                  {[
                    { label: 'Submit a Speaking Proposal', path: '/submit-speaking', icon: '→' },
                    { label: 'Become a Sponsor', path: '/submit-sponsor', icon: '→' },
                    { label: 'View Past Events', path: '/events', icon: '→' },
                    { label: 'About Our Community', path: '/about', icon: '→' },
                  ].map((link, i) => (
                    <div
                      key={link.path}
                      onClick={() => link.path.startsWith('/submit') && !user ? onSignIn() : onNavigate(link.path)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '7px 0',
                        borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: T.subtle,
                        transition: 'color 0.25s, border-color 0.25s',
                      }}
                    >
                      {link.label}
                      <span style={{ color: T.accent, fontSize: 14 }}>{link.icon}</span>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              color: T.text,
              letterSpacing: '0.04em',
              margin: '0 0 12px',
              transition: 'color 0.25s',
            }}>
              Next Event <span style={{ color: T.accent }}>Coming Soon</span>
            </h2>
            <Card style={{ maxWidth: 600, padding: '32px 28px', textAlign: 'center' as const }}>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: T.text,
                marginBottom: 10,
                transition: 'color 0.25s',
              }}>
                Our next meetup is in the works
              </div>
              <p style={{
                fontSize: 14,
                color: T.muted,
                lineHeight: 1.7,
                margin: '0 0 20px',
              }}>
                Stay tuned — we're lining up speakers, securing a venue, and planning another great evening
                of identity security conversations. Check back soon or follow us for updates.
              </p>
              <button
                onClick={() => onNavigate('/events')}
                style={{
                  background: T.accent,
                  border: 'none',
                  borderRadius: 7,
                  color: '#fff',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  padding: '11px 24px',
                  cursor: 'pointer',
                  transition: 'background 0.25s',
                }}
              >
                View Past Events →
              </button>
            </Card>
          </>
        )}
      </section>

      {/* ─── Network divider ─── */}
      <NetworkPattern T={T} />

      {/* ─── ABOUT ─── */}
      <section style={{ padding: '24px 0 28px', width: '90%', margin: '0 auto', position: 'relative' }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.26em',
          textTransform: 'uppercase' as const,
          color: T.accent,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          About Atlanta IAM
          <span style={{ flex: '0 0 40px', height: 1, background: T.accent, display: 'inline-block' }} />
        </div>
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 700,
          color: T.text,
          letterSpacing: '0.04em',
          margin: '0 0 12px',
          transition: 'color 0.25s',
        }}>
          Practitioner-First.<br />
          <span style={{ color: T.accent }}>Vendor-Neutral.</span>
        </h2>
        <p style={{
          fontSize: 15,
          color: T.muted,
          maxWidth: 560,
          lineHeight: 1.75,
          margin: '0 0 20px',
        }}>
          Built by and for identity security practitioners. No vendor hype. No sales pitches.
          Just real practitioners solving real problems.
        </p>

        <div className="grid-4col" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}>
          {aboutCards.map(card => (
            <Card key={card.title} style={{ padding: '20px 20px' }}>
              <div style={{
                width: 40,
                height: 40,
                background: T.accentDim,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}>
                {card.icon(T.accent)}
              </div>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: T.text,
                letterSpacing: '0.04em',
                marginBottom: 8,
                transition: 'color 0.25s',
              }}>
                {card.title}
              </div>
              <div style={{
                fontSize: 13,
                color: T.muted,
                lineHeight: 1.65,
              }}>
                {card.desc}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── COMMUNITY RULES + ACTIONS ─── */}
      <section style={{ padding: '0 0 24px', width: '90%', margin: '0 auto' }}>
        <SectionLabel text="Community Rules" color={T.gold} />
        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <Card style={{ borderLeft: `3px solid ${T.accent}` }}>
            <div style={{
              fontWeight: 700,
              fontSize: 12,
              color: T.accent,
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}>
              RULE 01
            </div>
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: T.text,
              margin: '0 0 4px',
              transition: 'color 0.25s',
            }}>
              Enterprise-Led Presentations
            </h3>
            <p style={{
              fontSize: 12,
              color: T.subtle,
              margin: 0,
              lineHeight: 1.6,
            }}>
              Vendors cannot present solo. All sessions must be led by or co-presented with an enterprise practitioner.
            </p>
          </Card>
          <Card style={{ borderLeft: `3px solid ${T.gold}` }}>
            <div style={{
              fontWeight: 700,
              fontSize: 12,
              color: T.gold,
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}>
              RULE 02
            </div>
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: T.text,
              margin: '0 0 4px',
              transition: 'color 0.25s',
            }}>
              Vendor Sponsorships
            </h3>
            <p style={{
              fontSize: 12,
              color: T.subtle,
              margin: 0,
              lineHeight: 1.6,
            }}>
              Sponsors get tiered portal access to consented attendee data. All data sharing requires explicit opt-in.
            </p>
          </Card>
        </div>

        {/* Submit actions */}
        <div className={user && onInvite ? 'grid-3col' : 'grid-2col'} style={{ display: 'grid', gridTemplateColumns: user && onInvite ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 12, marginTop: 16 }}>
          <button
            onClick={() => user ? onNavigate('/submit-speaking') : onSignIn()}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: '16px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.25s, background 0.25s',
            }}
          >
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: T.accent,
              marginBottom: 8,
            }}>
              Call for Speakers
            </div>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: T.text,
              letterSpacing: '0.04em',
              transition: 'color 0.25s',
            }}>
              Submit a Talk →
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
              Share your enterprise IAM experience with the community.
            </div>
          </button>
          <button
            onClick={() => user ? onNavigate('/submit-sponsor') : onSignIn()}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: '16px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.25s, background 0.25s',
            }}
          >
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: T.gold,
              marginBottom: 8,
            }}>
              Sponsorship
            </div>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: T.text,
              letterSpacing: '0.04em',
              transition: 'color 0.25s',
            }}>
              Become a Sponsor →
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
              Support Atlanta's IAM community and reach enterprise practitioners.
            </div>
          </button>
          {/* Invite CTA — shown to logged-in members */}
          {user && onInvite && (
            <button
              onClick={onInvite}
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: '20px 24px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.25s, background 0.25s',
              }}
            >
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                color: T.green,
                marginBottom: 8,
              }}>
                Community
              </div>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: T.text,
                letterSpacing: '0.04em',
                transition: 'color 0.25s',
              }}>
                Invite a Colleague →
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
                Know an IAM practitioner? Send them a personalized invite link.
              </div>
            </button>
          )}
        </div>
      </section>

      {/* ─── Footer skyline ─── */}
      <div style={{ transform: 'scaleY(-1)', opacity: 0.5 }}>
        <AtlantaSkyline color={T.accent} opacity={T.mode === 'dark' ? 0.1 : 0.05} />
      </div>
    </div>
  );
}
