import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Kiosk authentication middleware — validates pre-shared token
const requireKiosk = async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: () => Promise<void>) => {
  const auth = c.req.header('Authorization') || '';
  const match = auth.match(/^Bearer kiosk:(.+)$/);
  if (!match || match[1] !== c.env.KIOSK_SECRET) {
    return c.json({ error: 'Invalid kiosk token' }, 401);
  }
  await next();
};

app.use('/*', requireKiosk);

// Compute stats dynamically from attendees
async function computeStats(db: D1Database, eventId: string) {
  const row = await db.prepare(
    `SELECT
      COUNT(*) as registered,
      SUM(CASE WHEN checked_in = 1 THEN 1 ELSE 0 END) as checked_in,
      SUM(CASE WHEN type = 'enterprise' THEN 1 ELSE 0 END) as enterprise,
      SUM(CASE WHEN type = 'vendor' THEN 1 ELSE 0 END) as vendor
    FROM attendees WHERE event_id = ?`
  ).bind(eventId).first();
  return {
    registered: Number(row?.registered || 0),
    checkedIn: Number(row?.checked_in || 0),
    enterprise: Number(row?.enterprise || 0),
    vendor: Number(row?.vendor || 0),
  };
}

// Get full event data for kiosk cache (attendees + event info)
app.get('/event/:id/data', async (c) => {
  const eventId = c.req.param('id');

  const [eventRow, attendeesRes, stats] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first(),
    c.env.DB.prepare(
      `SELECT a.id, a.name, a.email, a.company, a.title, a.type, a.checked_in,
              COALESCE(u.linkedin_url, '') as linkedin_url
       FROM attendees a
       LEFT JOIN users u ON LOWER(a.email) = LOWER(u.email)
       WHERE a.event_id = ? ORDER BY a.name ASC`
    ).bind(eventId).all(),
    computeStats(c.env.DB, eventId),
  ]);

  if (!eventRow) return c.json({ error: 'Event not found' }, 404);

  return c.json({
    event: {
      id: eventRow.id,
      name: eventRow.name,
      date: eventRow.date,
      venue: eventRow.venue,
      eventType: eventRow.event_type || 'quarterly_meetup',
    },
    attendees: (attendeesRes.results || []).map(a => ({
      id: String(a.id),
      name: String(a.name),
      email: String(a.email),
      company: String(a.company || ''),
      title: String(a.title || ''),
      type: String(a.type || 'enterprise'),
      checkedIn: Boolean(a.checked_in),
      linkedinUrl: String(a.linkedin_url || ''),
    })),
    stats,
  });
});

// Check in a registered attendee
app.post('/event/:eventId/checkin/:attendeeId', async (c) => {
  const eventId = c.req.param('eventId');
  const attendeeId = c.req.param('attendeeId');
  const body = await c.req.json<{ stationId?: string }>().catch(() => ({}));

  const attendee = await c.env.DB.prepare(
    `SELECT a.*, COALESCE(u.linkedin_url, '') as linkedin_url
     FROM attendees a
     LEFT JOIN users u ON LOWER(a.email) = LOWER(u.email)
     WHERE a.id = ? AND a.event_id = ?`
  ).bind(attendeeId, eventId).first();

  if (!attendee) return c.json({ error: 'Attendee not found' }, 404);

  // Idempotent: if already checked in, just return success
  if (!attendee.checked_in) {
    const now = new Date().toISOString();
    await c.env.DB.prepare(
      'UPDATE attendees SET checked_in = 1, checked_in_at = ?, checked_in_by = ? WHERE id = ?'
    ).bind(now, (body as Record<string, string>).stationId || 'kiosk', attendeeId).run();
  }

  return c.json({
    success: true,
    attendee: {
      id: String(attendee.id),
      name: String(attendee.name),
      company: String(attendee.company || ''),
      title: String(attendee.title || ''),
      type: String(attendee.type || 'enterprise'),
      linkedinUrl: String(attendee.linkedin_url || ''),
    },
  });
});

