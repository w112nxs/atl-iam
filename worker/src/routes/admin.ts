import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── Events ──

// Admin: list all events with full data
app.get('/events', requireAuth, requireRole('admin'), async (c) => {
  const [eventsRes, sponsorsRes, sessionsRes, statsRes] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM events ORDER BY date DESC').all(),
    c.env.DB.prepare('SELECT * FROM event_sponsors').all(),
    c.env.DB.prepare('SELECT * FROM sessions ORDER BY session_time ASC').all(),
    c.env.DB.prepare(
      `SELECT event_id,
        COUNT(*) as registered,
        SUM(CASE WHEN checked_in = 1 THEN 1 ELSE 0 END) as checked_in,
        SUM(CASE WHEN type = 'enterprise' THEN 1 ELSE 0 END) as enterprise,
        SUM(CASE WHEN type = 'vendor' THEN 1 ELSE 0 END) as vendor
      FROM attendees GROUP BY event_id`
    ).all(),
  ]);

  const statsMap = new Map((statsRes.results || []).map(s => [s.event_id, s]));

  const events = (eventsRes.results || []).map((e) => {
    const s = statsMap.get(e.id);
    return {
      id: e.id,
      name: e.name,
      date: e.date,
      venue: e.venue,
      eventType: e.event_type || 'quarterly_meetup',
      description: e.description || '',
      maxCapacity: e.max_capacity || 0,
      sponsors: (sponsorsRes.results || [])
        .filter((sp) => sp.event_id === e.id)
        .map((sp) => ({ id: sp.sponsor_id, name: sp.sponsor_name, tier: sp.tier })),
      sessions: (sessionsRes.results || [])
        .filter((ss) => ss.event_id === e.id)
        .map((ss) => ({ id: ss.id, title: ss.title, speaker: ss.speaker, time: ss.session_time, cpe: ss.cpe })),
      attendees: [],
      stats: {
        registered: Number(s?.registered || 0),
        checkedIn: Number(s?.checked_in || 0),
        enterprise: Number(s?.enterprise || 0),
        vendor: Number(s?.vendor || 0),
      },
    };
  });

  return c.json(events);
});

// Create event
app.post('/events', requireAuth, requireRole('admin'), async (c) => {
  const body = await c.req.json<{
    name: string; date: string; venue?: string; eventType?: string;
    description?: string; maxCapacity?: number;
  }>();

  if (!body.name || !body.date) {
    return c.json({ error: 'Name and date are required' }, 400);
  }

  const id = 'e' + Date.now().toString(36);
  await c.env.DB.prepare(
    'INSERT INTO events (id, name, date, venue, event_type, description, max_capacity) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.name, body.date, body.venue || '', body.eventType || 'quarterly_meetup', body.description || '', body.maxCapacity || 0).run();

  return c.json({ success: true, id });
});

// Update event
app.put('/events/:id', requireAuth, requireRole('admin'), async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    name?: string; date?: string; venue?: string; eventType?: string;
    description?: string; maxCapacity?: number;
    statsRegistered?: number; statsCheckedIn?: number;
    statsEnterprise?: number; statsVendor?: number;
  }>();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) { updates.push('name = ?'); values.push(body.name); }
  if (body.date !== undefined) { updates.push('date = ?'); values.push(body.date); }
  if (body.venue !== undefined) { updates.push('venue = ?'); values.push(body.venue); }
  if (body.eventType !== undefined) { updates.push('event_type = ?'); values.push(body.eventType); }
  if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description); }
  if (body.maxCapacity !== undefined) { updates.push('max_capacity = ?'); values.push(body.maxCapacity); }
  if (body.statsRegistered !== undefined) { updates.push('stats_registered = ?'); values.push(body.statsRegistered); }
  if (body.statsCheckedIn !== undefined) { updates.push('stats_checked_in = ?'); values.push(body.statsCheckedIn); }
  if (body.statsEnterprise !== undefined) { updates.push('stats_enterprise = ?'); values.push(body.statsEnterprise); }
  if (body.statsVendor !== undefined) { updates.push('stats_vendor = ?'); values.push(body.statsVendor); }

  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400);

  values.push(id);
  await c.env.DB.prepare(
    `UPDATE events SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return c.json({ success: true });
});

// Delete event (cascades sponsors, sessions, attendees)
app.delete('/events/:id', requireAuth, requireRole('admin'), async (c) => {
  const id = c.req.param('id');

  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM attendees WHERE event_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM sessions WHERE event_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM event_sponsors WHERE event_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id),
  ]);

  return c.json({ success: true });
});

// Admin: get attendees for an event with check-in details
app.get('/events/:id/attendees', requireAuth, requireRole('admin'), async (c) => {
  const eventId = c.req.param('id');
  const filter = c.req.query('filter'); // 'checked_in', 'not_checked_in', 'enterprise', 'vendor'

  let sql = 'SELECT * FROM attendees WHERE event_id = ?';
  if (filter === 'checked_in') sql += ' AND checked_in = 1';
  else if (filter === 'not_checked_in') sql += ' AND checked_in = 0';
  else if (filter === 'enterprise') sql += " AND type = 'enterprise'";
  else if (filter === 'vendor') sql += " AND type = 'vendor'";
  sql += ' ORDER BY name ASC';

  const rows = await c.env.DB.prepare(sql).bind(eventId).all();
  return c.json((rows.results || []).map(a => ({
    id: a.id,
    name: a.name,
    email: a.email,
    company: a.company || '',
    title: a.title || '',
    type: a.type || 'enterprise',
    checkedIn: Boolean(a.checked_in),
    checkedInAt: a.checked_in_at || '',
    checkedInBy: a.checked_in_by || '',
  })));
});

// ── Sessions (within events) ──

// Add session to event
app.post('/events/:eventId/sessions', requireAuth, requireRole('admin'), async (c) => {
  const eventId = c.req.param('eventId');
  const body = await c.req.json<{
    title: string; speaker?: string; time?: string; cpe?: number;
  }>();

  if (!body.title) return c.json({ error: 'Title is required' }, 400);

  const id = 's' + Date.now().toString(36);
  await c.env.DB.prepare(
    'INSERT INTO sessions (id, event_id, title, speaker, session_time, cpe) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, eventId, body.title, body.speaker || '', body.time || '', body.cpe ?? 1).run();

  return c.json({ success: true, id });
});

// Update session
app.put('/sessions/:id', requireAuth, requireRole('admin'), async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    title?: string; speaker?: string; time?: string; cpe?: number;
  }>();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title); }
  if (body.speaker !== undefined) { updates.push('speaker = ?'); values.push(body.speaker); }
  if (body.time !== undefined) { updates.push('session_time = ?'); values.push(body.time); }
  if (body.cpe !== undefined) { updates.push('cpe = ?'); values.push(body.cpe); }

  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400);

  values.push(id);
  await c.env.DB.prepare(
    `UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return c.json({ success: true });
});

