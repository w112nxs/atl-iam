import { Hono } from 'hono';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Kiosk authentication middleware — validates pre-shared token
const requireKiosk = async (c: Parameters<Parameters<typeof app.use>[1]>[0], next: () => Promise<void>) => {
  const auth = c.req.header('Authorization') || '';
  const match = auth.match(/^Bearer kiosk:(.+)$/);
  if (!match || match[1] !== c.env.KIOSK_SECRET) {
    return c.json({ error: 'Invalid kiosk token' }, 401);
  }
  await next();
};

app.use('/*', requireKiosk);

// Get full event data for kiosk cache (attendees + event info)
app.get('/event/:id/data', async (c) => {
  const eventId = c.req.param('id');

  const [eventRow, attendeesRes] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first(),
    c.env.DB.prepare(
      'SELECT id, name, email, company, title, type, checked_in FROM attendees WHERE event_id = ? ORDER BY name ASC'
    ).bind(eventId).all(),
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
    stats: {
      registered: Number(eventRow.stats_registered || 0),
      checkedIn: Number(eventRow.stats_checked_in || 0),
      enterprise: Number(eventRow.stats_enterprise || 0),
      vendor: Number(eventRow.stats_vendor || 0),
    },
  });
});

// Check in a registered attendee
app.post('/event/:eventId/checkin/:attendeeId', async (c) => {
  const eventId = c.req.param('eventId');
  const attendeeId = c.req.param('attendeeId');
  const body = await c.req.json<{ stationId?: string }>().catch(() => ({}));

  // Get attendee
  const attendee = await c.env.DB.prepare(
    'SELECT * FROM attendees WHERE id = ? AND event_id = ?'
  ).bind(attendeeId, eventId).first();

  if (!attendee) return c.json({ error: 'Attendee not found' }, 404);

  // Idempotent: if already checked in, just return success
  if (!attendee.checked_in) {
    const now = new Date().toISOString();
    await c.env.DB.batch([
      c.env.DB.prepare(
        'UPDATE attendees SET checked_in = 1, checked_in_at = ?, checked_in_by = ? WHERE id = ?'
      ).bind(now, (body as Record<string, string>).stationId || 'kiosk', attendeeId),
      c.env.DB.prepare(
        'UPDATE events SET stats_checked_in = stats_checked_in + 1 WHERE id = ?'
      ).bind(eventId),
    ]);
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
      await c.env.DB.batch([
        c.env.DB.prepare(
          'UPDATE attendees SET checked_in = 1, checked_in_at = ?, checked_in_by = ? WHERE id = ?'
        ).bind(new Date().toISOString(), 'kiosk-walkin', String(existing.id)),
        c.env.DB.prepare(
          'UPDATE events SET stats_checked_in = stats_checked_in + 1 WHERE id = ?'
        ).bind(eventId),
      ]);
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

  await c.env.DB.batch([
    c.env.DB.prepare(
      'INSERT INTO attendees (id, event_id, name, email, company, title, type, checked_in, checked_in_at, checked_in_by) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)'
    ).bind(id, eventId, body.name, body.email.toLowerCase(), body.company || '', body.title || '', attendeeType, now, 'kiosk-walkin'),
    c.env.DB.prepare(
      'UPDATE events SET stats_registered = stats_registered + 1, stats_checked_in = stats_checked_in + 1 WHERE id = ?'
    ).bind(eventId),
  ]);

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

// Live stats
app.get('/event/:id/stats', async (c) => {
  const eventId = c.req.param('id');
  const row = await c.env.DB.prepare(
    'SELECT stats_registered, stats_checked_in, stats_enterprise, stats_vendor FROM events WHERE id = ?'
  ).bind(eventId).first();

  if (!row) return c.json({ error: 'Event not found' }, 404);

  return c.json({
    registered: Number(row.stats_registered || 0),
    checkedIn: Number(row.stats_checked_in || 0),
    enterprise: Number(row.stats_enterprise || 0),
    vendor: Number(row.stats_vendor || 0),
  });
});

export default app;
