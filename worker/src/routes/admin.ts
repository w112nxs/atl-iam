import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Admin: list all events with full data
app.get('/events', requireAuth, requireRole('admin'), async (c) => {
  const [eventsRes, sponsorsRes, sessionsRes] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM events ORDER BY id ASC').all(),
    c.env.DB.prepare('SELECT * FROM event_sponsors').all(),
    c.env.DB.prepare('SELECT * FROM sessions ORDER BY session_time ASC').all(),
  ]);

  const events = (eventsRes.results || []).map((e) => ({
    id: e.id,
    name: e.name,
    date: e.date,
    venue: e.venue,
    sponsors: (sponsorsRes.results || [])
      .filter((s) => s.event_id === e.id)
      .map((s) => ({ id: s.sponsor_id, name: s.sponsor_name, tier: s.tier })),
    sessions: (sessionsRes.results || [])
      .filter((s) => s.event_id === e.id)
      .map((s) => ({ id: s.id, title: s.title, speaker: s.speaker, time: s.session_time, cpe: s.cpe })),
    attendees: [],
    stats: {
      registered: e.stats_registered,
      checkedIn: e.stats_checked_in,
      enterprise: e.stats_enterprise,
      vendor: e.stats_vendor,
    },
  }));

  return c.json(events);
});

export default app;
