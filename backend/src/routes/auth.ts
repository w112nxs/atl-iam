import { Router } from 'express';
import { demoUsers, findOrCreateOAuthUser, getUserById, upsertPasskey, getPasskeysByUserId, getPasskeyByCredentialId } from '../data';
import { signToken, requireAuth, AuthRequest } from '../middleware/auth';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types';

const router = Router();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const RP_NAME = 'Atlanta IAM User Group';
const RP_ID = process.env.RP_ID || 'localhost';
const RP_ORIGIN = process.env.RP_ORIGIN || FRONTEND_URL;

// OAuth provider configs (filled from env)
const oauthProviders = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: 'openid email profile',
  },
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture',
    scopes: 'email,public_profile',
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scopes: 'openid profile email',
  },
};

type OAuthProvider = keyof typeof oauthProviders;
const isValidProvider = (p: string): p is OAuthProvider => p in oauthProviders;

// ---------------------------------------------------------------------------
// Demo login (kept for development)
// ---------------------------------------------------------------------------
router.post('/demo-login', (req, res) => {
  const { key } = req.body;
  const user = demoUsers[key as string];
  if (!user) {
    res.status(400).json({ error: 'Invalid demo account key' });
    return;
  }
  const token = signToken(user);
  res.json({ token, user });
});

