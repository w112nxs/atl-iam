import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ToastProps {
  msg: string;
  type: 'success' | 'error';
  onDone: () => void;
}

export function Toast({ msg, type, onDone }: ToastProps) {
  const { T } = useTheme();
  const [visible, setVisible] = useState(false);
  const color = type === 'success' ? T.green : T.red;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 200,
      background: T.card,
      border: `1px solid ${color}44`,
      borderRadius: 10,
      padding: '12px 20px',
      color,
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
      fontSize: 13,
      boxShadow: T.shadow,
      transform: visible ? 'scale(1)' : 'scale(0.9)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease, background 0.25s, border-color 0.25s',
    }}>
      {type === 'success' ? '✓' : '✗'} {msg}
    </div>
  );
}
