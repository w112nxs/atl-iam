import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { events } from '../data/seed';

export function SponsorsPage() {
  const { T } = useTheme();

  const sponsorMap = new Map<string, { name: string; eventCount: number; events: string[] }>();
  events.forEach(evt => {
    evt.sponsors.forEach(sp => {
      const existing = sponsorMap.get(sp.id);
      if (existing) {
        existing.eventCount++;
        existing.events.push(evt.name);
      } else {
        sponsorMap.set(sp.id, { name: sp.name, eventCount: 1, events: [evt.name] });
      }
    });
  });

  const sponsors = Array.from(sponsorMap.values());

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
          <SectionLabel text="Event Sponsors" color={T.gold} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, marginTop: 10 }}>
            {sponsors.map(sp => (
              <Card key={sp.name} accent={T.gold}>
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
            {sponsors.length === 0 && (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted, padding: 20 }}>
                No sponsors yet.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
