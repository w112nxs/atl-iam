import { useTheme } from '../../context/ThemeContext';
import { Card } from './Card';

export function StatBox({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  const { T } = useTheme();
  return (
    <Card style={{
      borderLeft: `3px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: 82,
    }}>
      <div style={{
        fontSize: 10,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: T.muted,
        marginBottom: 4,
        transition: 'color 0.25s',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 'clamp(20px, 3vw, 26px)',
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        color,
        lineHeight: 1,
        transition: 'color 0.25s',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11,
        fontFamily: "'Inter', sans-serif",
        color: T.muted,
        marginTop: 3,
        minHeight: 16,
        transition: 'color 0.25s',
      }}>
        {sub || '\u00A0'}
      </div>
    </Card>
  );
}
