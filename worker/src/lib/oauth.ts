// OAuth provider configurations

export interface OAuthProvider {
  authorizeUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  scopes: string[];
  extractProfile: (data: Record<string, unknown>) => { id: string; name: string; email: string; avatarUrl: string };
}

export function getProvider(
  name: string,
  env: Record<string, string>,
): OAuthProvider | null {
  switch (name) {
    case 'google':
      return {
        authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userinfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
        scopes: ['openid', 'email', 'profile'],
        extractProfile: (d) => ({
          id: String(d.sub),
          name: String(d.name || ''),
          email: String(d.email || ''),
          avatarUrl: String(d.picture || ''),
        }),
      };
    case 'linkedin':
      return {
        authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        userinfoUrl: 'https://api.linkedin.com/v2/userinfo',
        scopes: ['openid', 'email', 'profile'],
        extractProfile: (d) => ({
          id: String(d.sub),
          name: String(d.name || ''),
          email: String(d.email || ''),
          avatarUrl: String(d.picture || ''),
        }),
      };
    case 'github':
      return {
        authorizeUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userinfoUrl: 'https://api.github.com/user',
        scopes: ['read:user', 'user:email'],
        extractProfile: (d) => ({
          id: String(d.id),
          name: String(d.name || d.login || ''),
          email: String(d.email || ''),
          avatarUrl: String(d.avatar_url || ''),
        }),
      };
    default:
      return null;
  }
}

export function getClientId(provider: string, env: Record<string, string>): string {
  const map: Record<string, string> = {
    google: env.GOOGLE_CLIENT_ID,
    linkedin: env.LINKEDIN_CLIENT_ID,
    github: env.GITHUB_CLIENT_ID,
  };
  return map[provider] || '';
}

export function getClientSecret(provider: string, env: Record<string, string>): string {
  const map: Record<string, string> = {
    google: env.GOOGLE_CLIENT_SECRET,
    linkedin: env.LINKEDIN_CLIENT_SECRET,
    github: env.GITHUB_CLIENT_SECRET,
  };
  return map[provider] || '';
}

export async function exchangeCode(
  provider: OAuthProvider,
  providerName: string,
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  // GitHub requires Accept header for JSON response
  if (providerName === 'github') {
    headers['Accept'] = 'application/json';
  }

  const res = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers,
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json() as Record<string, unknown>;
  return String(data.access_token);
}

export async function fetchUserInfo(
  provider: OAuthProvider,
  providerName: string,
  accessToken: string,
): Promise<{ id: string; name: string; email: string; avatarUrl: string }> {
  const res = await fetch(provider.userinfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Userinfo request failed: ${res.status}`);

  const data = await res.json() as Record<string, unknown>;

  // GitHub doesn't always include email in user response; fetch from emails endpoint
  if (providerName === 'github' && !data.email) {
    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (emailRes.ok) {
      const emails = await emailRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
      const primary = emails.find(e => e.primary && e.verified);
      if (primary) data.email = primary.email;
    }
  }

  return provider.extractProfile(data);
}
