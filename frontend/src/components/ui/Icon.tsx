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
        fontSize: size,
        color,
        fontVariationSettings: filled ? "'FILL' 1" : undefined,
        lineHeight: 1,
        verticalAlign: 'middle',
        userSelect: 'none',
        ...style,
      }}
    >
      {name}
    </span>
  );
}