// Walk-in: register + check in a new attendee (also creates user account)
app.post('/event/:eventId/walkin', async (c) => {
  const eventId = c.req.param('eventId');
  const body = await c.req.json<{
    firstName: string; lastName: string; email: string;
    company?: string; title?: string; phone?: string;
    type?: string; linkedinUrl?: string;
    termsAccepted: boolean;
    consentEmail: boolean; consentText: boolean; consentDataSharing: boolean;
  }>();

  const fullName = `${body.firstName || ''} ${body.lastName || ''}`.trim();
  if (!fullName || !body.email) {
    return c.json({ error: 'Name and email are required' }, 400);
  }
  if (!body.termsAccepted) {
    return c.json({ error: 'Terms must be accepted' }, 400);
  }

  const email = body.email.toLowerCase();
  const attendeeType = body.type === 'vendor' ? 'vendor' : 'enterprise';
  const now = new Date().toISOString();

  // Check if already registered as attendee for this event
  const existingAttendee = await c.env.DB.prepare(
    'SELECT id, checked_in FROM attendees WHERE event_id = ? AND LOWER(email) = ?'
  ).bind(eventId, email).first();

  if (existingAttendee) {
    // Already registered for event — just check them in
    if (!existingAttendee.checked_in) {
      await c.env.DB.prepare(
        'UPDATE attendees SET checked_in = 1, checked_in_at = ?, checked_in_by = ? WHERE id = ?'
      ).bind(now, 'kiosk-walkin', String(existingAttendee.id)).run();
    }
    const row = await c.env.DB.prepare(
      `SELECT a.*, COALESCE(u.linkedin_url, '') as linkedin_url
       FROM attendees a
       LEFT JOIN users u ON LOWER(a.email) = LOWER(u.email)
       WHERE a.id = ?`
    ).bind(String(existingAttendee.id)).first();
    return c.json({
      success: true,
      existing: true,
      attendee: {
        id: String(row!.id),
        name: String(row!.name),
        company: String(row!.company || ''),
        title: String(row!.title || ''),
        type: String(row!.type || 'enterprise'),
        linkedinUrl: String(row!.linkedin_url || ''),
      },
    });
  }

  // Check if user account already exists (registered on web but not for this event)
  const existingUser = await c.env.DB.prepare(
    'SELECT id FROM users WHERE LOWER(email) = ?'
  ).bind(email).first();

  const attendeeId = 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  if (existingUser) {
    // User exists — just add attendee record for this event
    await c.env.DB.prepare(
      'INSERT INTO attendees (id, event_id, name, email, company, title, type, checked_in, checked_in_at, checked_in_by, sponsor_consent) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)'
    ).bind(attendeeId, eventId, fullName, email, body.company || '', body.title || '', attendeeType, now, 'kiosk-walkin', body.consentDataSharing ? 1 : 0).run();
  } else {
    // New user — create user account + attendee record in a batch
    const userId = crypto.randomUUID();
    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO users (id, name, email, role, first_name, last_name, phone, company, title, user_type,
          terms_accepted, onboarding_complete, consent_email, consent_text, consent_data_sharing,
          linkedin_url, privacy_show_email, privacy_show_phone, privacy_show_company, privacy_show_title,
          privacy_show_linkedin, privacy_show_type, privacy_listed, profile_updated_at)
        VALUES (?, ?, ?, 'member', ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, 1, 1, 1, 1, 1, 1, 1, datetime('now'))`
      ).bind(
        userId, fullName, email,
        body.firstName, body.lastName, body.phone || '', body.company || '', body.title || '', attendeeType,
        body.consentEmail ? 1 : 0, body.consentText ? 1 : 0, body.consentDataSharing ? 1 : 0,
        body.linkedinUrl || '',
      ),
      c.env.DB.prepare(
        'INSERT INTO attendees (id, event_id, name, email, company, title, type, checked_in, checked_in_at, checked_in_by, sponsor_consent) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)'
      ).bind(attendeeId, eventId, fullName, email, body.company || '', body.title || '', attendeeType, now, 'kiosk-walkin', body.consentDataSharing ? 1 : 0),
    ]);
  }

  return c.json({
    success: true,
    existing: false,
    attendee: {
      id: attendeeId,
      name: fullName,
      company: body.company || '',
      title: body.title || '',
      type: attendeeType,
      linkedinUrl: body.linkedinUrl || '',
    },
  });
});

// LinkedIn profile suggestions — search our users DB for matching profiles
app.get('/linkedin-suggest', async (c) => {
  const q = (c.req.query('q') || '').trim();
  const email = (c.req.query('email') || '').trim().toLowerCase();
  if (!q && !email) return c.json({ suggestions: [] });

  const suggestions: { name: string; url: string; headline: string }[] = [];

  // 1. Exact email match (highest priority)
  if (email) {
    const user = await c.env.DB.prepare(
      'SELECT name, linkedin_url, title, company FROM users WHERE LOWER(email) = ? AND linkedin_url != \'\''
    ).bind(email).first();
    if (user && user.linkedin_url) {
      suggestions.push({
        name: String(user.name),
        url: String(user.linkedin_url),
        headline: [user.title, user.company].filter(Boolean).join(' at '),
      });
    }
  }

  // 2. Name-based search in our users DB (people who have LinkedIn URLs)
  if (q.length >= 2) {
    const nameResults = await c.env.DB.prepare(
      `SELECT name, linkedin_url, title, company FROM users
       WHERE linkedin_url != '' AND LOWER(name) LIKE ?
       ORDER BY name ASC LIMIT 8`
    ).bind(`%${q.toLowerCase()}%`).all();

    for (const row of nameResults.results || []) {
      const url = String(row.linkedin_url);
      if (!suggestions.some(s => s.url === url)) {
        suggestions.push({
          name: String(row.name),
          url,
          headline: [row.title, row.company].filter(Boolean).join(' at '),
        });
      }
    }
  }

  // 3. Generate slug suggestion from the query name
  if (q) {
    const slug = q.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const suggestedUrl = `https://www.linkedin.com/in/${slug}`;
    if (!suggestions.some(s => s.url === suggestedUrl)) {
      suggestions.push({ name: q, url: suggestedUrl, headline: 'Suggested profile URL' });
    }
  }

  return c.json({ suggestions });
});

// Save LinkedIn URL for a checked-in attendee (kiosk flow)
app.post('/save-linkedin', async (c) => {
  const body = await c.req.json<{ email: string; linkedinUrl: string }>();
  if (!body.email || !body.linkedinUrl) return c.json({ error: 'Missing fields' }, 400);

  await c.env.DB.prepare(
    'UPDATE users SET linkedin_url = ? WHERE LOWER(email) = ?'
  ).bind(body.linkedinUrl, body.email.toLowerCase()).run();

  return c.json({ success: true });
});

// Live stats — computed dynamically
app.get('/event/:id/stats', async (c) => {
  const eventId = c.req.param('id');
  const eventExists = await c.env.DB.prepare('SELECT id FROM events WHERE id = ?').bind(eventId).first();
  if (!eventExists) return c.json({ error: 'Event not found' }, 404);

  const stats = await computeStats(c.env.DB, eventId);
  return c.json(stats);
});

export default app;
