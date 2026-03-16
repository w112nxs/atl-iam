import { useState, useCallback } from 'react';
import type { User } from '../types';
import { api } from '../api/client';
import { demoUsers } from '../data/seed';

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


  // Demo login (kept for dev)
  const login = useCallback(async (key: string) => {
    try {
      const { token, user: u } = await api.demoLogin(key);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(AUTH_KEY, JSON.stringify(u));
      setUser(u);
    } catch {
      const u = demoUsers[key];
      if (u) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.setItem(AUTH_KEY, JSON.stringify(u));
        setUser(u);
      }
    }
  }, []);

  // Direct token login (from passkey or other)
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

  const acceptTerms = useCallback(async () => {
    try {
      await api.acceptTerms();
    } catch {
      // Continue even if API is down
    }
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, termsAccepted: true };
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { user, login, loginWithToken, logout, acceptTerms };
}
