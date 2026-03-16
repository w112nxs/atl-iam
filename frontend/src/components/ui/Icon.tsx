import type { CSSProperties } from 'react';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  filled?: boolean;
  style?: CSSProperties;
}

export function Icon({ name, size = 18, color, filled, style }: IconProps) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontFamily: "'Material Symbols Outlined'",
        fontSize: size,
        color,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        lineHeight: 1,
        display: 'inline-block',
        verticalAlign: 'middle',
        userSelect: 'none',
        WebkitFontSmoothing: 'antialiased',
        ...style,
      }}
    >
      {name}
    </span>
  );
}
