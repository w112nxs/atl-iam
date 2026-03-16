import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Send invite (authenticated)
app.post('/', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    email: string;
    name?: string;
    message?: string;
  }>();

  if (!body.email || !body.email.includes('@')) {
    return c.json({ error: 'Valid email required' }, 400);
  }

  const email = body.email.trim().toLowerCase();

  // Check if already a member
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE LOWER(email) = ?')
    .bind(email).first();
  if (existing) {
    return c.json({ error: 'This person is already a member' }, 409);
  }

  // Check for duplicate pending invite from same inviter
  const dup = await c.env.DB.prepare(
    'SELECT id FROM invites WHERE inviter_id = ? AND invitee_email = ? AND status = ?'
  ).bind(user.id, email, 'pending').first();
  if (dup) {
    return c.json({ error: 'You already have a pending invite for this email' }, 409);
  }

  // Rate limit: max 10 invites per day per user
  const recentCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM invites WHERE inviter_id = ? AND created_at > datetime('now', '-1 day')"
  ).bind(user.id).first<{ cnt: number }>();
  if (recentCount && recentCount.cnt >= 10) {
    return c.json({ error: 'Daily invite limit reached (10 per day)' }, 429);
  }

  const id = crypto.randomUUID();
  const code = generateCode();

  await c.env.DB.prepare(
    'INSERT INTO invites (id, inviter_id, invitee_email, invitee_name, message, code) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, user.id, email, body.name?.trim() || '', body.message?.trim() || '', code).run();

  const inviteUrl = `${c.env.FRONTEND_URL || 'https://atlantaiam.com'}?invite=${code}`;

  return c.json({
    success: true,
    invite: { id, code, email, name: body.name || '', inviteUrl },
  });
});

// Get my sent invites (authenticated)
app.get('/mine', requireAuth, async (c) => {
  const user = c.get('user');

  const result = await c.env.DB.prepare(
    'SELECT id, invitee_email, invitee_name, code, status, created_at, accepted_at FROM invites WHERE inviter_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(user.id).all();

  const invites = (result.results || []).map(r => ({
    id: r.id,
    email: r.invitee_email,
    name: r.invitee_name,
    code: r.code,
    status: r.status,
    createdAt: r.created_at,
    acceptedAt: r.accepted_at,
  }));

  return c.json(invites);
});

// Public: validate an invite code
app.get('/validate/:code', async (c) => {
  const code = c.req.param('code');

  const invite = await c.env.DB.prepare(
    'SELECT i.id, i.invitee_email, i.invitee_name, i.message, i.status, u.name as inviter_name, u.company as inviter_company FROM invites i JOIN users u ON i.inviter_id = u.id WHERE i.code = ?'
  ).bind(code).first();

  if (!invite) {
    return c.json({ error: 'Invalid invite code' }, 404);
  }

  if (invite.status !== 'pending') {
    return c.json({ error: 'This invite has already been used' }, 410);
  }

  return c.json({
    valid: true,
    inviterName: invite.inviter_name,
    inviterCompany: invite.inviter_company,
    inviteeName: invite.invitee_name,
    message: invite.message,
  });
});

// Mark invite as accepted (called after successful registration)
app.post('/accept/:code', requireAuth, async (c) => {
  const code = c.req.param('code');
  const user = c.get('user');

  await c.env.DB.prepare(
    "UPDATE invites SET status = 'accepted', accepted_by = ?, accepted_at = datetime('now') WHERE code = ? AND status = 'pending'"
  ).bind(user.id, code).run();

  return c.json({ success: true });
});

export default app;
