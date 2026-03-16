import { useState, useCallback } from 'react';
import type { User } from '../types';

const AUTH_KEY = 'atlanta-iam-user';
const TOKEN_KEY = 'atlanta-iam-token';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(loadUser);

  const loginWithToken = useCallback((token: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return { user, loginWithToken, logout };
}
