import { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface TermsModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

const sections = [
  { title: '1. Who We Are', body: 'The Atlanta IAM User Group is a practitioner-first, vendor-neutral community dedicated to advancing Identity & Access Management knowledge in the Atlanta metropolitan area. We host regular forums, workshops, and networking events for IAM professionals.' },
  { title: '2. Community Rules', body: 'All presentations must be enterprise-led. Vendor representatives may co-present only alongside an enterprise practitioner. Sponsored content is clearly labeled and separated from community-driven sessions.' },
  { title: '3. Data We Collect', body: 'We collect your name, email address, company affiliation, professional title, and relevant certifications upon registration. Event attendance and session participation data is recorded for CPE tracking purposes.' },
  { title: '4. How We Use Your Data', body: 'Your data is used to manage event logistics, issue CPE certificates, communicate about upcoming events, and improve our programming. We analyze aggregate attendance patterns to better serve the community.' },
  { title: '5. Your Rights', body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting hello@atlantaiam.com.' },
  { title: '7. Limitation of Liability', body: 'The Atlanta IAM User Group provides this platform and events on an "as is" basis. We are not liable for any indirect, incidental, or consequential damages arising from use of this platform or attendance at events.' },
  { title: '8. Governing Law', body: 'These terms are governed by the laws of the State of Georgia. Any disputes shall be resolved in the courts of Fulton County, Georgia.' },
];

export function TermsModal({ onAccept, onDecline }: TermsModalProps) {
  const { T } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      setScrolled(true);
    }
  }, []);

  const canAccept = scrolled && check1 && check2;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 160,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        width: 520,
        maxWidth: '92vw',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 0.25s, border-color 0.25s',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${T.border}`, transition: 'border-color 0.25s' }}>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: T.text,
            margin: 0,
            transition: 'color 0.25s',
          }}>
            Terms of Service & Privacy Policy
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: T.muted,
            margin: '8px 0 0',
            transition: 'color 0.25s',
          }}>
            Please read and accept to continue
          </p>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
          }}
        >
          {sections.map(s => (
            <div key={s.title} style={{ marginBottom: 20 }}>
              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: T.accent,
                margin: '0 0 6px',
                transition: 'color 0.25s',
              }}>
                {s.title}
              </h3>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: T.subtle,
                lineHeight: 1.7,
                margin: 0,
                transition: 'color 0.25s',
              }}>
                {s.body}
              </p>
            </div>
          ))}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: T.muted,
            fontStyle: 'italic',
            transition: 'color 0.25s',
          }}>
            Full legal docs at atlantaiam.com/legal
          </p>
        </div>

        {/* Checkboxes + Actions */}
        <div style={{
          padding: '16px 24px 24px',
          borderTop: `1px solid ${T.border}`,
          transition: 'border-color 0.25s',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 12,
            opacity: scrolled ? 1 : 0.4,
            pointerEvents: scrolled ? 'auto' : 'none',
            cursor: scrolled ? 'pointer' : 'default',
            transition: 'opacity 0.3s',
          }}>
            <input
              type="checkbox"
              checked={check1}
              onChange={e => setCheck1(e.target.checked)}
              style={{ marginTop: 3, accentColor: T.accent }}
            />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: T.text,
              lineHeight: 1.5,
              transition: 'color 0.25s',
            }}>
              I have read and agree to the Terms of Service and Privacy Policy of the Atlanta IAM User Group.
            </span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 20,
            opacity: scrolled ? 1 : 0.4,
            pointerEvents: scrolled ? 'auto' : 'none',
            cursor: scrolled ? 'pointer' : 'default',
            transition: 'opacity 0.3s',
          }}>
            <input
              type="checkbox"
              checked={check2}
              onChange={e => setCheck2(e.target.checked)}
              style={{ marginTop: 3, accentColor: T.accent }}
            />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: T.text,
              lineHeight: 1.5,
              transition: 'color 0.25s',
            }}>
              I agree to comply with the Atlanta IAM Community Code of Conduct and uphold vendor-neutral principles.
            </span>
          </label>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onDecline}
              style={{
                flex: 1,
                background: 'transparent',
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                color: T.muted,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.08em',
                padding: '12px 0',
                cursor: 'pointer',
                transition: 'color 0.25s, border-color 0.25s',
              }}
            >
              DECLINE & SIGN OUT
            </button>
            <button
              onClick={canAccept ? onAccept : undefined}
              disabled={!canAccept}
              style={{
                flex: 2,
                background: canAccept ? T.accent : T.border,
                border: 'none',
                borderRadius: 8,
                color: canAccept ? '#fff' : T.muted,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.08em',
                padding: '12px 0',
                cursor: canAccept ? 'pointer' : 'not-allowed',
                boxShadow: canAccept ? `0 0 20px ${T.accent}44` : 'none',
                transition: 'background 0.25s, color 0.25s, box-shadow 0.25s',
              }}
            >
              {canAccept ? 'ACCEPT & CONTINUE' : 'SCROLL & CHECK ABOVE TO ACCEPT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