// ---------------------------------------------------------------------------
// OAuth: Step 1 — Redirect to provider
// ---------------------------------------------------------------------------
router.get('/oauth/:provider', (req, res) => {
  const provider = req.params.provider;
  if (!isValidProvider(provider)) {
    res.status(400).json({ error: 'Unsupported provider' });
    return;
  }
  const cfg = oauthProviders[provider];
  if (!cfg.clientId) {
    res.status(503).json({ error: `${provider} OAuth not configured` });
    return;
  }

  const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/auth/oauth/${provider}/callback`;
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: cfg.scopes,
    state: provider,
  });

  res.redirect(`${cfg.authUrl}?${params.toString()}`);
});

// ---------------------------------------------------------------------------
// OAuth: Step 2 — Handle callback from provider
// ---------------------------------------------------------------------------
router.get('/oauth/:provider/callback', async (req, res) => {
  const provider = req.params.provider;
  if (!isValidProvider(provider)) {
    res.redirect(`${FRONTEND_URL}/?auth_error=unsupported_provider`);
    return;
  }
  const cfg = oauthProviders[provider];
  const code = req.query.code as string;
  if (!code) {
    res.redirect(`${FRONTEND_URL}/?auth_error=no_code`);
    return;
  }

  try {
    const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/auth/oauth/${provider}/callback`;

    // Exchange code for token
    const tokenBody = new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: tokenBody.toString(),
    });
    const tokenData = await tokenRes.json() as Record<string, string>;
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      res.redirect(`${FRONTEND_URL}/?auth_error=token_exchange_failed`);
      return;
    }

    // Fetch user info
    const userRes = await fetch(cfg.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await userRes.json() as Record<string, string>;

    // Normalize profile across providers
    let providerUserId: string;
    let email: string;
    let name: string;
    let avatarUrl: string | undefined;

    if (provider === 'google') {
      providerUserId = profile.id;
      email = profile.email;
      name = profile.name;
      avatarUrl = profile.picture;
    } else if (provider === 'facebook') {
      providerUserId = profile.id;
      email = profile.email;
      name = profile.name;
      const pic = profile.picture as unknown as { data?: { url?: string } };
      avatarUrl = typeof pic === 'object' && pic?.data?.url ? pic.data.url : undefined;
    } else {
      // LinkedIn (OpenID Connect)
      providerUserId = profile.sub;
      email = profile.email;
      name = profile.name;
      avatarUrl = profile.picture;
    }

    if (!email) {
      res.redirect(`${FRONTEND_URL}/?auth_error=no_email`);
      return;
    }

    // Find or create user in our data store
    const user = findOrCreateOAuthUser({
      provider,
      providerUserId,
      email,
      name,
      avatarUrl,
      accessToken,
    });

    const token = signToken(user);
    // Redirect back to frontend with token in URL fragment (not query — more secure)
    res.redirect(`${FRONTEND_URL}/auth/callback#token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (err) {
    console.error(`OAuth ${provider} error:`, err);
    res.redirect(`${FRONTEND_URL}/?auth_error=provider_error`);
  }
});

// ---------------------------------------------------------------------------
// Passkey: Generate registration options (user must be logged in)
// ---------------------------------------------------------------------------
const challenges = new Map<string, string>(); // userId -> challenge (in-memory for demo)

router.post('/passkey/register-options', requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user!.id;
  const userName = authReq.user!.email;
  const userDisplayName = authReq.user!.name;

  const existingPasskeys = getPasskeysByUserId(userId);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName,
    userDisplayName,
    attestationType: 'none',
    excludeCredentials: existingPasskeys.map(pk => ({
      id: pk.credentialId,
      transports: pk.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  challenges.set(userId, options.challenge);
  res.json(options);
});

// ---------------------------------------------------------------------------
// Passkey: Verify registration
// ---------------------------------------------------------------------------
router.post('/passkey/register-verify', requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user!.id;
  const expectedChallenge = challenges.get(userId);

  if (!expectedChallenge) {
    res.status(400).json({ error: 'No pending challenge' });
    return;
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      res.status(400).json({ error: 'Verification failed' });
      return;
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    upsertPasskey({
      userId,
      credentialId: Buffer.from(credential.id).toString('base64url'),
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: Number(credential.counter),
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: req.body.response?.transports || [],
    });

    challenges.delete(userId);
    res.json({ verified: true });
  } catch (err) {
    console.error('Passkey registration error:', err);
    res.status(400).json({ error: 'Registration verification failed' });
  }
});

// ---------------------------------------------------------------------------
// Passkey: Generate authentication options (no auth required — this is login)
// ---------------------------------------------------------------------------
router.post('/passkey/auth-options', async (_req, res) => {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'preferred',
  });

  // Store challenge with a temp key (we don't know the user yet for discoverable credentials)
  challenges.set('_auth_' + options.challenge, options.challenge);
  res.json(options);
});

// ---------------------------------------------------------------------------
// Passkey: Verify authentication
// ---------------------------------------------------------------------------
router.post('/passkey/auth-verify', async (req, res) => {
  const { challenge: expectedChallenge } = req.body._options || {};
  const credIdB64 = req.body.id;

  const passkey = getPasskeyByCredentialId(credIdB64);
  if (!passkey) {
    res.status(400).json({ error: 'Unknown credential' });
    return;
  }

  // Find the challenge
  const storedChallenge = expectedChallenge || challenges.get('_auth_' + req.body.response?.clientDataJSON);
  if (!storedChallenge && !expectedChallenge) {
    // Try to find any matching challenge
    for (const [key, val] of challenges.entries()) {
      if (key.startsWith('_auth_')) {
        // Use the most recent one for demo simplicity
        try {
          const verification = await verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge: val,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID,
            credential: {
              id: passkey.credentialId,
              publicKey: Buffer.from(passkey.publicKey, 'base64url'),
              counter: passkey.counter,
              transports: passkey.transports as AuthenticatorTransportFuture[],
            },
          });

          if (verification.verified) {
            passkey.counter = Number(verification.authenticationInfo.newCounter);
            challenges.delete(key);

            const user = getUserById(passkey.userId);
            if (!user) {
              res.status(400).json({ error: 'User not found' });
              return;
            }
            const token = signToken(user);
            res.json({ verified: true, token, user });
            return;
          }
        } catch {
          continue;
        }
      }
    }
    res.status(400).json({ error: 'Challenge verification failed' });
    return;
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: expectedChallenge || storedChallenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.credentialId,
        publicKey: Buffer.from(passkey.publicKey, 'base64url'),
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      },
    });

    if (!verification.verified) {
      res.status(400).json({ error: 'Verification failed' });
      return;
    }

    passkey.counter = Number(verification.authenticationInfo.newCounter);

    const user = getUserById(passkey.userId);
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    const token = signToken(user);
    res.json({ verified: true, token, user });
  } catch (err) {
    console.error('Passkey auth error:', err);
    res.status(400).json({ error: 'Authentication verification failed' });
  }
});

export default router;
