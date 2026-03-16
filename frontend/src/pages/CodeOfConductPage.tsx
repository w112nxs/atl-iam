import { LegalPageLayout, useLegalStyles } from '../components/layout/LegalPageLayout';

export function CodeOfConductPage({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const S = useLegalStyles();
  const { T } = S;

  const sections = [
    {
      id: 'pledge',
      title: '1. Our Pledge',
      accent: T.accent,
      content: (
        <>
          <h2 style={S.h2}>1. Our Pledge</h2>
          <p style={S.p}>
            The Atlanta IAM User Group is committed to providing a welcoming, inclusive, and harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.
          </p>
          <p style={{ ...S.p, marginBottom: 0 }}>
            We pledge to act in ways that contribute to an open, welcoming, diverse, and healthy community for all IAM professionals.
          </p>
        </>
      ),
    },
    {
      id: 'standards',
      title: '2. Expected Behavior',
      accent: T.green,
      content: (
        <>
          <h2 style={S.h2}>2. Expected Behavior</h2>
          <p style={S.p}>All community members are expected to:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Be respectful</strong> — Treat all participants with dignity and respect, even in disagreement</li>
            <li style={S.li}><strong style={S.strong}>Be professional</strong> — Conduct yourself as you would at any professional industry event</li>
            <li style={S.li}><strong style={S.strong}>Be inclusive</strong> — Welcome newcomers, use inclusive language, and consider diverse perspectives</li>
            <li style={S.li}><strong style={S.strong}>Be constructive</strong> — Offer constructive feedback and focus on improving the community</li>
            <li style={S.li}><strong style={S.strong}>Be honest</strong> — Accurately represent your role, company, and experience</li>
            <li style={S.li}><strong style={S.strong}>Be collaborative</strong> — Share knowledge openly; this is a peer learning community</li>
          </ul>
        </>
      ),
    },
    {
      id: 'vendor-rules',
      title: '3. Vendor Neutrality',
      accent: T.gold,
      content: (
        <>
          <h2 style={S.h2}>3. Vendor Neutrality Standards</h2>
          <p style={S.p}>
            Atlanta IAM is a practitioner-first community. Our vendor neutrality principles are foundational:
          </p>
          <h3 style={S.h3}>3.1 Presentation Rules</h3>
          <ul style={S.ul}>
            <li style={S.li}>All sessions must be led by an enterprise practitioner</li>
            <li style={S.li}>Vendor co-presenters are welcome but may not present solo</li>
            <li style={S.li}>Content must focus on use cases and outcomes, not product features</li>
            <li style={S.li}>Product logos on slides are acceptable; full product demos are not</li>
          </ul>
          <h3 style={S.h3}>3.2 Networking Conduct</h3>
          <ul style={S.ul}>
            <li style={S.li}>Vendors should not distribute unsolicited marketing materials at events</li>
            <li style={S.li}>Business cards may be exchanged upon mutual interest</li>
            <li style={S.li}>Sales pitches during sessions, panels, or Q&A are prohibited</li>
          </ul>
          <h3 style={S.h3}>3.3 Sponsored Content</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Sponsored sessions or materials are clearly labeled. Sponsors support the community financially but do not control the agenda, speaker selection, or session content.
          </p>
        </>
      ),
    },
    {
      id: 'unacceptable',
      title: '4. Unacceptable Behavior',
      accent: T.red,
      content: (
        <>
          <h2 style={S.h2}>4. Unacceptable Behavior</h2>
          <p style={S.p}>The following behaviors are not tolerated in any community space — online or in person:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Harassment</strong> — Offensive comments, intimidation, stalking, unwelcome photography/recording, or sustained disruption</li>
            <li style={S.li}><strong style={S.strong}>Discrimination</strong> — Exclusionary jokes, slurs, or behavior targeting any protected characteristic</li>
            <li style={S.li}><strong style={S.strong}>Unwelcome advances</strong> — Sexual attention, inappropriate physical contact, or sexually suggestive behavior</li>
            <li style={S.li}><strong style={S.strong}>Misrepresentation</strong> — Falsifying your identity, role, company, or professional credentials</li>
            <li style={S.li}><strong style={S.strong}>Data misuse</strong> — Scraping attendee data, using member directory data for mass solicitation, or violating sponsor data terms</li>
            <li style={S.li}><strong style={S.strong}>Stealth marketing</strong> — Disguising vendor pitches as practitioner content or covertly promoting products</li>
            <li style={S.li}><strong style={S.strong}>Disruption</strong> — Deliberately disrupting sessions, events, or community discussions</li>
            <li style={S.li}><strong style={S.strong}>Retaliation</strong> — Retaliating against anyone who reports a Code of Conduct violation</li>
          </ul>
        </>
      ),
    },
    {
      id: 'events',
      title: '5. Event-Specific Guidelines',
      accent: T.purple,
      content: (
        <>
          <h2 style={S.h2}>5. Event-Specific Guidelines</h2>
          <h3 style={S.h3}>5.1 In-Person Events</h3>
          <ul style={S.ul}>
            <li style={S.li}>Wear your name badge visibly throughout the event</li>
            <li style={S.li}>Respect the venue's rules and facilities</li>
            <li style={S.li}>Be mindful of shared spaces and other attendees' comfort</li>
            <li style={S.li}>Alert event staff if you witness any Code of Conduct violation</li>
          </ul>
          <h3 style={S.h3}>5.2 Sessions & Panels</h3>
          <ul style={S.ul}>
            <li style={S.li}>Ask questions constructively; avoid turning Q&A into product pitches</li>
            <li style={S.li}>Respect session time limits and speaker boundaries</li>
            <li style={S.li}>Do not record sessions without explicit speaker permission</li>
          </ul>
          <h3 style={S.h3}>5.3 Networking</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Networking is a core part of our events. Approach conversations with genuine curiosity. Accept "no" gracefully. Respect that not everyone wants to exchange contact information.
          </p>
        </>
      ),
    },
    {
      id: 'online',
      title: '6. Online Conduct',
      accent: T.accent,
      content: (
        <>
          <h2 style={S.h2}>6. Online Conduct</h2>
          <p style={S.p}>
            These standards apply to all Atlanta IAM online spaces:
          </p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Platform</strong> — atlantaiam.com, member directory, sponsor portal</li>
            <li style={S.li}><strong style={S.strong}>Communications</strong> — Email threads and community announcements</li>
            <li style={S.li}><strong style={S.strong}>Social media</strong> — Posts referencing Atlanta IAM events or community</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            The same respect, professionalism, and vendor neutrality expected in person applies online. Disagreements should remain constructive and focused on ideas, not individuals.
          </p>
        </>
      ),
    },
    {
      id: 'data-ethics',
      title: '7. Data Ethics',
      accent: T.purple,
      content: (
        <>
          <h2 style={S.h2}>7. Data Ethics</h2>
          <p style={S.p}>
            As an IAM community, we hold ourselves to high standards around data handling:
          </p>
          <ul style={S.ul}>
            <li style={S.li}>Respect other members' privacy settings and data sharing choices</li>
            <li style={S.li}>Do not attempt to circumvent privacy controls or access restrictions</li>
            <li style={S.li}>Sponsors must use exported data only as permitted by sponsorship terms</li>
            <li style={S.li}>Report any suspected data breach or misuse immediately</li>
            <li style={S.li}>Do not share other members' personal information without consent</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            As IAM professionals, we understand the value of identity data. Let's lead by example in how we handle it within our own community.
          </p>
        </>
      ),
    },
    {
      id: 'reporting',
      title: '8. Reporting Violations',
      accent: T.green,
      content: (
        <>
          <h2 style={S.h2}>8. Reporting Violations</h2>
          <h3 style={S.h3}>How to Report</h3>
          <p style={S.p}>
            If you experience or witness behavior that violates this Code of Conduct:
          </p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>At events:</strong> Speak to any event staff member or organizer immediately</li>
            <li style={S.li}><strong style={S.strong}>Online:</strong> Email <strong style={{ color: T.accent }}>conduct@atlantaiam.com</strong></li>
            <li style={S.li}><strong style={S.strong}>Anonymous:</strong> Use the anonymous reporting form on our website (coming soon)</li>
          </ul>
          <h3 style={S.h3}>What Happens Next</h3>
          <ul style={S.ul}>
            <li style={S.li}>All reports are reviewed by community organizers within 48 hours</li>
            <li style={S.li}>The reporter's identity is kept confidential</li>
            <li style={S.li}>Both parties may be contacted for additional context</li>
            <li style={S.li}>Appropriate action is taken based on severity</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            We take all reports seriously. Retaliation against reporters is itself a violation and will be treated as such.
          </p>
        </>
      ),
    },
    {
      id: 'enforcement',
      title: '9. Enforcement',
      accent: T.gold,
      content: (
        <>
          <h2 style={S.h2}>9. Enforcement Actions</h2>
          <p style={S.p}>
            Organizers will follow these enforcement guidelines based on the nature and severity of violations:
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={S.tableCellHeader}>Level</th>
                <th style={S.tableCellHeader}>Action</th>
                <th style={S.tableCellHeader}>Applied When</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1. Warning', 'Private verbal or written warning', 'First minor violation'],
                ['2. Temporary Ban', 'Removed from current event; banned from next event', 'Repeated minor or single moderate violation'],
                ['3. Permanent Ban', 'Removed from all community spaces and events', 'Severe violation or pattern of moderate violations'],
                ['4. Report', 'Reported to employer or relevant authority', 'Illegal activity, data breach, or safety threat'],
              ].map(([level, action, when], i) => (
                <tr key={i}>
                  <td style={{ ...S.tableCell, fontWeight: 700, color: T.text, whiteSpace: 'nowrap' }}>{level}</td>
                  <td style={S.tableCell}>{action}</td>
                  <td style={S.tableCell}>{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: 'speakers',
      title: '10. Speaker Responsibilities',
      accent: T.muted,
      content: (
        <>
          <h2 style={S.h2}>10. Speaker Responsibilities</h2>
          <p style={S.p}>Speakers and presenters have additional responsibilities:</p>
          <ul style={S.ul}>
            <li style={S.li}>Ensure content is original or properly attributed</li>
            <li style={S.li}>Disclose any conflicts of interest or vendor affiliations</li>
            <li style={S.li}>Avoid disparaging specific vendors, products, or competitors by name</li>
            <li style={S.li}>Respect the allotted session time</li>
            <li style={S.li}>Be prepared to handle Q&A professionally</li>
            <li style={S.li}>Obtain permission before sharing confidential case study details</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Speakers whose content is found to violate vendor neutrality standards may be asked to modify their presentation or may have their session cancelled.
          </p>
        </>
      ),
    },
    {
      id: 'scope',
      title: '11. Scope',
      accent: T.muted,
      content: (
        <>
          <h2 style={S.h2}>11. Scope</h2>
          <p style={S.p}>
            This Code of Conduct applies to all Atlanta IAM community spaces, including:
          </p>
          <ul style={S.ul}>
            <li style={S.li}>In-person events, workshops, and meetups</li>
            <li style={S.li}>The atlantaiam.com platform and all its features</li>
            <li style={S.li}>Email communications sent through or about Atlanta IAM</li>
            <li style={S.li}>Social media interactions representing or referencing Atlanta IAM</li>
            <li style={S.li}>Informal gatherings connected to Atlanta IAM events</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Community members are expected to uphold these standards whenever they represent or are associated with Atlanta IAM, both online and offline.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      title: '12. Contact',
      accent: T.accent,
      content: (
        <>
          <h2 style={S.h2}>12. Contact</h2>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              ['Conduct Reports', 'conduct@atlantaiam.com'],
              ['General', 'hello@atlantaiam.com'],
              ['Privacy', 'privacy@atlantaiam.com'],
              ['Location', 'Atlanta, Georgia'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: value.includes('@') ? T.accent : T.text }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Code of Conduct"
      subtitle="Behavioral standards for all Atlanta IAM community members, speakers, and sponsors"
      lastUpdated="March 16, 2026"
      sections={sections}
      relatedLinks={[
        { label: 'Terms of Service', note: '', path: '/terms' },
        { label: 'Privacy Policy', note: '', path: '/privacy' },
      ]}
      onNavigate={onNavigate}
    />
  );
}
