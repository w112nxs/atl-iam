import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('atlanta-iam-token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth — Demo (kept for dev)
  demoLogin: (key: string) =>
    request<{ token: string; user: import('../types').User }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ key }),
    }),

  // Auth — OAuth redirect URL
  getOAuthUrl: (provider: 'google' | 'facebook' | 'linkedin') =>
    `${API_BASE}/auth/oauth/${provider}`,

  // Auth — Passkeys
  passkeyRegisterOptions: () =>
    request<PublicKeyCredentialCreationOptionsJSON>('/auth/passkey/register-options', { method: 'POST' }),

  passkeyRegisterVerify: (credential: unknown) =>
    request<{ verified: boolean }>('/auth/passkey/register-verify', {
      method: 'POST',
      body: JSON.stringify(credential),
    }),

  passkeyAuthOptions: () =>
    request<PublicKeyCredentialRequestOptionsJSON>('/auth/passkey/auth-options', { method: 'POST' }),

  passkeyAuthVerify: (credential: unknown, options?: { challenge?: string }) =>
    request<{ verified: boolean; token: string; user: import('../types').User }>('/auth/passkey/auth-verify', {
      method: 'POST',
      body: JSON.stringify({ ...credential as object, _options: options }),
    }),

  // User
  getMe: () => request<import('../types').User>('/users/me'),
  acceptTerms: () => request<{ success: boolean }>('/users/me/terms', {
    method: 'PUT',
    body: JSON.stringify({ accepted: true }),
  }),

  // Events
  getEvents: () => request<import('../types').Event[]>('/events'),
  getEventAttendees: (eventId: string) =>
    request<import('../types').Attendee[]>(`/events/${eventId}/attendees`),
  getEventSessions: (eventId: string) =>
    request<{ id: string; title: string; count: number }[]>(`/events/${eventId}/sessions`),

  // Submissions
  submitSpeaking: (data: { title: string; abstract: string; company: string; type: string; coPresenter?: string }) =>
    request<{ success: boolean }>('/submissions/speaking', { method: 'POST', body: JSON.stringify(data) }),

  submitSponsor: (data: { companyName: string; contactEmail: string; tier: string; notes?: string }) =>
    request<{ success: boolean }>('/submissions/sponsor', { method: 'POST', body: JSON.stringify(data) }),

  // Audit
  logExport: (data: { eventId: string; attendeeCount: number; tier: string; timestamp: string }) =>
    request<{ success: boolean }>('/audit/export', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAdminEvents: () => request<import('../types').Event[]>('/admin/events'),
};

