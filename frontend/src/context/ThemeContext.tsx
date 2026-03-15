import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ThemeTokens } from '../types';

const STORAGE_KEY = 'atlanta-iam-theme';

const dark: ThemeTokens = {
  bg: '#07080f',
  surface: '#0e0f1a',
  card: '#13141f',
  cardHover: '#181928',
  border: '#1c1d2e',
  accent: '#00c2ff',
  accentDim: '#00c2ff22',
  gold: '#f5a623',
  goldDim: '#f5a62322',
  green: '#00e096',
  greenDim: '#00e09622',
  red: '#ff4d6d',
  redDim: '#ff4d6d22',
  purple: '#a78bfa',
  purpleDim: '#a78bfa22',
  amber: '#fbbf24',
  amberDim: '#fbbf2422',
  text: '#e8eaf6',
  muted: '#5c6080',
  subtle: '#8890b8',
  navBg: 'rgba(14,15,26,0.92)',
  shadow: '0 8px 40px rgba(0,0,0,0.5)',
  heroGrad: 'radial-gradient(ellipse at 50% 0%, rgba(0,194,255,0.06) 0%, transparent 55%)',
  inputBg: '#13141f',
  mode: 'dark',
};

const light: ThemeTokens = {
  bg: '#f0f4f8',
  surface: '#ffffff',
  card: '#ffffff',
  cardHover: '#f7f9fc',
  border: '#dde3ec',
  accent: '#0070e0',
  accentDim: '#0070e018',
  gold: '#b45309',
  goldDim: '#b4530912',
  green: '#059669',
  greenDim: '#05966912',
  red: '#dc2626',
  redDim: '#dc262612',
  purple: '#7c3aed',
  purpleDim: '#7c3aed12',
  amber: '#d97706',
  amberDim: '#d9770612',
  text: '#0f172a',
  muted: '#94a3b8',
  subtle: '#475569',
  navBg: 'rgba(255,255,255,0.94)',
  shadow: '0 8px 40px rgba(0,0,0,0.08)',
  heroGrad: 'radial-gradient(ellipse at 50% 0%, rgba(0,112,224,0.06) 0%, transparent 55%)',
  inputBg: '#f8fafc',
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
