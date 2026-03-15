export function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <div style={{
      fontSize: 11,
      fontFamily: "'Space Mono', monospace",
      fontWeight: 700,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color,
      transition: 'color 0.25s',
    }}>
      {text}
    </div>
  );
}
