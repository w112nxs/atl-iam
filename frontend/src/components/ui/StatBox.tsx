import { useTheme } from '../../context/ThemeContext';
import { Card } from './Card';

export function StatBox({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  const { T } = useTheme();
  return (
    <Card>
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
        fontSize: 26,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        color,
        lineHeight: 1,
        transition: 'color 0.25s',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontSize: 11,
          fontFamily: "'Inter', sans-serif",
          color: T.muted,
          marginTop: 3,
          transition: 'color 0.25s',
        }}>
          {sub}
        </div>
      )}
    </Card>
  );
}
