import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ThemeTokens } from '../types';

const STORAGE_KEY = 'atlanta-iam-theme';

const dark: ThemeTokens = {
  bg: '#080D18',
  surface: '#0E1525',
  card: '#172035',
  cardHover: '#1E2B40',
  border: 'rgba(255,255,255,0.07)',
  accent: '#E8560A',
  accentDim: 'rgba(232,86,10,0.12)',
  gold: '#F5A623',
  goldDim: 'rgba(245,166,35,0.12)',
  green: '#00E096',
  greenDim: 'rgba(0,224,150,0.12)',
  red: '#FF4D6D',
  redDim: 'rgba(255,77,109,0.12)',
  purple: '#A78BFA',
  purpleDim: 'rgba(167,139,250,0.12)',
  amber: '#FBBF24',
  amberDim: 'rgba(251,191,36,0.12)',
  text: '#DDE6F0',
  muted: '#6B7E96',
  subtle: '#A8B8CC',
  navBg: 'rgba(8,13,24,0.96)',
  shadow: '0 8px 40px rgba(0,0,0,0.5)',
  heroGrad: 'radial-gradient(ellipse at 50% 0%, rgba(232,86,10,0.07) 0%, transparent 55%)',
  inputBg: '#0E1525',
  mode: 'dark',
};

const light: ThemeTokens = {
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardHover: '#EEF2F8',
  border: 'rgba(0,0,0,0.08)',
  accent: '#E8560A',
  accentDim: 'rgba(232,86,10,0.08)',
  gold: '#B45309',
  goldDim: 'rgba(180,83,9,0.08)',
  green: '#059669',
  greenDim: 'rgba(5,150,105,0.08)',
  red: '#DC2626',
  redDim: 'rgba(220,38,38,0.08)',
  purple: '#7C3AED',
  purpleDim: 'rgba(124,58,237,0.08)',
  amber: '#D97706',
  amberDim: 'rgba(217,119,6,0.08)',
  text: '#0E1525',
  muted: '#6B7E96',
  subtle: '#2C3E55',
  navBg: 'rgba(255,255,255,0.97)',
  shadow: '0 8px 40px rgba(0,0,0,0.08)',
  heroGrad: 'radial-gradient(ellipse at 50% 0%, rgba(232,86,10,0.06) 0%, transparent 55%)',
  inputBg: '#F8FAFC',
  mode: 'light',
};

interface ThemeCtx {
  T: ThemeTokens;
  isDark: boolean;
  isAuto: boolean;
  toggle: () => void;
  resetToSystem: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  T: dark,
  isDark: true,
  isAuto: true,
  toggle: () => {},
  resetToSystem: () => {},
});

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveInitial(): { isDark: boolean; isAuto: boolean } {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return { isDark: true, isAuto: false };
  if (stored === 'light') return { isDark: false, isAuto: false };
  return { isDark: getSystemDark(), isAuto: true };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(resolveInitial);

  const applyTokens = useCallback((tokens: ThemeTokens) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', tokens.mode);
    Object.entries(tokens).forEach(([key, val]) => {
      root.style.setProperty(`--t-${key}`, val as string);
    });
  }, []);

  useEffect(() => {
    applyTokens(state.isDark ? dark : light);
  }, [state.isDark, applyTokens]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setState({ isDark: e.matches, isAuto: true });
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = useCallback(() => {
    setState(prev => {
      const next = !prev.isDark;
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return { isDark: next, isAuto: false };
    });
  }, []);

  const resetToSystem = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ isDark: getSystemDark(), isAuto: true });
  }, []);

  const T = state.isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ T, isDark: state.isDark, isAuto: state.isAuto, toggle, resetToSystem }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
