import { useTheme } from '../../context/ThemeContext';
import type { Tier } from '../../types';

interface ExportModalProps {
  tier: Tier;
  attendeeCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export function ExportAcknowledgmentModal({ tier, attendeeCount, onConfirm, onClose }: ExportModalProps) {
  const { T } = useTheme();

  const columns = ['Name', 'Company', 'Title', 'Certifications', 'Email', 'Sessions Attended'];
  const included = tier === 'Gold' ? columns : tier === 'Silver' ? columns.filter(c => c !== 'Email') : ['Name', 'Company', 'Sessions Attended'];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 170,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.card,
          border: `1px solid ${T.amber}44`,
          borderRadius: 16,
          padding: 28,
          width: 420,
          maxWidth: '90vw',
          transition: 'background 0.25s, border-color 0.25s',
        }}
      >
        <h3 style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: T.amber,
          margin: '0 0 16px',
          transition: 'color 0.25s',
        }}>
          Export Attendee Data
        </h3>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: T.text,
          margin: '0 0 12px',
          transition: 'color 0.25s',
        }}>
          The following data will be included in your CSV export:
        </p>

        <div style={{ marginBottom: 16 }}>
          {included.map(col => (
            <div key={col} style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: T.green,
              padding: '3px 0',
              transition: 'color 0.25s',
            }}>
              ✓ {col}
            </div>
          ))}
        </div>

        <div style={{
          background: T.greenDim,
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 20,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: T.green,
          transition: 'background 0.25s, color 0.25s',
        }}>
          {attendeeCount} consented attendees
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
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
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 2,
              background: T.amber,
              border: 'none',
              borderRadius: 8,
              color: '#000',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.08em',
              padding: '12px 0',
              cursor: 'pointer',
              transition: 'background 0.25s',
            }}
          >
            I UNDERSTAND — DOWNLOAD
          </button>
        </div>
      </div>
    </div>
  );
}
