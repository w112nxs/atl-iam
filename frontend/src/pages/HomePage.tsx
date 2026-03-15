import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { useEvents } from '../hooks/useEvents';
import type { User } from '../types';

interface HomePageProps {
  user: User | null;
  onNavigate: (path: string) => void;
  onSignIn: () => void;
  onLogin: (key: string) => void | Promise<void>;
}

const demoAccounts = [
  { key: 'admin', label: 'Admin', color: 'red' as const },
  { key: 'saviynt', label: 'Saviynt Sponsor', color: 'gold' as const },
  { key: 'cyberark', label: 'CyberArk Sponsor', color: 'gold' as const },
  { key: 'member', label: 'Member', color: 'accent' as const },
];

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

export function HomePage({ user, onNavigate, onSignIn, onLogin }: HomePageProps) {
  const { T } = useTheme();
  const { events } = useEvents();
  const nextEvent = events[0];

  return (
    <div>
      {/* ─── HERO ─── */}
      <section style={{
        background: T.bg,
        padding: '80px 0 60px',
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
        {/* Glow */}
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

        <div className="grid-sidebar" style={{
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
              margin: '0 0 36px',
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
      </section>

      {/* ─── STATS STRIP ─── */}
      <section style={{
        background: T.card,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        padding: '28px 0',
        transition: 'background 0.25s, border-color 0.25s',
      }}>
        <div className="grid-4col" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          width: '90%',
          margin: '0 auto',
        }}>
          {[
            { num: '140+', label: 'Members' },
            { num: '17', label: 'Countries' },
            { num: 'Q2', label: '2026 Event' },
            { num: '100%', label: 'Vendor Neutral' },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              textAlign: 'center',
              padding: '0 16px',
              borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
              transition: 'border-color 0.25s',
            }}>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 'clamp(28px, 3vw, 38px)',
                fontWeight: 700,
                color: T.accent,
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}>
                {stat.num}
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                color: T.muted,
                marginTop: 4,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NEXT EVENT ─── */}
      <section style={{ padding: '48px 0', width: '90%', margin: '0 auto' }}>
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
          margin: '0 0 32px',
        }}>
          {nextEvent.date} · {nextEvent.venue}. Sponsored by {nextEvent.sponsors[0]?.name || 'our partners'}.
        </p>

        <Card style={{ maxWidth: 840, position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
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
      </section>

      {/* ─── ABOUT ─── */}
      <section style={{ padding: '48px 0 56px', width: '90%', margin: '0 auto' }}>
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
          margin: '0 0 32px',
        }}>
          Built by and for identity security practitioners. No vendor hype. No sales pitches.
          Just real practitioners solving real problems.
        </p>

        <div className="grid-2col" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}>
          {aboutCards.map(card => (
            <Card key={card.title} style={{ padding: '28px 24px' }}>
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

      {/* ─── SIDEBAR CONTENT ─── */}
      <section style={{ padding: '0 0 48px', width: '90%', margin: '0 auto' }}>
        <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

          {/* Left: Community rules + quick actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionLabel text="Community Rules" color={T.gold} />
            <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
            <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
              <button
                onClick={() => user ? onNavigate('/submit-speaking') : onSignIn()}
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
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Sponsors preview */}
            <SectionLabel text="Event Sponsors" color={T.gold} />
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nextEvent.sponsors.map(sp => (
                  <div key={sp.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.text,
                      transition: 'color 0.25s',
                    }}>
                      {sp.name}
                    </span>
                    <Pill
                      label={sp.tier}
                      color={sp.tier === 'Gold' ? T.gold : sp.tier === 'Silver' ? T.subtle : T.accent}
                      size={9}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('/sponsors')}
                style={{
                  background: 'transparent',
                  border: `1px solid ${T.border}`,
                  borderRadius: 5,
                  color: T.muted,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  padding: '5px 0',
                  cursor: 'pointer',
                  transition: 'color 0.25s, border-color 0.25s',
                  width: '100%',
                  marginTop: 10,
                }}
              >
                VIEW ALL SPONSORS
              </button>
            </Card>

            {/* Focus areas */}
            <SectionLabel text="Focus Areas" color={T.purple} />
            <Card>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Zero Trust', 'IGA', 'PAM', 'CIAM', 'Passwordless', 'Cloud IAM', 'Identity Security', 'Compliance'].map(tag => (
                  <Pill key={tag} label={tag} color={T.purple} size={9} />
                ))}
              </div>
            </Card>

            {/* Quick links */}
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

            {/* Demo accounts */}
            {!user && (
              <>
                <SectionLabel text="Demo Accounts" color={T.muted} />
                <Card>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {demoAccounts.map(acc => (
                      <button
                        key={acc.key}
                        onClick={() => onLogin(acc.key)}
                        style={{
                          background: T[acc.color] + '12',
                          border: `1px solid ${T[acc.color]}33`,
                          borderRadius: 6,
                          color: T[acc.color],
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: '0.04em',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                          textAlign: 'left',
                        }}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
