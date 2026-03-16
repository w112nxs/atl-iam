import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';

export function PrivacyPolicyPage() {
  const { T } = useTheme();

  const h2Style: React.CSSProperties = {
    fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22,
    color: T.accent, margin: '0 0 10px', letterSpacing: '0.02em',
  };

  const h3Style: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
    color: T.text, margin: '0 0 6px',
  };

  const pStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.subtle,
    lineHeight: 1.7, margin: '0 0 14px',
  };

  const liStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.subtle,
    lineHeight: 1.7, marginBottom: 4,
  };

  const ulStyle: React.CSSProperties = {
    margin: '6px 0 14px', paddingLeft: 20,
  };

  const tableCell: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.subtle,
    padding: '8px 12px', borderBottom: `1px solid ${T.border}`,
    verticalAlign: 'top',
  };

  const tableCellHeader: React.CSSProperties = {
    ...tableCell, fontWeight: 700, color: T.text, fontSize: 11,
    letterSpacing: '0.06em', textTransform: 'uppercase',
  };

  return (
    <div style={{ width: '90%', maxWidth: 860, margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10,
          letterSpacing: '0.26em', textTransform: 'uppercase',
          color: T.accent, marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          Legal
          <span style={{ flex: '0 0 40px', height: 1, background: T.accent, display: 'inline-block' }} />
        </div>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          fontSize: 'clamp(32px, 5vw, 48px)', color: T.text,
          margin: '0 0 8px', letterSpacing: '0.04em',
        }}>
          Privacy Policy
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted, margin: 0,
        }}>
          Last updated: March 16, 2026 &middot; Effective immediately
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 1. Introduction */}
        <Card>
          <h2 style={h2Style}>1. Introduction</h2>
          <p style={pStyle}>
            The Atlanta IAM User Group ("<strong style={{ color: T.text }}>Atlanta IAM</strong>," "we," "us," or "our") is a practitioner-first, vendor-neutral community dedicated to advancing Identity & Access Management knowledge in the Atlanta metropolitan area. We are committed to protecting the privacy and security of our members, event attendees, and website visitors.
          </p>
          <p style={pStyle}>
            This Privacy Policy describes how we collect, use, share, and protect your personal information when you use our website at <span style={{ color: T.accent }}>atlantaiam.com</span>, attend our events, or interact with our services, including the event check-in kiosk system and member directory.
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            By using our services, creating an account, or attending our events, you acknowledge that you have read and understood this Privacy Policy. If you do not agree, please do not use our services.
          </p>
        </Card>

        {/* 2. Information We Collect */}
        <Card>
          <h2 style={h2Style}>2. Information We Collect</h2>

          <h3 style={h3Style}>2.1 Information You Provide</h3>
          <p style={pStyle}>When you register for an account, attend events, or use our platform, we may collect:</p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong style={{ color: T.text }}>Account Information:</strong> First name, last name, email address, phone number, company/organization, professional title, and user type (enterprise or vendor)</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Professional Details:</strong> LinkedIn profile URL, professional certifications, and work email (for vendor verification)</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Event Data:</strong> Event registrations, session attendance, check-in timestamps, and check-in station identifiers</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Submissions:</strong> Speaking proposals, sponsorship inquiries, and related content</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Communication Preferences:</strong> Your consent choices for email updates, SMS notifications, and sponsor data sharing</li>
          </ul>

          <h3 style={h3Style}>2.2 Information Collected Automatically</h3>
          <p style={pStyle}>When you visit our website, we may automatically collect:</p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong style={{ color: T.text }}>Device Information:</strong> Browser type, operating system, and screen resolution</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Usage Data:</strong> Pages visited, time spent, and navigation patterns</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Cookies:</strong> Essential, analytics, marketing, and personalization cookies (see Section 8)</li>
          </ul>

          <h3 style={h3Style}>2.3 Information from Third Parties</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            When you sign in using OAuth providers (Google, GitHub, or LinkedIn), we receive your name, email address, and profile picture from those services. We do not receive or store your passwords from these providers.
          </p>
        </Card>

        {/* 3. How We Use Your Information */}
        <Card>
          <h2 style={h2Style}>3. How We Use Your Information</h2>
          <p style={pStyle}>We use your information for the following purposes:</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
            <thead>
              <tr>
                <th style={tableCellHeader}>Purpose</th>
                <th style={tableCellHeader}>Data Used</th>
                <th style={tableCellHeader}>Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Event management & logistics', 'Name, email, company, attendance', 'Contractual necessity'],
                ['Account authentication', 'Email, OAuth tokens, passkey credentials', 'Contractual necessity'],
                ['CPE certificate issuance', 'Name, session attendance, certifications', 'Legitimate interest'],
                ['Member directory listing', 'Name, company, title, type (if opted in)', 'Consent'],
                ['Email event updates', 'Email address', 'Consent'],
                ['SMS event reminders', 'Phone number', 'Consent'],
                ['Sponsor data sharing', 'Name, company, title, email (tiered)', 'Consent'],
                ['Analytics & improvement', 'Aggregate usage patterns', 'Legitimate interest'],
                ['Kiosk check-in & badge printing', 'Name, company, title, type', 'Contractual necessity'],
              ].map(([purpose, data, basis], i) => (
                <tr key={i}>
                  <td style={tableCell}>{purpose}</td>
                  <td style={tableCell}>{data}</td>
                  <td style={tableCell}>{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* 4. Sponsor Data Sharing */}
        <Card style={{ borderLeft: `3px solid ${T.gold}` }}>
          <h2 style={h2Style}>4. Sponsor Data Sharing</h2>
          <p style={pStyle}>
            Event sponsors support the Atlanta IAM community through tiered partnerships. In return, they may receive access to attendee data — <strong style={{ color: T.text }}>but only from attendees who have explicitly opted in</strong>.
          </p>

          <h3 style={h3Style}>4.1 Sponsorship Tiers & Data Access</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
            <thead>
              <tr>
                <th style={tableCellHeader}>Tier</th>
                <th style={tableCellHeader}>Data Accessible</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Gold', 'Name, company, title, email, certifications, session attendance, CSV export'],
                ['Silver', 'Name, company, title, certifications, session attendance'],
                ['Community', 'Name, company, session attendance count'],
              ].map(([tier, data], i) => (
                <tr key={i}>
                  <td style={{ ...tableCell, fontWeight: 700, color: tier === 'Gold' ? T.gold : tier === 'Silver' ? T.subtle : T.accent }}>
                    {tier}
                  </td>
                  <td style={tableCell}>{data}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={h3Style}>4.2 Your Controls</h3>
          <ul style={ulStyle}>
            <li style={liStyle}>You may opt in or out of sponsor data sharing at any time during registration or from your profile settings</li>
            <li style={liStyle}>Opted-out attendees are <strong style={{ color: T.text }}>never visible</strong> to sponsors under any tier</li>
            <li style={liStyle}>Withdrawing consent does not affect your membership status or event access</li>
            <li style={liStyle}>Sponsors see an anonymized count of opted-out attendees but no identifying information</li>
          </ul>

          <h3 style={h3Style}>4.3 Data Retention for Sponsors</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Sponsor access to attendee data is limited to 12 months from the event date. After this period, data is automatically removed from sponsor-accessible views.
          </p>
        </Card>

        {/* 5. Member Directory & Privacy Controls */}
        <Card>
          <h2 style={h2Style}>5. Member Directory & Privacy Controls</h2>
          <p style={pStyle}>
            Atlanta IAM maintains a member directory to facilitate professional networking. You have granular control over what information is visible to other members.
          </p>

          <h3 style={h3Style}>5.1 Directory Privacy Settings</h3>
          <p style={pStyle}>You can control the following visibility settings from your profile:</p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong style={{ color: T.text }}>Listed in Directory</strong> — Whether you appear in the member directory at all</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Show Email</strong> — Whether your email is visible to other members</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Show Phone</strong> — Whether your phone number is visible</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Show LinkedIn</strong> — Whether your LinkedIn URL is visible</li>
          </ul>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Your name, company, title, and user type are always visible when listed in the directory, as they are essential for professional networking purposes. If you prefer complete privacy, you may opt out of the directory entirely.
          </p>
        </Card>

        {/* 6. Authentication & Security */}
        <Card>
          <h2 style={h2Style}>6. Authentication & Security</h2>

          <h3 style={h3Style}>6.1 OAuth Sign-In</h3>
          <p style={pStyle}>
            We support sign-in through Google, GitHub, and LinkedIn. When you authenticate via these providers, we receive limited profile information (name, email, profile picture). We do not access your contacts, posts, or other account data. You can connect or disconnect providers at any time from your profile.
          </p>

          <h3 style={h3Style}>6.2 Passkeys (WebAuthn)</h3>
          <p style={pStyle}>
            We support passwordless authentication via passkeys using the WebAuthn standard. Passkey credentials are stored as public keys — we never have access to your private key material. You can register multiple passkeys and revoke any credential from your profile.
          </p>

          <h3 style={h3Style}>6.3 Session Management</h3>
          <p style={pStyle}>
            You can view all active sessions and revoke any session from your profile. Sessions are identified by device and login time. You may revoke all other sessions at once for security purposes.
          </p>

          <h3 style={h3Style}>6.4 Kiosk System</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Our event check-in kiosk uses pre-shared tokens for authentication. The kiosk displays attendee names and company affiliations for check-in purposes. Badge printing occurs locally — badge data is rendered in the browser and sent directly to the printer; it is not stored on any server. Walk-in registrations at the kiosk create a full user account following the same terms acceptance and consent collection flow as web registration.
          </p>
        </Card>

        {/* 7. Data We Store */}
        <Card>
          <h2 style={h2Style}>7. Data Storage & Retention</h2>

          <h3 style={h3Style}>7.1 Where We Store Your Data</h3>
          <p style={pStyle}>
            Your data is stored on Cloudflare's global edge network using Cloudflare D1 (SQLite-based database) and Cloudflare Workers. Data is encrypted in transit (TLS) and at rest.
          </p>

          <h3 style={h3Style}>7.2 Retention Periods</h3>
          <ul style={ulStyle}>
            <li style={liStyle}><strong style={{ color: T.text }}>Account data:</strong> Retained as long as your account is active. Deleted upon account deletion request.</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Event attendance:</strong> Retained for CPE tracking and community records. Historical attendance is anonymized after 3 years.</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Sponsor data access:</strong> Limited to 12 months from event date.</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Authentication sessions:</strong> Expire automatically. Revoked sessions are purged immediately.</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Audit logs:</strong> Data exports and sponsor access are logged for 24 months.</li>
          </ul>

          <h3 style={h3Style}>7.3 Profile Staleness</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            If your profile has not been updated in over one year, we will prompt you to confirm or update your information to ensure accuracy. This is a reminder only — no data is modified without your action.
          </p>
        </Card>

        {/* 8. Cookies */}
        <Card>
          <h2 style={h2Style}>8. Cookies & Local Storage</h2>
          <p style={pStyle}>
            We use cookies and browser local storage to operate our website and improve your experience. You can manage your cookie preferences at any time using the cookie settings banner.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
            <thead>
              <tr>
                <th style={tableCellHeader}>Category</th>
                <th style={tableCellHeader}>Purpose</th>
                <th style={tableCellHeader}>Can Disable?</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Essential', 'Authentication tokens, theme preference, cookie consent choice', 'No'],
                ['Analytics', 'Understand how visitors interact with our website', 'Yes'],
                ['Marketing', 'Deliver relevant event promotions and track campaigns', 'Yes'],
                ['Personalization', 'Remember your preferences and customize your experience', 'Yes'],
              ].map(([cat, purpose, disable], i) => (
                <tr key={i}>
                  <td style={{ ...tableCell, fontWeight: 700, color: T.text }}>{cat}</td>
                  <td style={tableCell}>{purpose}</td>
                  <td style={{ ...tableCell, color: disable === 'No' ? T.muted : T.green }}>{disable}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={h3Style}>8.1 Local Storage</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            We use browser local storage (not cookies) for: authentication tokens (<code style={{ fontSize: 11, color: T.accent }}>atlanta-iam-token</code>), theme preference (<code style={{ fontSize: 11, color: T.accent }}>atlanta-iam-theme</code>), and cookie consent preferences (<code style={{ fontSize: 11, color: T.accent }}>atlanta-iam-cookies</code>). This data never leaves your browser and is not transmitted to third parties.
          </p>
        </Card>

        {/* 9. Communication */}
        <Card>
          <h2 style={h2Style}>9. Communication Preferences</h2>
          <p style={pStyle}>We offer three types of optional communications:</p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong style={{ color: T.text }}>Email Updates:</strong> Event announcements, community news, and programming updates. Opt-in during registration; manage from your profile.</li>
            <li style={liStyle}><strong style={{ color: T.text }}>SMS/Text Notifications:</strong> Event reminders and day-of logistics. Opt-in during registration; manage from your profile.</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Sponsor Communications:</strong> Sponsors who receive your data (with consent) may contact you directly. This is governed by each sponsor's own privacy policy.</li>
          </ul>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            You may withdraw consent for any communication type at any time without affecting your membership or event access. Essential service communications (e.g., security alerts, terms updates) may still be sent regardless of preferences.
          </p>
        </Card>

        {/* 10. Third-Party Services */}
        <Card>
          <h2 style={h2Style}>10. Third-Party Services</h2>
          <p style={pStyle}>We use the following third-party services:</p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong style={{ color: T.text }}>Cloudflare:</strong> Website hosting, CDN, DDoS protection, and database (D1). <span style={{ color: T.muted }}>cloudflare.com/privacypolicy</span></li>
            <li style={liStyle}><strong style={{ color: T.text }}>Google:</strong> OAuth authentication provider. <span style={{ color: T.muted }}>policies.google.com/privacy</span></li>
            <li style={liStyle}><strong style={{ color: T.text }}>GitHub:</strong> OAuth authentication provider. <span style={{ color: T.muted }}>docs.github.com/privacy</span></li>
            <li style={liStyle}><strong style={{ color: T.text }}>LinkedIn:</strong> OAuth authentication provider. <span style={{ color: T.muted }}>linkedin.com/legal/privacy-policy</span></li>
            <li style={liStyle}><strong style={{ color: T.text }}>Google Fonts:</strong> Typography delivery (Rajdhani, Inter, Space Mono). <span style={{ color: T.muted }}>fonts.google.com/about</span></li>
          </ul>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            We do not sell your personal information to any third party.
          </p>
        </Card>

        {/* 11. Your Rights */}
        <Card style={{ borderLeft: `3px solid ${T.green}` }}>
          <h2 style={h2Style}>11. Your Rights</h2>
          <p style={pStyle}>You have the following rights regarding your personal data:</p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong style={{ color: T.text }}>Access:</strong> Request a copy of all personal data we hold about you</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Correction:</strong> Update or correct any inaccurate information via your profile or by contacting us</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Deletion:</strong> Request complete deletion of your account and associated data</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Portability:</strong> Request your data in a machine-readable format</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Withdraw Consent:</strong> Opt out of sponsor data sharing, email, or SMS at any time without penalty</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Restrict Processing:</strong> Request that we limit how we use your data</li>
            <li style={liStyle}><strong style={{ color: T.text }}>Object:</strong> Object to processing based on legitimate interests</li>
          </ul>
          <p style={pStyle}>
            To exercise any of these rights, contact us at <strong style={{ color: T.accent }}>privacy@atlantaiam.com</strong>. We will respond within 30 days.
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            You will not be discriminated against for exercising any privacy right. Withdrawing consent will not affect services that do not require the withdrawn consent.
          </p>
        </Card>

        {/* 12. Children */}
        <Card>
          <h2 style={h2Style}>12. Children's Privacy</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Our services are designed for IAM professionals and are not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected data from a minor, please contact us at <strong style={{ color: T.accent }}>privacy@atlantaiam.com</strong> and we will promptly delete it.
          </p>
        </Card>

        {/* 13. Changes */}
        <Card>
          <h2 style={h2Style}>13. Changes to This Policy</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Material changes will be communicated via email (if you have opted in) and a prominent notice on our website. The "Last updated" date at the top of this policy indicates when it was most recently revised. Continued use of our services after changes constitutes acceptance of the updated policy.
          </p>
        </Card>

        {/* 14. Limitation of Liability */}
        <Card>
          <h2 style={h2Style}>14. Limitation of Liability</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            The Atlanta IAM User Group provides this platform and events on an "as is" basis. We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from use of this platform, attendance at events, or reliance on any information provided. Our total liability shall not exceed the fees paid by you (if any) in the 12 months preceding the claim.
          </p>
        </Card>

        {/* 15. Governing Law */}
        <Card>
          <h2 style={h2Style}>15. Governing Law</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            This Privacy Policy is governed by the laws of the State of Georgia, United States. Any disputes arising from this policy shall be resolved exclusively in the state or federal courts located in Fulton County, Georgia. By using our services, you consent to the jurisdiction of these courts.
          </p>
        </Card>

        {/* 16. Contact */}
        <Card style={{ borderLeft: `3px solid ${T.accent}` }}>
          <h2 style={h2Style}>16. Contact Us</h2>
          <p style={pStyle}>
            If you have questions about this Privacy Policy, your personal data, or wish to exercise any of your rights, please contact us:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Privacy Inquiries', 'privacy@atlantaiam.com'],
              ['General Contact', 'hello@atlantaiam.com'],
              ['Organization', 'Atlanta IAM User Group'],
              ['Location', 'Atlanta, Georgia, United States'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 12 }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
                  color: T.muted, minWidth: 130,
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 12,
                  color: value.includes('@') ? T.accent : T.text,
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Navigation aid */}
        <SectionLabel text="Related" color={T.muted} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Terms of Service', note: 'Presented during registration' },
            { label: 'Code of Conduct', note: 'Community behavioral standards' },
            { label: 'Sponsor Portal Guide', note: 'How sponsor data access works' },
          ].map(item => (
            <div key={item.label} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
              padding: '12px 16px', flex: '1 1 200px',
            }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: T.text }}>
                {item.label}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted, marginTop: 2 }}>
                {item.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
