import { Hono } from 'hono';
import { signToken, verifyToken } from '../lib/jwt';
import { hashToken } from '../lib/hash';
import { getProvider, getClientId, getClientSecret, exchangeCode, fetchUserInfo } from '../lib/oauth';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { Bindings, Variables } from '../types';
import { requireAuth } from '../middleware/auth';

const RP_NAME = 'Atlanta IAM';

function getRpId(c: { env: { FRONTEND_URL: string } }): string {
  try {
    return new URL(c.env.FRONTEND_URL).hostname;
  } catch {
    return 'atlantaiam.com';
  }
}

function getRpOrigin(c: { env: { FRONTEND_URL: string } }): string {
  return c.env.FRONTEND_URL || 'https://atlantaiam.com';
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── Helper: build user payload from DB row ──
const USER_COLUMNS = 'id, name, email, role, company, sponsor_id, terms_accepted, avatar_url, first_name, last_name, phone, user_type, work_email, consent_email, consent_text, consent_data_sharing, linkedin_url, onboarding_complete';

function rowToUser(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role),
    company: String(row.company || ''),
    termsAccepted: Boolean(row.terms_accepted),
    avatarUrl: String(row.avatar_url || ''),
    firstName: String(row.first_name || ''),
    lastName: String(row.last_name || ''),
    phone: String(row.phone || ''),
    userType: String(row.user_type || '') as '' | 'enterprise' | 'vendor',
    workEmail: String(row.work_email || ''),
    consentEmail: Boolean(row.consent_email),
    consentText: Boolean(row.consent_text),
    consentDataSharing: Boolean(row.consent_data_sharing),
    linkedinUrl: String(row.linkedin_url || ''),
    onboardingComplete: Boolean(row.onboarding_complete),
  };
}

// Parse User-Agent into device/browser/os
function parseUA(ua: string): { device: string; browser: string; os: string } {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // OS
  if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; device = ua.includes('iPad') ? 'Tablet' : 'Mobile'; }
  else if (ua.includes('Android')) { os = 'Android'; device = ua.includes('Mobile') ? 'Mobile' : 'Tablet'; }
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('CrOS')) os = 'ChromeOS';

  // Browser
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';

  return { device, browser, os };
}

// Create a session record and update last_login.
// Deduplicates: replaces any existing session from the same device/browser/os for this user.
async function createSession(
  db: D1Database, userId: string, token: string, ua: string, ip: string,
) {
  const { device, browser, os } = parseUA(ua);
  const tokenHash = await hashToken(token);

  // Remove any existing session from the same device/browser/os to prevent duplicates
  await db.prepare(
    'DELETE FROM user_sessions WHERE user_id = ? AND device = ? AND browser = ? AND os = ?',
  ).bind(userId, device, browser, os).run();

  const sessionId = crypto.randomUUID();
  await db.prepare(
    'INSERT INTO user_sessions (id, user_id, token_hash, device, browser, os, ip) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).bind(sessionId, userId, tokenHash, device, browser, os, ip).run();

  await db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").bind(userId).run();

  return sessionId;
}

// ━━━━━━━━━━━━━━━━━━━━━━ OAuth ━━━━━━━━━━━━━━━━━━━━━━

// Step 1: Redirect to provider
app.get('/oauth/:provider', (c) => {
  const providerName = c.req.param('provider');
  const provider = getProvider(providerName, c.env as unknown as Record<string, string>);
  if (!provider) return c.json({ error: 'Unknown provider' }, 400);

  const clientId = getClientId(providerName, c.env as unknown as Record<string, string>);
  if (!clientId) return c.json({ error: `${providerName} OAuth not configured` }, 503);

  const redirectUri = `${c.env.FRONTEND_URL}/api/auth/oauth/${providerName}/callback`;
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: provider.scopes.join(' '),
    state,
  });

  return c.redirect(`${provider.authorizeUrl}?${params.toString()}`);
});

