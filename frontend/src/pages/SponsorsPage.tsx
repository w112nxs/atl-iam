import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Icon } from '../components/ui/Icon';

export function SponsorsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { T } = useTheme();

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: 24, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          <h1 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 32,
            color: T.text,
            margin: '0 0 16px',
            transition: 'color 0.25s',
          }}>
            Sponsor Our Community
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: T.subtle,
            lineHeight: 1.7,
            margin: '0 0 12px',
            transition: 'color 0.25s',
          }}>
            The Atlanta IAM User Group brings together enterprise security leaders, architects, and engineers across the greater Atlanta area. Sponsoring our events puts your brand in front of the practitioners who evaluate, select, and implement identity solutions every day.
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: T.subtle,
            lineHeight: 1.7,
            margin: '0 0 28px',
            transition: 'color 0.25s',
          }}>
            We welcome any vendor in the IAM space to sponsor our quarterly meetups, training sessions, and community events. Sponsorship is straightforward — no tiers, no complicated packages. Just meaningful support for the community.
          </p>

          <SectionLabel text="What Sponsors Receive" color={T.gold} />
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { num: '01', title: 'Brand Visibility', desc: 'Your logo on event materials, our website, and communications sent to the community ahead of each event.' },
              { num: '02', title: 'Speaking Opportunity', desc: 'A co-presentation slot alongside an enterprise practitioner — a chance to demonstrate real-world value, not deliver a sales pitch.' },
              { num: '03', title: 'Event Presence', desc: 'A dedicated table or booth at quarterly in-person events to connect directly with attendees during networking breaks.' },
              { num: '04', title: 'Community Recognition', desc: 'Acknowledged as a community supporter across our platform, event announcements, and post-event communications.' },
            ].map(item => (
              <Card key={item.num}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: 24,
                    color: T.gold,
                    lineHeight: 1,
                    transition: 'color 0.25s',
                    flexShrink: 0,
                  }}>
                    {item.num}
                  </span>
                  <div>
                    <h3 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: T.text,
                      margin: '0 0 4px',
                      transition: 'color 0.25s',
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      color: T.subtle,
                      margin: 0,
                      lineHeight: 1.6,
                      transition: 'color 0.25s',
                    }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* How it works */}
          <div style={{ marginTop: 24 }}>
            <SectionLabel text="How It Works" color={T.accent} />
            <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
              {[
                { title: 'Reach Out', desc: 'Submit a sponsorship request or email us directly to start the conversation.', color: T.accent },
                { title: 'Align on Details', desc: 'We\'ll work with you to match your sponsorship with an upcoming event.', color: T.green },
                { title: 'Show Up', desc: 'Be present at the event, connect with practitioners, and support the community.', color: T.purple },
              ].map(v => (
                <Card key={v.title} style={{ borderTop: `2px solid ${v.color}` }}>
                  <h4 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: v.color,
                    margin: '0 0 4px',
                    transition: 'color 0.25s',
                  }}>
                    {v.title}
                  </h4>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: T.subtle,
                    margin: 0,
                    lineHeight: 1.5,
                    transition: 'color 0.25s',
                  }}>
                    {v.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionLabel text="Our Audience" color={T.accent} />
          <Card>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['IAM Architects', 'Security Engineers', 'CISOs & Directors', 'Identity Governance Leads', 'Cloud Security Teams', 'PAM Administrators', 'Compliance Officers'].map(tag => (
                <Pill key={tag} label={tag} color={T.accent} size={9} />
              ))}
            </div>
          </Card>

          <SectionLabel text="Event Formats" color={T.purple} />
          <Card>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['Quarterly Meetups', 'In-Person Training', 'Virtual Webinars', 'Executive Roundtables', 'Certification Study Groups'].map(tag => (
                <Pill key={tag} label={tag} color={T.purple} size={9} />
              ))}
            </div>
          </Card>

          <SectionLabel text="Get Started" color={T.green} />
          <Card accent={T.green}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: T.subtle,
              margin: '0 0 10px',
              lineHeight: 1.5,
              transition: 'color 0.25s',
            }}>
              Ready to support the Atlanta IAM community? Submit a sponsorship request or reach out directly.
            </p>
            <Pill label="hello@atlantaiam.com" color={T.green} size={9} />
            <div
              onClick={() => onNavigate('/get-involved')}
              style={{
                marginTop: 10,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: T.accent,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'color 0.25s',
              }}
            >
              Submit a request <Icon name="arrow_forward" size={14} color={T.accent} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
