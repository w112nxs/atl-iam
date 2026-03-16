import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { events } from '../data/seed';

export function SponsorsPage() {
  const { T } = useTheme();

  const sponsorMap = new Map<string, { name: string; tier: string; eventCount: number; events: string[] }>();
  events.forEach(evt => {
    evt.sponsors.forEach(sp => {
      const existing = sponsorMap.get(sp.id);
      if (existing) {
        existing.eventCount++;
        existing.events.push(evt.name);
      } else {
        sponsorMap.set(sp.id, { name: sp.name, tier: sp.tier, eventCount: 1, events: [evt.name] });
      }
    });
  });

  const sponsors = Array.from(sponsorMap.values());
  const tiers: { label: string; color: string; items: typeof sponsors }[] = [
    { label: 'Gold Sponsors', color: T.gold, items: sponsors.filter(s => s.tier === 'Gold') },
    { label: 'Silver Sponsors', color: T.subtle, items: sponsors.filter(s => s.tier === 'Silver') },
    { label: 'Community Sponsors', color: T.accent, items: sponsors.filter(s => s.tier === 'Community') },
  ];

  const tierBenefits = [
    { tier: 'Gold', color: T.gold, perks: ['Full attendee data (name, company, title, email)', 'Certification details', 'CSV data export', 'Session attendance analytics', 'Priority logo placement'] },
    { tier: 'Silver', color: T.subtle, perks: ['Attendee name, company & title', 'Certification details', 'Session attendance analytics', 'Logo on event page'] },
    { tier: 'Community', color: T.accent, perks: ['Attendee name & company', 'Session attendance count', 'Community recognition'] },
  ];

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        fontSize: 32,
        color: T.text,
        margin: '0 0 20px',
        transition: 'color 0.25s',
      }}>
        Sponsors
      </h1>

      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: 24, alignItems: 'start' }}>
        {/* Main: Sponsor cards */}
        <div>
          {tiers.filter(t => t.items.length > 0).map(tier => (
            <div key={tier.label} style={{ marginBottom: 24 }}>
              <SectionLabel text={tier.label} color={tier.color} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, marginTop: 10 }}>
                {tier.items.map(sp => (
                  <Card key={sp.name} accent={tier.color}>
                    <h3 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: 17,
                      color: T.text,
                      margin: '0 0 6px',
                      transition: 'color 0.25s',
                    }}>
                      {sp.name}
                    </h3>
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: T.muted,
                      marginBottom: 8,
                      transition: 'color 0.25s',
                    }}>
                      {sp.eventCount} event{sp.eventCount !== 1 ? 's' : ''} sponsored
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {sp.events.map(e => (
                        <div key={e} style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: T.subtle,
                          transition: 'color 0.25s',
                        }}>
                          {e}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: Tier benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionLabel text="Sponsorship Tiers" color={T.gold} />
          {tierBenefits.map(tb => (
            <Card key={tb.tier} style={{ borderTop: `2px solid ${tb.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: tb.color,
                  margin: 0,
                  transition: 'color 0.25s',
                }}>
                  {tb.tier}
                </h3>
              </div>
              {tb.perks.map(perk => (
                <div key={perk} style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: T.subtle,
                  padding: '2px 0',
                  display: 'flex',
                  gap: 6,
                  transition: 'color 0.25s',
                }}>
                  <span style={{ color: tb.color, flexShrink: 0 }}>&#10003;</span>
                  {perk}
                </div>
              ))}
            </Card>
          ))}

          <SectionLabel text="Data Privacy" color={T.amber} />
          <Card accent={T.amber}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: T.amber,
              margin: 0,
              lineHeight: 1.6,
              transition: 'color 0.25s',
            }}>
              All sponsor data access requires explicit attendee consent. Opted-out attendees are never visible. Data retention limited to 12 months.
            </p>
          </Card>

          <SectionLabel text="Become a Sponsor" color={T.accent} />
          <Card>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: T.subtle,
              margin: '0 0 10px',
              lineHeight: 1.5,
              transition: 'color 0.25s',
            }}>
              Interested in supporting the Atlanta IAM community? We'd love to hear from you.
            </p>
            <Pill label="Contact us at sponsors@atlantaiam.com" color={T.accent} size={9} />
          </Card>
        </div>
      </div>
    </div>
  );
}
