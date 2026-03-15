import { useTheme } from '../../context/ThemeContext';

function roleColor(role: string, T: ReturnType<typeof useTheme>['T']) {
  switch (role) {
    case 'admin': return T.red;
    case 'sponsor': return T.gold;
    case 'member': return T.accent;
    default: return T.muted;
  }
}

export function Avatar({ name, size = 36, role = 'member' }: { name: string; size?: number; role?: string }) {
  const { T } = useTheme();
  const color = roleColor(role, T);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: color + '22',
      border: `2px solid ${color}44`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700,
      fontSize: size * 0.38,
      color,
      transition: 'background 0.25s, border-color 0.25s, color 0.25s',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}