// Step 2: Handle callback from provider
app.get('/oauth/:provider/callback', async (c) => {
  const providerName = c.req.param('provider');
  const provider = getProvider(providerName, c.env as unknown as Record<string, string>);
  if (!provider) return c.json({ error: 'Unknown provider' }, 400);

  const code = c.req.query('code');
  const error = c.req.query('error');
  if (error) return c.redirect(`${c.env.FRONTEND_URL}/#auth-error=${encodeURIComponent(error)}`);
  if (!code) return c.json({ error: 'Missing code' }, 400);

  const clientId = getClientId(providerName, c.env as unknown as Record<string, string>);
  const clientSecret = getClientSecret(providerName, c.env as unknown as Record<string, string>);
  const redirectUri = `${c.env.FRONTEND_URL}/api/auth/oauth/${providerName}/callback`;

  try {
    // Exchange code for access token
    const accessToken = await exchangeCode(provider, providerName, code, redirectUri, clientId, clientSecret);

    // Fetch user profile from provider
    const profile = await fetchUserInfo(provider, providerName, accessToken);

    if (!profile.email) {
      return c.redirect(`${c.env.FRONTEND_URL}/#auth-error=no-email`);
    }

    // Normalize email to lowercase for case-insensitive matching
    const normalizedEmail = profile.email.toLowerCase();

    // Check if this OAuth link already exists
    const existing = await c.env.DB.prepare(
      'SELECT user_id FROM user_oauth WHERE provider = ? AND provider_user_id = ?',
    ).bind(providerName, profile.id).first();

    let userId: string;

    if (existing) {
      // Returning user via this provider
      userId = String(existing.user_id);
      // Update access token
      await c.env.DB.prepare(
        'UPDATE user_oauth SET access_token = ? WHERE provider = ? AND provider_user_id = ?',
      ).bind(accessToken, providerName, profile.id).run();
    } else {
      // Auto-merge: find existing user by email (case-insensitive)
      const existingUser = await c.env.DB.prepare(
        'SELECT id FROM users WHERE LOWER(email) = ?',
      ).bind(normalizedEmail).first();

      if (existingUser) {
        // Link this new provider to the existing account
        userId = String(existingUser.id);
      } else {
        // Create new user with normalized email
        userId = crypto.randomUUID();
        await c.env.DB.prepare(
          'INSERT INTO users (id, name, email, role, avatar_url, privacy_show_email, privacy_show_phone, privacy_show_company, privacy_show_title, privacy_show_linkedin, privacy_show_type, privacy_listed) VALUES (?, ?, ?, ?, ?, 1, 1, 1, 1, 1, 1, 1)',
        ).bind(userId, profile.name, normalizedEmail, 'member', profile.avatarUrl).run();
      }

      // Create OAuth link
      await c.env.DB.prepare(
        'INSERT INTO user_oauth (provider, provider_user_id, user_id, access_token) VALUES (?, ?, ?, ?)',
      ).bind(providerName, profile.id, userId, accessToken).run();
    }

    // Update avatar if we have one and user doesn't
    if (profile.avatarUrl) {
      await c.env.DB.prepare(
        "UPDATE users SET avatar_url = ? WHERE id = ? AND (avatar_url IS NULL OR avatar_url = '')",
      ).bind(profile.avatarUrl, userId).run();
    }

    // Fetch full user for JWT
    const row = await c.env.DB.prepare(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = ?`,
    ).bind(userId).first();
    if (!row) return c.json({ error: 'User not found after OAuth' }, 500);

    const user = rowToUser(row);
    const token = await signToken(user, c.env.JWT_SECRET);
    await createSession(c.env.DB, user.id, token, c.req.header('user-agent') || '', c.req.header('cf-connecting-ip') || '');

    // Redirect to frontend with token in URL hash (not visible to server)
    return c.redirect(`${c.env.FRONTEND_URL}/#token=${token}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OAuth failed';
    console.error('OAuth error:', msg);
    return c.redirect(`${c.env.FRONTEND_URL}/#auth-error=${encodeURIComponent(msg)}`);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━ Passkeys (WebAuthn) ━━━━━━━━━━━━━━━━━━━━━━

// Register: Generate options (requires auth — user is adding a passkey to their account)
app.post('/passkey/register-options', requireAuth, async (c) => {
  const user = c.get('user');

  // Get existing passkeys for this user
  const rows = await c.env.DB.prepare(
    'SELECT credential_id, transports FROM user_passkeys WHERE user_id = ?',
  ).bind(user.id).all();

  const excludeCredentials = rows.results.map((r) => ({
    id: String(r.credential_id),
    transports: JSON.parse(String(r.transports || '[]')),
  }));

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: getRpId(c),
    userName: user.email,
    userDisplayName: user.name,
    attestationType: 'none',
    excludeCredentials,
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'required',
      requireResidentKey: true,
      userVerification: 'required',
    },
  });

  // Store challenge temporarily
  const challengeId = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO webauthn_challenges (id, challenge, user_id) VALUES (?, ?, ?)',
  ).bind(challengeId, options.challenge, user.id).run();

  return c.json({ ...options, _challengeId: challengeId });
});