// Delete session
app.delete('/sessions/:id', requireAuth, requireRole('admin'), async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// ── Sponsor Management ──

// List all sponsors (across all events)
app.get('/sponsors', requireAuth, requireRole('admin'), async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT es.event_id, es.sponsor_id, es.sponsor_name, es.tier, e.name as event_name FROM event_sponsors es JOIN events e ON es.event_id = e.id ORDER BY e.date DESC, es.tier ASC'
  ).all();
  return c.json(rows.results.map(r => ({
    eventId: r.event_id,
    eventName: r.event_name,
    sponsorId: r.sponsor_id,
    sponsorName: r.sponsor_name,
    tier: r.tier,
  })));
});

// Get sponsor contacts (users with matching sponsor_id)
app.get('/sponsors/:sponsorId/contacts', requireAuth, requireRole('admin'), async (c) => {
  const sponsorId = c.req.param('sponsorId');
  const rows = await c.env.DB.prepare(
    'SELECT id, name, email, company, title, phone FROM users WHERE sponsor_id = ? ORDER BY name ASC'
  ).bind(sponsorId).all();
  return c.json(rows.results.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company,
    title: r.title,
    phone: r.phone,
  })));
});

// Add a sponsor to an event
app.post('/sponsors', requireAuth, requireRole('admin'), async (c) => {
  const body = await c.req.json<{
    eventId: string;
    sponsorId: string;
    sponsorName: string;
    tier: 'Gold' | 'Silver' | 'Community';
  }>();

  if (!body.eventId || !body.sponsorId || !body.sponsorName || !body.tier) {
    return c.json({ error: 'All fields are required' }, 400);
  }

  await c.env.DB.prepare(
    'INSERT OR REPLACE INTO event_sponsors (event_id, sponsor_id, sponsor_name, tier) VALUES (?, ?, ?, ?)'
  ).bind(body.eventId, body.sponsorId, body.sponsorName, body.tier).run();

  return c.json({ success: true });
});

// Update a sponsor
app.put('/sponsors/:eventId/:sponsorId', requireAuth, requireRole('admin'), async (c) => {
  const eventId = c.req.param('eventId');
  const sponsorId = c.req.param('sponsorId');
  const body = await c.req.json<{
    sponsorName?: string;
    tier?: 'Gold' | 'Silver' | 'Community';
  }>();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.sponsorName !== undefined) { updates.push('sponsor_name = ?'); values.push(body.sponsorName); }
  if (body.tier !== undefined) { updates.push('tier = ?'); values.push(body.tier); }

  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400);

  values.push(eventId, sponsorId);
  await c.env.DB.prepare(
    `UPDATE event_sponsors SET ${updates.join(', ')} WHERE event_id = ? AND sponsor_id = ?`
  ).bind(...values).run();

  return c.json({ success: true });
});

// Delete a sponsor from an event
app.delete('/sponsors/:eventId/:sponsorId', requireAuth, requireRole('admin'), async (c) => {
  const eventId = c.req.param('eventId');
  const sponsorId = c.req.param('sponsorId');

  await c.env.DB.prepare(
    'DELETE FROM event_sponsors WHERE event_id = ? AND sponsor_id = ?'
  ).bind(eventId, sponsorId).run();

  return c.json({ success: true });
});

export default app;
