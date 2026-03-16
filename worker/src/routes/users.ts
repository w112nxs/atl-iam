import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const USER_COLUMNS = 'id, name, email, role, company, sponsor_id, terms_accepted, avatar_url, first_name, last_name, phone, user_type, work_email, consent_email, consent_text, consent_data_sharing, linkedin_url, onboarding_complete, title, privacy_show_email, privacy_show_phone, privacy_show_company, privacy_show_title, privacy_show_linkedin, privacy_show_type, privacy_listed, last_login';

function rowToUser(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role),
    company: String(row.company || ''),
    sponsorId: row.sponsor_id ? String(row.sponsor_id) : null,
    termsAccepted: Boolean(row.terms_accepted),
    avatarUrl: String(row.avatar_url || ''),
    firstName: String(row.first_name || ''),
    lastName: String(row.last_name || ''),
    phone: String(row.phone || ''),
    userType: String(row.user_type || ''),
    workEmail: String(row.work_email || ''),
    consentEmail: Boolean(row.consent_email),
    consentText: Boolean(row.consent_text),
    consentDataSharing: Boolean(row.consent_data_sharing),
    linkedinUrl: String(row.linkedin_url || ''),
    onboardingComplete: Boolean(row.onboarding_complete),
    title: String(row.title || ''),
    privacyShowEmail: Boolean(row.privacy_show_email),
    privacyShowPhone: Boolean(row.privacy_show_phone),
    privacyShowCompany: Boolean(row.privacy_show_company ?? 1),
    privacyShowTitle: Boolean(row.privacy_show_title ?? 1),
    privacyShowLinkedin: Boolean(row.privacy_show_linkedin),
    privacyShowType: Boolean(row.privacy_show_type ?? 1),
    privacyListed: Boolean(row.privacy_listed ?? 1),
    lastLogin: String(row.last_login || ''),
  };
}

// Build a privacy-filtered member profile for the directory
function rowToMemberProfile(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    avatarUrl: String(row.avatar_url || ''),
    company: row.privacy_show_company ? String(row.company || '') : undefined,
    title: row.privacy_show_title ? String(row.title || '') : undefined,
    userType: row.privacy_show_type ? String(row.user_type || '') : undefined,
    email: row.privacy_show_email ? String(row.email || '') : undefined,
    phone: row.privacy_show_phone ? String(row.phone || '') : undefined,
    linkedinUrl: row.privacy_show_linkedin ? String(row.linkedin_url || '') : undefined,
  };
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get current user (full profile)
app.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  const row = await c.env.DB.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`)
    .bind(user.id)
    .first();
  if (!row) return c.json(user);
  return c.json(rowToUser(row));
});

// Accept terms
app.put('/me/terms', requireAuth, async (c) => {
  const user = c.get('user');
  await c.env.DB.prepare('UPDATE users SET terms_accepted = 1 WHERE id = ?')
    .bind(user.id)
    .run();
  return c.json({ success: true });
});

// Complete onboarding profile
app.put('/me/onboarding', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    firstName: string;
    lastName: string;
    phone?: string;
    userType: 'enterprise' | 'vendor';
    workEmail?: string;
    company?: string;
    consentEmail: boolean;
    consentText: boolean;
    consentDataSharing: boolean;
    linkedinUrl?: string;
    termsAccepted: boolean;
  }>();

  if (!body.firstName || !body.lastName) {
    return c.json({ error: 'First and last name are required' }, 400);
  }
  if (!body.userType) {
    return c.json({ error: 'User type is required' }, 400);
  }
  if (body.userType === 'vendor' && !body.workEmail) {
    return c.json({ error: 'Work email is required for vendors' }, 400);
  }
  if (!body.termsAccepted) {
    return c.json({ error: 'Terms must be accepted' }, 400);
  }

  const fullName = `${body.firstName} ${body.lastName}`;

  await c.env.DB.prepare(`
    UPDATE users SET
      first_name = ?, last_name = ?, name = ?,
      phone = ?, user_type = ?, work_email = ?,
      company = ?,
      consent_email = ?, consent_text = ?, consent_data_sharing = ?,
      linkedin_url = ?,
      terms_accepted = 1, onboarding_complete = 1
    WHERE id = ?
  `).bind(
    body.firstName,
    body.lastName,
    fullName,
    body.phone || '',
    body.userType,
    body.workEmail || '',
    body.company || '',
    body.consentEmail ? 1 : 0,
    body.consentText ? 1 : 0,
    body.consentDataSharing ? 1 : 0,
    body.linkedinUrl || '',
    user.id,
  ).run();

  const row = await c.env.DB.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`)
    .bind(user.id)
    .first();
  if (!row) return c.json({ error: 'User not found' }, 500);

  return c.json({ success: true, user: rowToUser(row) });
});

