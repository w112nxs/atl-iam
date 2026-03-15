import { useTheme } from '../context/ThemeContext';
import { StatBox } from '../components/ui/StatBox';
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

export function HomePage({ user, onNavigate, onSignIn, onLogin }: HomePageProps) {
  const { T } = useTheme();
  const { events } = useEvents();
  const nextEvent = events[0];

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: T.heroGrad,
        padding: '52px 24px 40px',
        textAlign: 'center',
        transition: 'background 0.25s',
      }}>
        {/* Live badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: T.greenDim,
          border: `1px solid ${T.green}44`,
          borderRadius: 20,
          padding: '4px 14px',
          marginBottom: 20,
          transition: 'background 0.25s, border-color 0.25s',
        }}>
          <div style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: T.green,
            animation: 'pulse 2s infinite',
          }} />
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.1em',
            color: T.green,
            transition: 'color 0.25s',
          }}>
            NEXT EVENT — APRIL 15, 2026 · ATLANTA TECH VILLAGE
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(30px, 4.5vw, 48px)',
          color: T.text,
          margin: '0 auto 12px',
          maxWidth: 680,
          lineHeight: 1.08,
          transition: 'color 0.25s',
        }}>
          Atlanta's Premier{' '}
          <span style={{ color: T.accent, transition: 'color 0.25s' }}>Identity & Access</span>{' '}
          Management Forum
        </h1>

        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 15,
          color: T.subtle,
          margin: '0 0 28px',
          fontWeight: 400,
          letterSpacing: '0.02em',
          transition: 'color 0.25s',
        }}>
          Practitioner-first. Enterprise-led. Vendor-neutral.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => user ? onNavigate('/submit-speaking') : onSignIn()}
            style={{
              background: T.accent,
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              padding: '10px 24px',
              cursor: 'pointer',
              transition: 'background 0.25s',
            }}
          >
            SUBMIT A TALK
          </button>
          <button
            onClick={() => user ? onNavigate('/submit-sponsor') : onSignIn()}
            style={{
              background: 'transparent',
              border: `1px solid ${T.accent}`,
              borderRadius: 6,
              color: T.accent,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              padding: '10px 24px',
              cursor: 'pointer',
              transition: 'color 0.25s, border-color 0.25s',
            }}
          >
            BECOME A SPONSOR
          </button>
          <button
            onClick={() => onNavigate('/about')}
            style={{
              background: 'transparent',
              border: `1px solid ${T.muted}44`,
              borderRadius: 6,
              color: T.muted,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              padding: '10px 24px',
              cursor: 'pointer',
              transition: 'color 0.25s, border-color 0.25s',
            }}
          >
            LEARN MORE
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '28px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <StatBox label="Events Hosted" value={14} color={T.accent} />
          <StatBox label="Community Members" value="1.2K+" color={T.green} />
          <StatBox label="Enterprise Speakers" value="40+" color={T.purple} />
          <StatBox label="Sponsor Partners" value={17} color={T.gold} />
        </div>
      </section>

      {/* Main content: 2-column layout */}
      <section style={{ padding: '8px 24px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

          {/* Left: Upcoming Event + Sessions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionLabel text="Next Event" color={T.accent} />
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 19,
                    color: T.text,
                    margin: '0 0 4px',
                    transition: 'color 0.25s',
                  }}>
                    {nextEvent.name}
                  </h3>
                  <div style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 12,
                    color: T.muted,
                    transition: 'color 0.25s',
                  }}>
                    {nextEvent.date} &middot; {nextEvent.venue}
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('/events')}
                  style={{
                    background: T.accentDim,
                    border: `1px solid ${T.accent}44`,
                    borderRadius: 5,
                    color: T.accent,
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                    flexShrink: 0,
                  }}
                >
                  VIEW ALL EVENTS
                </button>
              </div>

              {/* Session list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {nextEvent.sessions.map((s, i) => (
                  <div key={s.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                    transition: 'border-color 0.25s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: 11,
                        color: T.muted,
                        minWidth: 56,
                        transition: 'color 0.25s',
                      }}>
                        {s.time}
                      </span>
                      <div>
                        <div style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: T.text,
                          transition: 'color 0.25s',
                        }}>
                          {s.title}
                        </div>
                        <div style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 11,
                          color: T.muted,
                          transition: 'color 0.25s',
                        }}>
                          {s.speaker}
                        </div>
                      </div>
                    </div>
                    <Pill label={`${s.cpe} CPE`} color={T.accent} size={9} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Community Rules */}
            <SectionLabel text="Community Rules" color={T.gold} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Card style={{ borderLeft: `3px solid ${T.accent}` }}>
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: T.accent,
                  letterSpacing: '0.08em',
                  marginBottom: 6,
                  transition: 'color 0.25s',
                }}>
                  RULE 01
                </div>
                <h3 style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: T.text,
                  margin: '0 0 4px',
                  transition: 'color 0.25s',
                }}>
                  Enterprise-Led Presentations
                </h3>
                <p style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 12,
                  color: T.subtle,
                  margin: 0,
                  lineHeight: 1.6,
                  transition: 'color 0.25s',
                }}>
                  Vendors cannot present solo. All sessions must be led by or co-presented with an enterprise practitioner.
                </p>
              </Card>
              <Card style={{ borderLeft: `3px solid ${T.gold}` }}>
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: T.gold,
                  letterSpacing: '0.08em',
                  marginBottom: 6,
                  transition: 'color 0.25s',
                }}>
                  RULE 02
                </div>
                <h3 style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: T.text,
                  margin: '0 0 4px',
                  transition: 'color 0.25s',
                }}>
                  Vendor Sponsorships
                </h3>
                <p style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 12,
                  color: T.subtle,
                  margin: 0,
                  lineHeight: 1.6,
                  transition: 'color 0.25s',
                }}>
                  Sponsors get tiered portal access to consented attendee data. All data sharing requires explicit opt-in.
                </p>
              </Card>
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
                      fontFamily: "'Poppins', sans-serif",
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
                  fontFamily: "'Poppins', sans-serif",
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

            {/* Quick links */}
            <SectionLabel text="Quick Links" color={T.accent} />
            <Card>
              {[
                { label: 'Submit a Speaking Proposal', path: '/submit-speaking', icon: '\u2192' },
                { label: 'Become a Sponsor', path: '/submit-sponsor', icon: '\u2192' },
                { label: 'View Past Events', path: '/events', icon: '\u2192' },
                { label: 'About Our Community', path: '/about', icon: '\u2192' },
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
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 13,
                    color: T.subtle,
                    transition: 'color 0.25s, border-color 0.25s',
                  }}
                >
                  {link.label}
                  <span style={{ color: T.accent, fontSize: 14, transition: 'color 0.25s' }}>{link.icon}</span>
                </div>
              ))}
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
                          fontFamily: "'Poppins', sans-serif",
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
