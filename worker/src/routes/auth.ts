import { Hono } from 'hono';
import { signToken } from '../lib/jwt';
import type { Bindings, Variables } from '../types';

const DEMO_KEYS: Record<string, string> = {
  admin: 'u1',
  member: 'u2',
  saviynt: 'u3',
  cyberark: 'u4',
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Demo login
app.post('/demo-login', async (c) => {
  const { key } = await c.req.json<{ key: string }>();
  const userId = DEMO_KEYS[key];
  if (!userId) return c.json({ error: 'Invalid demo key' }, 400);

  const row = await c.env.DB.prepare(
    'SELECT id, name, email, role, company, sponsor_id, terms_accepted FROM users WHERE id = ?',
  )
    .bind(userId)
    .first();
  if (!row) return c.json({ error: 'User not found' }, 404);

  const user = {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as string,
    company: row.company as string,
    sponsorId: (row.sponsor_id as string) || null,
    termsAccepted: Boolean(row.terms_accepted),
  };

  const token = await signToken(user, c.env.JWT_SECRET);
  return c.json({ token, user });
});

// OAuth stubs
app.get('/oauth/:provider', (c) => {
  return c.json({ error: 'OAuth not yet configured' }, 503);
});

app.get('/oauth/:provider/callback', (c) => {
  return c.json({ error: 'OAuth not yet configured' }, 503);
});

// Passkey stubs
app.post('/passkey/register-options', (c) => {
  return c.json({ error: 'Passkey support coming soon' }, 501);
});

app.post('/passkey/register-verify', (c) => {
  return c.json({ error: 'Passkey support coming soon' }, 501);
});

app.post('/passkey/auth-options', (c) => {
  return c.json({ error: 'Passkey support coming soon' }, 501);
});

app.post('/passkey/auth-verify', (c) => {
  return c.json({ error: 'Passkey support coming soon' }, 501);
});

export default app;