// Update privacy settings
app.put('/me/privacy', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    privacyShowEmail?: boolean;
    privacyShowPhone?: boolean;
    privacyShowCompany?: boolean;
    privacyShowTitle?: boolean;
    privacyShowLinkedin?: boolean;
    privacyShowType?: boolean;
    privacyListed?: boolean;
  }>();

  await c.env.DB.prepare(`
    UPDATE users SET
      privacy_show_email = ?, privacy_show_phone = ?,
      privacy_show_company = ?, privacy_show_title = ?,
      privacy_show_linkedin = ?, privacy_show_type = ?,
      privacy_listed = ?
    WHERE id = ?
  `).bind(
    body.privacyShowEmail ? 1 : 0,
    body.privacyShowPhone ? 1 : 0,
    body.privacyShowCompany ? 1 : 0,
    body.privacyShowTitle ? 1 : 0,
    body.privacyShowLinkedin ? 1 : 0,
    body.privacyShowType ? 1 : 0,
    body.privacyListed ? 1 : 0,
    user.id,
  ).run();

  const row = await c.env.DB.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`)
    .bind(user.id).first();
  if (!row) return c.json({ error: 'User not found' }, 500);
  return c.json({ success: true, user: rowToUser(row) });
});

// Update profile (title, company, etc.)
app.put('/me/profile', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    firstName?: string; lastName?: string; title?: string;
    company?: string; phone?: string; linkedinUrl?: string;
  }>();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.firstName !== undefined && body.lastName !== undefined) {
    updates.push('first_name = ?', 'last_name = ?', 'name = ?');
    values.push(body.firstName, body.lastName, `${body.firstName} ${body.lastName}`);
  }
  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title); }
  if (body.company !== undefined) { updates.push('company = ?'); values.push(body.company); }
  if (body.phone !== undefined) { updates.push('phone = ?'); values.push(body.phone); }
  if (body.linkedinUrl !== undefined) { updates.push('linkedin_url = ?'); values.push(body.linkedinUrl); }

  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400);

  values.push(user.id);
  await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values).run();

  const row = await c.env.DB.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`)
    .bind(user.id).first();
  if (!row) return c.json({ error: 'User not found' }, 500);
  return c.json({ success: true, user: rowToUser(row) });
});

// Get registered passkeys
app.get('/me/passkeys', requireAuth, async (c) => {
  const user = c.get('user');
  const rows = await c.env.DB.prepare(
    'SELECT credential_id, created_at FROM user_passkeys WHERE user_id = ?',
  ).bind(user.id).all();
  return c.json(rows.results.map(r => ({
    credentialId: r.credential_id,
    createdAt: r.created_at,
  })));
});

// Delete a passkey
app.delete('/me/passkeys/:credentialId', requireAuth, async (c) => {
  const user = c.get('user');
  const credentialId = c.req.param('credentialId');
  await c.env.DB.prepare(
    'DELETE FROM user_passkeys WHERE credential_id = ? AND user_id = ?',
  ).bind(credentialId, user.id).run();
  return c.json({ success: true });
});

// Get connected identity providers
app.get('/me/providers', requireAuth, async (c) => {
  const user = c.get('user');
  const rows = await c.env.DB.prepare(
    'SELECT provider, created_at FROM user_oauth WHERE user_id = ?',
  ).bind(user.id).all();
  return c.json(rows.results.map(r => ({ provider: r.provider, connectedAt: r.created_at })));
});

