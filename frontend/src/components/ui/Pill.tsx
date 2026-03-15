export function Pill({ label, color, size = 10 }: { label: string; color: string; size?: number }) {
  return (
    <span style={{
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '0.08em',
      padding: '2px 8px',
      borderRadius: 3,
      background: color + '22',
      color,
      border: `1px solid ${color}44`,
      textTransform: 'uppercase',
      transition: 'background 0.25s, color 0.25s, border-color 0.25s',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
