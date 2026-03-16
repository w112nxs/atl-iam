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
      'SELECT id, name, email, company, title, type, checked_in FROM attendees WHERE event_id = ? ORDER BY name ASC'
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
    'SELECT * FROM attendees WHERE id = ? AND event_id = ?'
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
    },
  });
});

// Walk-in: register + check in a new attendee
app.post('/event/:eventId/walkin', async (c) => {
  const eventId = c.req.param('eventId');
  const body = await c.req.json<{
    name: string; email: string; company?: string; title?: string; type?: string;
  }>();

  if (!body.name || !body.email) {
    return c.json({ error: 'Name and email are required' }, 400);
  }

  // Check if already registered by email
  const existing = await c.env.DB.prepare(
    'SELECT id, checked_in FROM attendees WHERE event_id = ? AND LOWER(email) = ?'
  ).bind(eventId, body.email.toLowerCase()).first();

  if (existing) {
    // Already registered — just check them in
    if (!existing.checked_in) {
      await c.env.DB.prepare(
        'UPDATE attendees SET checked_in = 1, checked_in_at = ?, checked_in_by = ? WHERE id = ?'
      ).bind(new Date().toISOString(), 'kiosk-walkin', String(existing.id)).run();
    }
    const row = await c.env.DB.prepare('SELECT * FROM attendees WHERE id = ?').bind(String(existing.id)).first();
    return c.json({
      success: true,
      attendee: {
        id: String(row!.id),
        name: String(row!.name),
        company: String(row!.company || ''),
        title: String(row!.title || ''),
        type: String(row!.type || 'enterprise'),
      },
    });
  }

  // New walk-in
  const id = 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();
  const attendeeType = body.type === 'vendor' ? 'vendor' : 'enterprise';

  await c.env.DB.prepare(
    'INSERT INTO attendees (id, event_id, name, email, company, title, type, checked_in, checked_in_at, checked_in_by) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)'
  ).bind(id, eventId, body.name, body.email.toLowerCase(), body.company || '', body.title || '', attendeeType, now, 'kiosk-walkin').run();

  return c.json({
    success: true,
    attendee: {
      id,
      name: body.name,
      company: body.company || '',
      title: body.title || '',
      type: attendeeType,
    },
  });
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
