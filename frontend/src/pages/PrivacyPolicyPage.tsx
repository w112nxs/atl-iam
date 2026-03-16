import { LegalPageLayout, useLegalStyles } from '../components/layout/LegalPageLayout';

export function PrivacyPolicyPage({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const S = useLegalStyles();
  const { T } = S;

  const sections = [
    {
      id: 'intro',
      title: '1. Introduction',
      content: (
        <>
          <h2 style={S.h2}>1. Introduction</h2>
          <p style={S.p}>
            The Atlanta IAM User Group ("<strong style={S.strong}>Atlanta IAM</strong>," "we," "us," or "our") is a practitioner-first, vendor-neutral community dedicated to advancing Identity & Access Management knowledge in the Atlanta metropolitan area.
          </p>
          <p style={S.p}>
            This Privacy Policy describes how we collect, use, share, and protect your personal information when you use our website at <span style={{ color: T.accent }}>atlantaiam.com</span>, attend our events, or interact with our services including the event check-in kiosk and member directory.
          </p>
          <p style={{ ...S.p, marginBottom: 0 }}>
            By using our services, creating an account, or attending our events, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </>
      ),
    },
    {
      id: 'collection',
      title: '2. Information We Collect',
      content: (
        <>
          <h2 style={S.h2}>2. Information We Collect</h2>
          <h3 style={S.h3}>2.1 Information You Provide</h3>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Account:</strong> Name, email, phone, company, title, user type (enterprise/vendor)</li>
            <li style={S.li}><strong style={S.strong}>Professional:</strong> LinkedIn URL, certifications, work email (vendor verification)</li>
            <li style={S.li}><strong style={S.strong}>Event:</strong> Registrations, session attendance, check-in timestamps</li>
            <li style={S.li}><strong style={S.strong}>Submissions:</strong> Speaking proposals and sponsorship inquiries</li>
            <li style={S.li}><strong style={S.strong}>Consent Choices:</strong> Email, SMS, and sponsor data sharing preferences</li>
          </ul>
          <h3 style={S.h3}>2.2 Automatic Collection</h3>
          <ul style={S.ul}>
            <li style={S.li}>Browser type, OS, screen resolution</li>
            <li style={S.li}>Pages visited, navigation patterns</li>
            <li style={S.li}>Cookies (see Section 8)</li>
          </ul>
          <h3 style={S.h3}>2.3 Third-Party Providers</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            OAuth sign-in (Google, GitHub, LinkedIn) provides us your name, email, and profile picture. We never receive or store your passwords.
          </p>
        </>
      ),
    },
    {
      id: 'usage',
      title: '3. How We Use Your Data',
      content: (
        <>
          <h2 style={S.h2}>3. How We Use Your Data</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={S.tableCellHeader}>Purpose</th>
                <th style={S.tableCellHeader}>Data</th>
                <th style={S.tableCellHeader}>Basis</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Event management', 'Name, email, company', 'Contract'],
                ['Authentication', 'Email, OAuth tokens, passkeys', 'Contract'],
                ['CPE certificates', 'Name, sessions, certs', 'Legitimate interest'],
                ['Directory listing', 'Name, company, title', 'Consent'],
                ['Email updates', 'Email address', 'Consent'],
                ['SMS reminders', 'Phone number', 'Consent'],
                ['Sponsor sharing', 'Name, company, title, email', 'Consent'],
                ['Analytics', 'Aggregate usage', 'Legitimate interest'],
                ['Kiosk check-in', 'Name, company, title', 'Contract'],
              ].map(([p, d, b], i) => (
                <tr key={i}>
                  <td style={S.tableCell}>{p}</td>
                  <td style={S.tableCell}>{d}</td>
                  <td style={S.tableCell}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: 'sponsors',
      title: '4. Sponsor Data Sharing',
      accent: T.gold,
      content: (
        <>
          <h2 style={S.h2}>4. Sponsor Data Sharing</h2>
          <p style={S.p}>
            Sponsors may access attendee data — <strong style={S.strong}>only from attendees who have explicitly opted in</strong>.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <thead>
              <tr><th style={S.tableCellHeader}>Tier</th><th style={S.tableCellHeader}>Data Accessible</th></tr>
            </thead>
            <tbody>
              {[
                ['Gold', 'Name, company, title, email, certs, sessions, CSV export', T.gold],
                ['Silver', 'Name, company, title, certs, sessions', T.subtle],
                ['Community', 'Name, company, session count', T.accent],
              ].map(([tier, data, color], i) => (
                <tr key={i}>
                  <td style={{ ...S.tableCell, fontWeight: 700, color: color as string }}>{tier}</td>
                  <td style={S.tableCell}>{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul style={S.ul}>
            <li style={S.li}>Opt in/out any time from profile settings</li>
            <li style={S.li}>Opted-out attendees are <strong style={S.strong}>never visible</strong> to sponsors</li>
            <li style={S.li}>Sponsor data access expires 12 months after event</li>
          </ul>
        </>
      ),
    },
    {
      id: 'directory',
      title: '5. Directory & Privacy Controls',
      content: (
        <>
          <h2 style={S.h2}>5. Directory & Privacy Controls</h2>
          <p style={S.p}>You control what other members see from your profile:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Listed in Directory</strong> — Appear in member directory</li>
            <li style={S.li}><strong style={S.strong}>Show Email / Phone / LinkedIn</strong> — Granular field visibility</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Name, company, title, and user type are always shown when listed (required for networking). Opt out of the directory entirely for full privacy.
          </p>
        </>
      ),
    },
    {
      id: 'auth',
      title: '6. Authentication & Security',
      content: (
        <>
          <h2 style={S.h2}>6. Authentication & Security</h2>
          <h3 style={S.h3}>OAuth Sign-In</h3>
          <p style={S.p}>
            Google, GitHub, and LinkedIn provide limited profile data. We don't access contacts, posts, or other account data. Connect/disconnect any time.
          </p>
          <h3 style={S.h3}>Passkeys (WebAuthn)</h3>
          <p style={S.p}>
            Passwordless auth via WebAuthn. We store only public keys — never private key material. Register multiple passkeys and revoke from your profile.
          </p>
          <h3 style={S.h3}>Sessions & Kiosk</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            View and revoke active sessions from your profile. The kiosk uses pre-shared tokens; badge printing is local (browser to printer, no server storage). Walk-in registrations follow the same terms/consent flow as web registration.
          </p>
        </>
      ),
    },
    {
      id: 'storage',
      title: '7. Storage & Retention',
      content: (
        <>
          <h2 style={S.h2}>7. Storage & Retention</h2>
          <p style={S.p}>
            Data is stored on Cloudflare's edge network (D1/Workers), encrypted in transit (TLS) and at rest.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={S.tableCellHeader}>Data Type</th><th style={S.tableCellHeader}>Retention</th></tr>
            </thead>
            <tbody>
              {[
                ['Account data', 'Until deletion request'],
                ['Event attendance', 'Anonymized after 3 years'],
                ['Sponsor data access', '12 months from event'],
                ['Auth sessions', 'Auto-expire; revoked = purged'],
                ['Audit logs', '24 months'],
              ].map(([type, retention], i) => (
                <tr key={i}>
                  <td style={{ ...S.tableCell, fontWeight: 600, color: T.text }}>{type}</td>
                  <td style={S.tableCell}>{retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: 'cookies',
      title: '8. Cookies & Local Storage',
      content: (
        <>
          <h2 style={S.h2}>8. Cookies & Local Storage</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <thead>
              <tr><th style={S.tableCellHeader}>Category</th><th style={S.tableCellHeader}>Purpose</th><th style={S.tableCellHeader}>Disable?</th></tr>
            </thead>
            <tbody>
              {[
                ['Essential', 'Auth tokens, theme, consent', 'No', T.muted],
                ['Analytics', 'Usage patterns', 'Yes', T.green],
                ['Marketing', 'Event promotions', 'Yes', T.green],
                ['Personalization', 'Preferences', 'Yes', T.green],
              ].map(([cat, purpose, disable, color], i) => (
                <tr key={i}>
                  <td style={{ ...S.tableCell, fontWeight: 700, color: T.text }}>{cat}</td>
                  <td style={S.tableCell}>{purpose}</td>
                  <td style={{ ...S.tableCell, color: color as string }}>{disable}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ ...S.p, fontSize: 11.5, marginBottom: 0 }}>
            Local storage keys: <code style={{ color: T.accent, fontSize: 10.5 }}>atlanta-iam-token</code>, <code style={{ color: T.accent, fontSize: 10.5 }}>atlanta-iam-theme</code>, <code style={{ color: T.accent, fontSize: 10.5 }}>atlanta-iam-cookies</code>. Never transmitted to third parties.
          </p>
        </>
      ),
    },
    {
      id: 'comms',
      title: '9. Communications',
      content: (
        <>
          <h2 style={S.h2}>9. Communication Preferences</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Email:</strong> Event announcements and community news. Opt-in at registration.</li>
            <li style={S.li}><strong style={S.strong}>SMS:</strong> Event reminders and logistics. Opt-in at registration.</li>
            <li style={S.li}><strong style={S.strong}>Sponsor:</strong> Sponsors with your data (with consent) may contact directly per their own policy.</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Withdraw consent any time without affecting membership. Essential service communications (security alerts, terms updates) may still be sent.
          </p>
        </>
      ),
    },
    {
      id: 'thirdparty',
      title: '10. Third-Party Services',
      content: (
        <>
          <h2 style={S.h2}>10. Third-Party Services</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Cloudflare</strong> — Hosting, CDN, D1 database</li>
            <li style={S.li}><strong style={S.strong}>Google</strong> — OAuth, Google Fonts</li>
            <li style={S.li}><strong style={S.strong}>GitHub</strong> — OAuth authentication</li>
            <li style={S.li}><strong style={S.strong}>LinkedIn</strong> — OAuth authentication</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0, fontWeight: 600, color: T.text }}>
            We do not sell your personal information to any third party.
          </p>
        </>
      ),
    },
    {
      id: 'rights',
      title: '11. Your Rights',
      accent: T.green,
      content: (
        <>
          <h2 style={S.h2}>11. Your Rights</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Access</strong> — Request a copy of your data</li>
            <li style={S.li}><strong style={S.strong}>Correction</strong> — Update inaccurate info via profile or contact</li>
            <li style={S.li}><strong style={S.strong}>Deletion</strong> — Request complete account deletion</li>
            <li style={S.li}><strong style={S.strong}>Portability</strong> — Receive data in machine-readable format</li>
            <li style={S.li}><strong style={S.strong}>Withdraw Consent</strong> — Opt out any time without penalty</li>
            <li style={S.li}><strong style={S.strong}>Restrict / Object</strong> — Limit or object to processing</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Contact <strong style={{ color: T.accent }}>privacy@atlantaiam.com</strong>. We respond within 30 days. No discrimination for exercising rights.
          </p>
        </>
      ),
    },
    {
      id: 'misc',
      title: '12. Additional Provisions',
      content: (
        <>
          <h2 style={S.h2}>12. Additional Provisions</h2>
          <h3 style={S.h3}>Children's Privacy</h3>
          <p style={S.p}>
            Our services are for IAM professionals and not intended for individuals under 18. Contact <strong style={{ color: T.accent }}>privacy@atlantaiam.com</strong> if you believe a minor's data was collected.
          </p>
          <h3 style={S.h3}>Changes to This Policy</h3>
          <p style={S.p}>
            Material changes communicated via email (if opted in) and a website notice. The "Last updated" date indicates the most recent revision.
          </p>
          <h3 style={S.h3}>Limitation of Liability</h3>
          <p style={S.p}>
            Platform and events are provided "as is." Not liable for indirect, incidental, or consequential damages. Total liability limited to fees paid in the preceding 12 months.
          </p>
          <h3 style={S.h3}>Governing Law</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Governed by the laws of the State of Georgia. Disputes resolved in Fulton County courts.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      title: '13. Contact Us',
      accent: T.accent,
      content: (
        <>
          <h2 style={S.h2}>13. Contact Us</h2>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              ['Privacy Inquiries', 'privacy@atlantaiam.com'],
              ['General Contact', 'hello@atlantaiam.com'],
              ['Organization', 'Atlanta IAM User Group'],
              ['Location', 'Atlanta, Georgia, United States'],
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
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information"
      lastUpdated="March 16, 2026"
      sections={sections}
      relatedLinks={[
        { label: 'Terms of Service', note: '', path: '/terms' },
        { label: 'Code of Conduct', note: '', path: '/conduct' },
      ]}
      onNavigate={onNavigate}
    />
  );
}