// ── Sessions ──

// List active sessions
app.get('/me/sessions', requireAuth, async (c) => {
  const user = c.get('user');

  // Hash current token to identify which session is "this one"
  const currentToken = c.req.header('authorization')?.replace('Bearer ', '') || '';
  const encoder = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(currentToken));
  const hashArr = new Uint8Array(hashBuf);
  let currentHash = '';
  for (const b of hashArr) currentHash += b.toString(16).padStart(2, '0');

  const rows = await c.env.DB.prepare(
    'SELECT id, device, browser, os, ip, created_at, last_active, token_hash FROM user_sessions WHERE user_id = ? ORDER BY last_active DESC',
  ).bind(user.id).all();

  return c.json(rows.results.map(r => ({
    id: r.id,
    device: r.device,
    browser: r.browser,
    os: r.os,
    ip: r.ip,
    createdAt: r.created_at,
    lastActive: r.last_active,
    current: r.token_hash === currentHash,
  })));
});

// Revoke a session
app.delete('/me/sessions/:sessionId', requireAuth, async (c) => {
  const user = c.get('user');
  const sessionId = c.req.param('sessionId');
  await c.env.DB.prepare(
    'DELETE FROM user_sessions WHERE id = ? AND user_id = ?',
  ).bind(sessionId, user.id).run();
  return c.json({ success: true });
});

// Revoke all other sessions
app.delete('/me/sessions', requireAuth, async (c) => {
  const user = c.get('user');

  // Hash current token to keep this session
  const currentToken = c.req.header('authorization')?.replace('Bearer ', '') || '';
  const encoder = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(currentToken));
  const hashArr = new Uint8Array(hashBuf);
  let currentHash = '';
  for (const b of hashArr) currentHash += b.toString(16).padStart(2, '0');

  await c.env.DB.prepare(
    'DELETE FROM user_sessions WHERE user_id = ? AND token_hash != ?',
  ).bind(user.id, currentHash).run();
  return c.json({ success: true });
});

// ── Member Directory ──

// Search/list members (privacy-filtered)
app.get('/directory', requireAuth, async (c) => {
  const q = c.req.query('q') || '';
  const type = c.req.query('type') || '';
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100);
  const offset = Number(c.req.query('offset')) || 0;

  let sql = `SELECT ${USER_COLUMNS} FROM users WHERE onboarding_complete = 1 AND privacy_listed = 1`;
  const params: unknown[] = [];

  if (q) {
    sql += ' AND (name LIKE ? OR company LIKE ? OR title LIKE ?)';
    const term = `%${q}%`;
    params.push(term, term, term);
  }
  if (type === 'enterprise' || type === 'vendor') {
    sql += ' AND user_type = ?';
    params.push(type);
  }

  sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = await c.env.DB.prepare(sql).bind(...params).all();

  // Count total for pagination
  let countSql = 'SELECT COUNT(*) as total FROM users WHERE onboarding_complete = 1 AND privacy_listed = 1';
  const countParams: unknown[] = [];
  if (q) {
    countSql += ' AND (name LIKE ? OR company LIKE ? OR title LIKE ?)';
    const term = `%${q}%`;
    countParams.push(term, term, term);
  }
  if (type === 'enterprise' || type === 'vendor') {
    countSql += ' AND user_type = ?';
    countParams.push(type);
  }

  const countRow = await c.env.DB.prepare(countSql).bind(...countParams).first();
  const total = Number(countRow?.total || 0);

  return c.json({
    members: rows.results.map(r => rowToMemberProfile(r)),
    total,
    limit,
    offset,
  });
});

// Get a single member profile (privacy-filtered)
app.get('/directory/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = ? AND onboarding_complete = 1 AND privacy_listed = 1`,
  ).bind(id).first();

  if (!row) return c.json({ error: 'Member not found' }, 404);
  return c.json(rowToMemberProfile(row));
});

export default app;
