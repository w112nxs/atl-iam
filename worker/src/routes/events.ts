import { Hono } from 'hono';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Public: list events (without attendees)
app.get('/', async (c) => {
  const [eventsRes, sponsorsRes, sessionsRes, statsRes] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM events ORDER BY id ASC').all(),
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
        .map((sp) => ({ id: sp.sponsor_id, name: sp.sponsor_name })),
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

export default app;
