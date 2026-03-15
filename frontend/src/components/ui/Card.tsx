import type { ReactNode, CSSProperties } from 'react';
import { useTheme } from '../../context/ThemeContext';

export function Card({ children, style, accent }: { children: ReactNode; style?: CSSProperties; accent?: string }) {
  const { T } = useTheme();
  return (
    <div style={{
      borderRadius: 10,
      background: T.card,
      border: `1px solid ${accent ? accent + '44' : T.border}`,
      padding: 16,
      transition: 'background 0.25s, border-color 0.25s',
      ...style,
    }}>
      {children}
    </div>
  );
}
