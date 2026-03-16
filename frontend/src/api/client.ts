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
  getOAuthUrl: (provider: 'google' | 'github' | 'linkedin') =>
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
  completeOnboarding: (data: {
    firstName: string; lastName: string; phone?: string;
    userType: 'enterprise' | 'vendor'; workEmail?: string; company?: string;
    consentEmail: boolean; consentText: boolean; consentDataSharing: boolean;
    linkedinUrl?: string; termsAccepted: boolean;
  }) => request<{ success: boolean; user: import('../types').User }>('/users/me/onboarding', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getPasskeys: () => request<{ credentialId: string; createdAt: string }[]>('/users/me/passkeys'),
  deletePasskey: (credentialId: string) => request<{ success: boolean }>(`/users/me/passkeys/${encodeURIComponent(credentialId)}`, { method: 'DELETE' }),
  getProviders: () => request<{ provider: string; connectedAt: string }[]>('/users/me/providers'),
  updatePrivacy: (data: {
    privacyShowEmail?: boolean; privacyShowPhone?: boolean;
    privacyShowCompany?: boolean; privacyShowTitle?: boolean;
    privacyShowLinkedin?: boolean; privacyShowType?: boolean;
    privacyListed?: boolean;
  }) => request<{ success: boolean; user: import('../types').User }>('/users/me/privacy', {
    method: 'PUT', body: JSON.stringify(data),
  }),
  updateProfile: (data: {
    firstName?: string; lastName?: string; title?: string;
    company?: string; phone?: string; linkedinUrl?: string;
  }) => request<{ success: boolean; user: import('../types').User }>('/users/me/profile', {
    method: 'PUT', body: JSON.stringify(data),
  }),
  confirmProfile: () => request<{ success: boolean; user: import('../types').User }>('/users/me/profile/confirm', {
    method: 'PUT', body: JSON.stringify({}),
  }),

  // Member Directory
  searchMembers: (params?: { q?: string; type?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.type) qs.set('type', params.type);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    return request<{ members: import('../types').MemberProfile[]; total: number; limit: number; offset: number }>(
      `/users/directory?${qs.toString()}`
    );
  },
  getMember: (id: string) => request<import('../types').MemberProfile>(`/users/directory/${id}`),

  // Sessions
  getSessions: () => request<import('../types').Session[]>('/users/me/sessions'),
  revokeSession: (sessionId: string) => request<{ success: boolean }>(`/users/me/sessions/${sessionId}`, { method: 'DELETE' }),
  revokeOtherSessions: () => request<{ success: boolean }>('/users/me/sessions', { method: 'DELETE' }),

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

