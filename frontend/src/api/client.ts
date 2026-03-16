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
    // If session was revoked or token is invalid, force logout
    if (res.status === 401 && token) {
      localStorage.removeItem('atlanta-iam-token');
      localStorage.removeItem('atlanta-iam-user');
      window.location.href = '/';
    }
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
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

  // Company autocomplete
  searchCompanies: (q: string) => request<string[]>(`/users/companies?q=${encodeURIComponent(q)}`),

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
  submitSpeaking: (data: {
    title: string; abstract: string; company: string; type: string; coPresenter?: string;
    email: string; phone: string; linkedinUrl: string;
    consentNameListed: boolean; consentLinkedinLinked: boolean; consentWebsiteListed: boolean;
  }) =>
    request<{ success: boolean; id: string }>('/submissions/speaking', { method: 'POST', body: JSON.stringify(data) }),

  // Speaking wizard
  saveSpeakingDraft: (data: Record<string, unknown>) =>
    request<{ success: boolean; id: string }>('/submissions/speaking', { method: 'POST', body: JSON.stringify(data) }),

  updateSpeakingDraft: (id: string, data: Record<string, unknown>) =>
    request<{ success: boolean }>(`/submissions/speaking/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteSpeakingDraft: (id: string) =>
    request<{ success: boolean }>(`/submissions/speaking/${id}`, { method: 'DELETE' }),

  submitSpeakingFinal: (id: string) =>
    request<{ success: boolean }>(`/submissions/speaking/${id}/submit`, { method: 'POST' }),

  getMySpeakingSubmissions: () =>
    request<import('../types').SpeakingSubmissionSummary[]>('/submissions/speaking/mine'),

  getSpeakingSubmission: (id: string) =>
    request<Record<string, unknown>>(`/submissions/speaking/${id}`),

  getAdminSpeakingSubmissions: () =>
    request<Record<string, unknown>[]>('/admin/speaking-submissions'),

  reviewSpeakingSubmission: (id: string, data: { status: 'approved' | 'rejected'; comment: string }) =>
    request<{ success: boolean }>(`/admin/speaking-submissions/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),

  submitSponsor: (data: { companyName: string; contactEmail: string; tier: string; notes?: string }) =>
    request<{ success: boolean }>('/submissions/sponsor', { method: 'POST', body: JSON.stringify(data) }),

  // Audit
  logExport: (data: { eventId: string; attendeeCount: number; tier: string; timestamp: string }) =>
    request<{ success: boolean }>('/audit/export', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAdminEvents: () => request<import('../types').Event[]>('/admin/events'),
  getAdminMembers: (params?: { q?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    return request<{ members: import('../types').User[]; total: number; limit: number; offset: number }>(
      `/users/admin/members?${qs.toString()}`
    );
  },
  getAdminMember: (id: string) => request<import('../types').User>(`/users/admin/members/${id}`),
  updateAdminMember: (id: string, data: {
    name?: string; email?: string; role?: string; company?: string;
    title?: string; phone?: string; userType?: string;
    firstName?: string; lastName?: string;
  }) => request<{ success: boolean; user: import('../types').User }>(`/users/admin/members/${id}`, {
    method: 'PUT', body: JSON.stringify(data),
  }),
  deleteAdminMember: (id: string) => request<{ success: boolean }>(`/users/admin/members/${id}`, { method: 'DELETE' }),

  // Admin — Events
  createAdminEvent: (data: { name: string; date: string; venue?: string; eventType?: string; description?: string; maxCapacity?: number }) =>
    request<{ success: boolean; id: string }>('/admin/events', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminEvent: (id: string, data: {
    name?: string; date?: string; venue?: string; eventType?: string;
    description?: string; maxCapacity?: number;
  }) => request<{ success: boolean }>(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminEvent: (id: string) =>
    request<{ success: boolean }>(`/admin/events/${id}`, { method: 'DELETE' }),
  getAdminEventAttendees: (eventId: string, filter?: string) => {
    const qs = filter ? `?filter=${filter}` : '';
    return request<{
      id: string; name: string; email: string; company: string; title: string;
      type: string; checkedIn: boolean; checkedInAt: string; checkedInBy: string;
    }[]>(`/admin/events/${eventId}/attendees${qs}`);
  },

  // Admin — Sessions
  createAdminSession: (eventId: string, data: { title: string; speaker?: string; time?: string; cpe?: number }) =>
    request<{ success: boolean; id: string }>(`/admin/events/${eventId}/sessions`, { method: 'POST', body: JSON.stringify(data) }),
  updateAdminSession: (id: string, data: { title?: string; speaker?: string; time?: string; cpe?: number }) =>
    request<{ success: boolean }>(`/admin/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminSession: (id: string) =>
    request<{ success: boolean }>(`/admin/sessions/${id}`, { method: 'DELETE' }),

  // Admin — Sponsors
  getAdminSponsors: () => request<{ eventId: string; eventName: string; sponsorId: string; sponsorName: string; tier: string }[]>('/admin/sponsors'),
  getAdminSponsorContacts: (sponsorId: string) =>
    request<{ id: string; name: string; email: string; company: string; title: string; phone: string }[]>(`/admin/sponsors/${sponsorId}/contacts`),
  addAdminSponsor: (data: { eventId: string; sponsorId: string; sponsorName: string; tier: string }) =>
    request<{ success: boolean }>('/admin/sponsors', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminSponsor: (eventId: string, sponsorId: string, data: { sponsorName?: string; tier?: string }) =>
    request<{ success: boolean }>(`/admin/sponsors/${eventId}/${sponsorId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminSponsor: (eventId: string, sponsorId: string) =>
    request<{ success: boolean }>(`/admin/sponsors/${eventId}/${sponsorId}`, { method: 'DELETE' }),

  // Calendar
  getCalendarUrl: (params?: { eventType?: string; eventId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.eventType) qs.set('eventType', params.eventType);
    if (params?.eventId) qs.set('eventId', params.eventId);
    const query = qs.toString();
    return `${API_BASE}/calendar/events.ics${query ? '?' + query : ''}`;
  },

  getCalendarSubscribeUrl: (params?: { eventType?: string }) => {
    const url = api.getCalendarUrl(params);
    return url.replace(/^https?:/, 'webcal:');
  },

  // Invites
  sendInvite: (data: { email: string; name?: string; message?: string }) =>
    request<{ success: boolean; invite: { id: string; code: string; email: string; name: string; inviteUrl: string } }>('/invites', {
      method: 'POST', body: JSON.stringify(data),
    }),

  getMyInvites: () =>
    request<{ id: string; email: string; name: string; code: string; status: string; createdAt: string; acceptedAt: string | null }[]>('/invites/mine'),

  validateInvite: (code: string) =>
    request<{ valid: boolean; inviterName: string; inviterCompany: string; inviteeName: string; message: string }>(`/invites/validate/${code}`),

  acceptInvite: (code: string) =>
    request<{ success: boolean }>(`/invites/accept/${code}`, { method: 'POST' }),

  // Kiosk
  kioskGetEventData: (eventId: string, kioskToken: string) =>
    request<{
      event: { id: string; name: string; date: string; venue: string; eventType: string };
      attendees: { id: string; name: string; email: string; company: string; title: string; type: string; checkedIn: boolean }[];
      stats: { registered: number; checkedIn: number; enterprise: number; vendor: number };
    }>(`/kiosk/event/${eventId}/data`, {
      headers: { Authorization: `Bearer kiosk:${kioskToken}` },
    }),
  kioskCheckIn: (eventId: string, attendeeId: string, kioskToken: string, stationId?: string) =>
    request<{ success: boolean; attendee: { id: string; name: string; company: string; title: string; type: string } }>(
      `/kiosk/event/${eventId}/checkin/${attendeeId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer kiosk:${kioskToken}` },
        body: JSON.stringify({ stationId }),
      }
    ),
  kioskWalkIn: (eventId: string, data: {
    firstName: string; lastName: string; email: string; phone?: string;
    company?: string; title?: string; type?: string; linkedinUrl?: string;
    termsAccepted: boolean; consentEmail: boolean; consentText: boolean; consentDataSharing: boolean;
  }, kioskToken: string) =>
    request<{ success: boolean; existing?: boolean; attendee: { id: string; name: string; company: string; title: string; type: string } }>(
      `/kiosk/event/${eventId}/walkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer kiosk:${kioskToken}` },
        body: JSON.stringify(data),
      }
    ),
  kioskGetStats: (eventId: string, kioskToken: string) =>
    request<{ registered: number; checkedIn: number; enterprise: number; vendor: number }>(
      `/kiosk/event/${eventId}/stats`, {
        headers: { Authorization: `Bearer kiosk:${kioskToken}` },
      }
    ),
};

