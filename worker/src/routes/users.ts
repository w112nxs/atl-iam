import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const USER_COLUMNS = 'id, name, email, role, company, sponsor_id, terms_accepted, avatar_url, first_name, last_name, phone, user_type, work_email, consent_email, consent_text, consent_data_sharing, linkedin_url, onboarding_complete';

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

  // Return updated user
  const row = await c.env.DB.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`)
    .bind(user.id)
    .first();
  if (!row) return c.json({ error: 'User not found' }, 500);

  return c.json({ success: true, user: rowToUser(row) });
});

// Get connected identity providers
app.get('/me/providers', requireAuth, async (c) => {
  const user = c.get('user');
  const rows = await c.env.DB.prepare(
    'SELECT provider, created_at FROM user_oauth WHERE user_id = ?',
  ).bind(user.id).all();
  return c.json(rows.results.map(r => ({ provider: r.provider, connectedAt: r.created_at })));
});

export default app;
