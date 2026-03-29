import { LegalPageLayout, useLegalStyles } from '../components/layout/LegalPageLayout';

export function TermsOfServicePage({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const S = useLegalStyles();
  const { T } = S;

  const sections = [
    {
      id: 'agreement',
      title: '1. Agreement to Terms',
      accent: T.accent,
      content: (
        <>
          <h2 style={S.h2}>1. Agreement to Terms</h2>
          <p style={S.p}>
            By accessing or using the Atlanta IAM User Group website (<span style={{ color: T.accent }}>atlantaiam.com</span>), creating an account, or attending our events, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
          <p style={{ ...S.p, marginBottom: 0 }}>
            If you do not agree with any part of these terms, you must not use our services. We reserve the right to update these terms at any time. Continued use after changes constitutes acceptance.
          </p>
        </>
      ),
    },
    {
      id: 'whoweare',
      title: '2. Who We Are',
      accent: T.accent,
      content: (
        <>
          <h2 style={S.h2}>2. Who We Are</h2>
          <p style={S.p}>
            The Atlanta IAM User Group is a practitioner-first, vendor-neutral community dedicated to advancing Identity & Access Management knowledge in the Atlanta metropolitan area. We host regular forums, workshops, and networking events for IAM professionals.
          </p>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Our community is organized in Atlanta, Georgia, and primarily serves IAM professionals in the greater Atlanta metro area, though membership is open to all qualified professionals regardless of location.
          </p>
        </>
      ),
    },
    {
      id: 'accounts',
      title: '3. User Accounts',
      accent: T.purple,
      content: (
        <>
          <h2 style={S.h2}>3. User Accounts</h2>
          <h3 style={S.h3}>3.1 Registration</h3>
          <p style={S.p}>
            To access certain features (event registration, speaking submissions, member directory, sponsor portal), you must create an account. You may register via OAuth (Google, GitHub, LinkedIn) or passkey authentication.
          </p>
          <h3 style={S.h3}>3.2 Account Information</h3>
          <p style={S.p}>
            You agree to provide accurate, current, and complete information during registration and keep it updated. We may prompt you to confirm your profile if it hasn't been updated in over one year.
          </p>
          <h3 style={S.h3}>3.3 Account Security</h3>
          <p style={S.p}>
            You are responsible for safeguarding your account credentials and for all activity under your account. Notify us immediately of any unauthorized access.
          </p>
          <h3 style={S.h3}>3.4 Account Types</h3>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Enterprise Practitioner</strong> — IAM professionals at end-user organizations</li>
            <li style={S.li}><strong style={S.strong}>Vendor / Solution Provider</strong> — Representatives of IAM product/service companies (requires work email verification)</li>
            <li style={S.li}><strong style={S.strong}>Admin</strong> — Community organizers with administrative access</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Misrepresenting your account type (e.g., registering as enterprise when you represent a vendor) may result in account suspension.
          </p>
        </>
      ),
    },
    {
      id: 'community-rules',
      title: '4. Community Rules',
      accent: T.accent,
      content: (
        <>
          <h2 style={S.h2}>4. Community Rules</h2>
          <h3 style={S.h3}>4.1 Enterprise-Led Presentations</h3>
          <p style={S.p}>
            All session presentations must feature an enterprise practitioner as the primary presenter. Vendor representatives may co-present only alongside an enterprise practitioner. Solo vendor presentations are not permitted.
          </p>
          <h3 style={S.h3}>4.2 Vendor Neutrality</h3>
          <p style={S.p}>
            Content must be technology-agnostic and focused on real-world use cases, not product demonstrations or sales pitches. Sponsored content is clearly labeled and separated from community-driven sessions.
          </p>
          <h3 style={S.h3}>4.3 Submissions</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Speaking proposals and sponsorship requests require authentication to maintain quality and accountability. All submissions are reviewed by community organizers and acceptance is not guaranteed.
          </p>
        </>
      ),
    },
    {
      id: 'events',
      title: '5. Events & Attendance',
      accent: T.green,
      content: (
        <>
          <h2 style={S.h2}>5. Events & Attendance</h2>
          <h3 style={S.h3}>5.1 Registration</h3>
          <p style={S.p}>
            Event registration is managed through our platform. Registration may be limited by capacity. We reserve the right to refuse registration at our discretion.
          </p>
          <h3 style={S.h3}>5.2 Check-In</h3>
          <p style={S.p}>
            Check-in occurs via our kiosk system at event venues. Walk-in registration is available and creates a full user account subject to these terms, including terms acceptance and consent collection.
          </p>
          <h3 style={S.h3}>5.3 CPE Credits</h3>
          <p style={S.p}>
            Sessions may qualify for Continuing Professional Education (CPE) credits. CPE tracking is based on session attendance records. We issue certificates but are not responsible for acceptance by certifying bodies.
          </p>
          <h3 style={S.h3}>5.4 Photography & Recording</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Events may be photographed or recorded for community promotion. Attendance implies consent to incidental inclusion. If you wish to be excluded, notify event staff upon arrival.
          </p>
        </>
      ),
    },
    {
      id: 'sponsorships',
      title: '6. Sponsorship Terms',
      accent: T.gold,
      content: (
        <>
          <h2 style={S.h2}>6. Sponsorship Terms</h2>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Sponsors support our community by sponsoring events. In return, sponsors receive brand visibility, a co-presentation opportunity alongside an enterprise practitioner, and a presence at in-person events. Sponsorship terms are agreed upon directly between the sponsor and community organizers.
          </p>
        </>
      ),
    },
    {
      id: 'data-privacy',
      title: '7. Data & Privacy',
      accent: T.green,
      content: (
        <>
          <h2 style={S.h2}>7. Data & Privacy</h2>
          <p style={S.p}>
            Your privacy is governed by our <span style={{ color: T.accent, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onNavigate?.('/privacy')}>Privacy Policy</span>, which describes how we collect, use, and protect your personal information.
          </p>
          <h3 style={S.h3}>7.1 Consent Collection</h3>
          <p style={S.p}>
            During registration, we collect explicit consent for:
          </p>
          <ul style={S.ul}>
            <li style={S.li}>Terms of Service and Code of Conduct acceptance (required)</li>
            <li style={S.li}>Email communications (optional)</li>
            <li style={S.li}>SMS/text notifications (optional)</li>
            <li style={S.li}>Sponsor data sharing (optional)</li>
          </ul>
          <h3 style={S.h3}>7.2 Data Sharing Controls</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            You may modify your consent preferences at any time from your profile. Withdrawing consent does not affect your ability to attend events or participate in the community.
          </p>
        </>
      ),
    },
    {
      id: 'ip',
      title: '8. Intellectual Property',
      accent: T.purple,
      content: (
        <>
          <h2 style={S.h2}>8. Intellectual Property</h2>
          <h3 style={S.h3}>8.1 Our Content</h3>
          <p style={S.p}>
            The Atlanta IAM website, branding, logos, and original content are the property of the Atlanta IAM User Group. You may not reproduce, distribute, or create derivative works without written permission.
          </p>
          <h3 style={S.h3}>8.2 User Submissions</h3>
          <p style={S.p}>
            By submitting speaking proposals, presentations, or other content, you grant us a non-exclusive, royalty-free license to use, display, and distribute the content in connection with community activities.
          </p>
          <h3 style={S.h3}>8.3 Speaker Content</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Speakers retain ownership of their presentation content. Speakers grant permission for session titles, abstracts, and speaker bios to be published on our platform and promotional materials.
          </p>
        </>
      ),
    },
    {
      id: 'conduct',
      title: '9. Acceptable Use',
      accent: T.red,
      content: (
        <>
          <h2 style={S.h2}>9. Acceptable Use</h2>
          <p style={S.p}>You agree not to:</p>
          <ul style={S.ul}>
            <li style={S.li}>Misrepresent your identity, account type, or affiliations</li>
            <li style={S.li}>Use the platform for unauthorized commercial solicitation</li>
            <li style={S.li}>Attempt to access other users' accounts or data</li>
            <li style={S.li}>Scrape, crawl, or automatically extract data from the platform</li>
            <li style={S.li}>Upload malicious code or interfere with platform operations</li>
            <li style={S.li}>Use exported attendee data in violation of sponsor data usage terms</li>
            <li style={S.li}>Harass, threaten, or discriminate against other community members</li>
          </ul>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Violations may result in account suspension or permanent ban at our discretion. See also our <span style={{ color: T.accent, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onNavigate?.('/conduct')}>Code of Conduct</span>.
          </p>
        </>
      ),
    },
    {
      id: 'termination',
      title: '10. Termination',
      accent: T.muted,
      content: (
        <>
          <h2 style={S.h2}>10. Termination</h2>
          <h3 style={S.h3}>10.1 By You</h3>
          <p style={S.p}>
            You may close your account at any time by contacting us at <strong style={{ color: T.accent }}>hello@atlantaiam.com</strong>. Upon deletion, your personal data will be removed per our data retention policy.
          </p>
          <h3 style={S.h3}>10.2 By Us</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            We may suspend or terminate your account for violations of these terms, the Code of Conduct, or for any other reason at our discretion. We will provide notice where practicable. Termination does not waive any rights or obligations accrued prior to termination.
          </p>
        </>
      ),
    },
    {
      id: 'liability',
      title: '11. Disclaimers & Liability',
      accent: T.gold,
      content: (
        <>
          <h2 style={S.h2}>11. Disclaimers & Liability</h2>
          <h3 style={S.h3}>11.1 As-Is Basis</h3>
          <p style={S.p}>
            Our platform and events are provided "as is" and "as available" without warranties of any kind, express or implied, including fitness for a particular purpose.
          </p>
          <h3 style={S.h3}>11.2 Limitation of Liability</h3>
          <p style={S.p}>
            We are not liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed fees paid by you (if any) in the 12 months preceding the claim.
          </p>
          <h3 style={S.h3}>11.3 Indemnification</h3>
          <p style={{ ...S.p, marginBottom: 0 }}>
            You agree to indemnify and hold harmless the Atlanta IAM User Group, its organizers, and volunteers from any claims arising from your use of the platform or attendance at events.
          </p>
        </>
      ),
    },
    {
      id: 'governing',
      title: '12. Governing Law',
      accent: T.muted,
      content: (
        <>
          <h2 style={S.h2}>12. Governing Law & Disputes</h2>
          <p style={S.p}>
            These Terms are governed by the laws of the State of Georgia, United States. Any disputes shall be resolved exclusively in the state or federal courts located in Fulton County, Georgia.
          </p>
          <p style={{ ...S.p, marginBottom: 0 }}>
            If any provision of these terms is found unenforceable, the remaining provisions will continue in effect. Our failure to enforce any right does not constitute a waiver.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      title: '13. Contact',
      accent: T.accent,
      content: (
        <>
          <h2 style={S.h2}>13. Contact</h2>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              ['General', 'hello@atlantaiam.com'],
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
      title="Terms of Service"
      subtitle="Rules and conditions governing use of the Atlanta IAM platform and events"
      lastUpdated="March 16, 2026"
      sections={sections}
      relatedLinks={[
        { label: 'Privacy Policy', note: '', path: '/privacy' },
        { label: 'Code of Conduct', note: '', path: '/conduct' },
      ]}
      onNavigate={onNavigate}
    />
  );
}
