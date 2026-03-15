import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';

export function AboutPage() {
  const { T } = useTheme();

  const rules = [
    { num: '01', title: 'Enterprise-Led Presentations', desc: 'All sessions must feature an enterprise practitioner as primary presenter. Vendor representatives may co-present but never deliver solo content.' },
    { num: '02', title: 'Vendor Sponsorships', desc: 'Sponsors support our community through tiered partnerships. In return, they receive structured access to consented attendee data through our Sponsor Portal.' },
    { num: '03', title: 'Authenticated Submissions', desc: 'Speaking proposals and sponsorship requests require authentication. This maintains the quality and accountability of our community interactions.' },
  ];

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 32,
            color: T.text,
            margin: '0 0 16px',
            transition: 'color 0.25s',
          }}>
            Who We Are
          </h1>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 14,
            color: T.subtle,
            lineHeight: 1.7,
            margin: '0 0 12px',
            transition: 'color 0.25s',
          }}>
            The Atlanta IAM User Group is a practitioner-first, vendor-neutral community for Identity & Access Management professionals in the greater Atlanta area. We bring together enterprise security leaders, architects, and engineers to share real-world experiences, discuss emerging trends, and build lasting professional connections.
          </p>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 14,
            color: T.subtle,
            lineHeight: 1.7,
            margin: '0 0 28px',
            transition: 'color 0.25s',
          }}>
            Our events prioritize practitioner voices over vendor pitches. The best IAM insights come from those who implement, manage, and secure identity systems every day — not from product demos or sales presentations.
          </p>

          <SectionLabel text="Community Rules" color={T.accent} />
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rules.map(r => (
              <Card key={r.num}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 24,
                    color: T.accent,
                    lineHeight: 1,
                    transition: 'color 0.25s',
                    flexShrink: 0,
                  }}>
                    {r.num}
                  </span>
                  <div>
                    <h3 style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: T.text,
                      margin: '0 0 4px',
                      transition: 'color 0.25s',
                    }}>
                      {r.title}
                    </h3>
                    <p style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      color: T.subtle,
                      margin: 0,
                      lineHeight: 1.6,
                      transition: 'color 0.25s',
                    }}>
                      {r.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Mission values */}
          <div style={{ marginTop: 24 }}>
            <SectionLabel text="Our Values" color={T.green} />
            <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
              {[
                { title: 'Practitioner-First', desc: 'Real-world knowledge from those in the trenches, not marketing decks.', color: T.accent },
                { title: 'Vendor-Neutral', desc: 'No product pitches. Technology discussions grounded in use cases.', color: T.green },
                { title: 'Community-Driven', desc: 'Topics, formats, and direction shaped by member feedback.', color: T.purple },
              ].map(v => (
                <Card key={v.title} style={{ borderTop: `2px solid ${v.color}` }}>
                  <h4 style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: v.color,
                    margin: '0 0 4px',
                    transition: 'color 0.25s',
                  }}>
                    {v.title}
                  </h4>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
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
          <SectionLabel text="At a Glance" color={T.accent} />
          <Card>
            {[
              { label: 'Founded', value: '2023' },
              { label: 'Location', value: 'Atlanta, GA' },
              { label: 'Events per year', value: '4-6' },
              { label: 'Avg. attendance', value: '80+' },
              { label: 'CPE credits', value: '1 per session' },
            ].map((item, i) => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                transition: 'border-color 0.25s',
              }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: T.muted, transition: 'color 0.25s' }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: T.text, transition: 'color 0.25s' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </Card>

          <SectionLabel text="Focus Areas" color={T.purple} />
          <Card>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['Zero Trust', 'Identity Governance', 'Privileged Access', 'CIAM', 'Passwordless Auth', 'Cloud IAM', 'Identity Security Posture', 'Compliance & Audit', 'Workforce Identity', 'DevSecOps IAM'].map(tag => (
                <Pill key={tag} label={tag} color={T.purple} size={9} />
              ))}
            </div>
          </Card>

          <SectionLabel text="Represented Companies" color={T.gold} />
          <Card>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['Delta Air Lines', 'Home Depot', 'UPS', 'Chick-fil-A', 'Equifax', 'NCR Voyix', 'Wells Fargo', 'Genuine Parts'].map(co => (
                <Pill key={co} label={co} color={T.subtle} size={9} />
              ))}
            </div>
          </Card>

          <SectionLabel text="Contact" color={T.green} />
          <Card>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: T.subtle, lineHeight: 1.8, transition: 'color 0.25s' }}>
              <div>hello@atlantaiam.com</div>
              <div>Atlanta, Georgia</div>
              <div style={{ marginTop: 6 }}>
                <Pill label="LinkedIn" color={T.accent} size={9} />
                {' '}
                <Pill label="Meetup" color={T.red} size={9} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
