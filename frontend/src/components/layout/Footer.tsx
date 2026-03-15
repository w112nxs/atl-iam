import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { T } = useTheme();

  const linkStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 13,
    color: T.subtle,
    cursor: 'pointer' as const,
    transition: 'color 0.25s',
    background: 'none' as const,
    border: 'none' as const,
    padding: 0,
    textAlign: 'left' as const,
    display: 'block' as const,
    marginBottom: 6,
  };

  return (
    <footer style={{
      borderTop: `1px solid ${T.border}`,
      padding: '28px 32px 20px',
      transition: 'border-color 0.25s',
    }}>
      <div style={{
        width: '90%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 24,
      }}>
        {/* Brand */}
        <div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: T.text,
            marginBottom: 8,
            letterSpacing: '0.04em',
            transition: 'color 0.25s',
          }}>
            Atlanta IAM
          </div>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 12,
            color: T.muted,
            margin: 0,
            lineHeight: 1.6,
            transition: 'color 0.25s',
          }}>
            Atlanta's practitioner-first, vendor-neutral IAM community. Building connections since 2023.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.18em',
            color: T.muted,
            marginBottom: 10,
            textTransform: 'uppercase',
            transition: 'color 0.25s',
          }}>
            Quick Links
          </div>
          <button onClick={() => onNavigate('/events')} style={linkStyle}>Upcoming Events</button>
          <button onClick={() => onNavigate('/sponsors')} style={linkStyle}>Our Sponsors</button>
          <button onClick={() => onNavigate('/submit-speaking')} style={linkStyle}>Submit a Talk</button>
          <button onClick={() => onNavigate('/about')} style={linkStyle}>About Us</button>
        </div>

        {/* Resources */}
        <div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.18em',
            color: T.muted,
            marginBottom: 10,
            textTransform: 'uppercase',
            transition: 'color 0.25s',
          }}>
            Resources
          </div>
          <div style={linkStyle}>CPE Tracking</div>
          <div style={linkStyle}>Code of Conduct</div>
          <div style={linkStyle}>Privacy Policy</div>
          <div style={linkStyle}>Sponsor Portal Guide</div>
        </div>

        {/* Theme */}
        <div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.18em',
            color: T.muted,
            marginBottom: 10,
            textTransform: 'uppercase',
            transition: 'color 0.25s',
          }}>
            Appearance
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        width: '90%',
        margin: '20px auto 0',
        paddingTop: 16,
        borderTop: `1px solid ${T.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'border-color 0.25s',
      }}>
        <span style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 11,
          color: T.muted,
          transition: 'color 0.25s',
        }}>
          &copy; 2026 Atlanta IAM User Group. All rights reserved.
        </span>
        <span style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 11,
          color: T.muted,
          transition: 'color 0.25s',
        }}>
          Atlanta, GA
        </span>
      </div>
    </footer>
  );
}