// Register: Verify credential
app.post('/passkey/register-verify', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { _challengeId, ...credential } = body;

  // Retrieve stored challenge
  const challengeRow = await c.env.DB.prepare(
    'SELECT challenge FROM webauthn_challenges WHERE id = ? AND user_id = ?',
  ).bind(_challengeId, user.id).first();

  if (!challengeRow) return c.json({ error: 'Challenge not found or expired' }, 400);
  const expectedChallenge = String(challengeRow.challenge);

  // Clean up challenge
  await c.env.DB.prepare('DELETE FROM webauthn_challenges WHERE id = ?').bind(_challengeId).run();

  try {
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: getRpOrigin(c),
      expectedRPID: getRpId(c),
    });

    if (!verification.verified || !verification.registrationInfo) {
      return c.json({ verified: false }, 400);
    }

    const { credential: cred, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    // Encode public key to base64 (works in Workers without Node Buffer)
    const pubKeyBytes = new Uint8Array(cred.publicKey);
    let pubKeyB64 = '';
    for (const b of pubKeyBytes) pubKeyB64 += String.fromCharCode(b);
    pubKeyB64 = btoa(pubKeyB64);

    // Store the credential
    await c.env.DB.prepare(
      'INSERT INTO user_passkeys (credential_id, user_id, public_key, counter, transports) VALUES (?, ?, ?, ?, ?)',
    ).bind(
      cred.id,
      user.id,
      pubKeyB64,
      cred.counter,
      JSON.stringify(credential.response?.transports || []),
    ).run();

    return c.json({ verified: true, deviceType: credentialDeviceType, backedUp: credentialBackedUp });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    const stack = err instanceof Error ? err.stack : '';
    console.error('Passkey register-verify error:', msg, stack);
    return c.json({ error: msg, verified: false }, 400);
  }
});

// Authenticate: Generate options (no auth required — this is the login flow)
app.post('/passkey/auth-options', async (c) => {
  const options = await generateAuthenticationOptions({
    rpID: getRpId(c),
    userVerification: 'preferred',
  });

  // Store challenge
  const challengeId = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO webauthn_challenges (id, challenge) VALUES (?, ?)',
  ).bind(challengeId, options.challenge).run();

  return c.json({ ...options, _challengeId: challengeId });
});

// Authenticate: Verify assertion
app.post('/passkey/auth-verify', async (c) => {
  const body = await c.req.json();
  const { _challengeId, _options, ...credential } = body;

  const challengeId = _challengeId || _options?.challengeId;
  const expectedChallenge = _options?.challenge;

  // Look up challenge from DB if not provided directly
  let challenge = expectedChallenge;
  if (!challenge && challengeId) {
    const challengeRow = await c.env.DB.prepare(
      'SELECT challenge FROM webauthn_challenges WHERE id = ?',
    ).bind(challengeId).first();
    if (challengeRow) challenge = String(challengeRow.challenge);
  }

  if (!challenge) return c.json({ error: 'Challenge not found' }, 400);

  // Clean up used challenge
  if (challengeId) {
    await c.env.DB.prepare('DELETE FROM webauthn_challenges WHERE id = ?').bind(challengeId).run();
  }

  // Look up the credential in our database
  const credentialId = credential.id || credential.rawId;
  const storedCred = await c.env.DB.prepare(
    'SELECT credential_id, user_id, public_key, counter, transports FROM user_passkeys WHERE credential_id = ?',
  ).bind(credentialId).first();

  if (!storedCred) return c.json({ error: 'Credential not found' }, 400);

  try {
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: getRpOrigin(c),
      expectedRPID: getRpId(c),
      credential: {
        id: String(storedCred.credential_id),
        publicKey: Uint8Array.from(atob(String(storedCred.public_key)), c => c.charCodeAt(0)),
        counter: Number(storedCred.counter),
        transports: JSON.parse(String(storedCred.transports || '[]')),
      },
    });

    if (!verification.verified) {
      return c.json({ verified: false }, 400);
    }

    // Update counter
    await c.env.DB.prepare(
      'UPDATE user_passkeys SET counter = ? WHERE credential_id = ?',
    ).bind(verification.authenticationInfo.newCounter, credentialId).run();

    // Get user and issue JWT
    const row = await c.env.DB.prepare(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = ?`,
    ).bind(String(storedCred.user_id)).first();

    if (!row) return c.json({ error: 'User not found' }, 500);

    const user = rowToUser(row);
    const token = await signToken(user, c.env.JWT_SECRET);
    await createSession(c.env.DB, user.id, token, c.req.header('user-agent') || '', c.req.header('cf-connecting-ip') || '');

    return c.json({ verified: true, token, user });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    return c.json({ error: msg, verified: false }, 400);
  }
});

export default app;
