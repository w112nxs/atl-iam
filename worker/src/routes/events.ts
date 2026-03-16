import { Hono } from 'hono';
import { requireAuth, requireRole, requireSponsorAccess } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Public: list events (without attendees)
app.get('/', async (c) => {
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
    eventType: e.event_type || 'quarterly_meetup',
    description: e.description || '',
    maxCapacity: e.max_capacity || 0,
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

// Sponsor/admin: consent-filtered attendees with tier masking
app.get(
  '/:id/attendees',
  requireAuth,
  requireRole('sponsor', 'admin'),
  requireSponsorAccess('id'),
  async (c) => {
    const eventId = c.req.param('id');
    const user = c.get('user');

    // Determine tier
    let tier = 'Community';
    if (user.role === 'admin') {
      tier = 'Gold';
    } else {
      const sponsor = await c.env.DB.prepare(
        'SELECT tier FROM event_sponsors WHERE event_id = ? AND sponsor_id = ?',
      )
        .bind(eventId, user.sponsorId)
        .first();
      if (sponsor) tier = sponsor.tier as string;
    }

    const all = await c.env.DB.prepare('SELECT * FROM attendees WHERE event_id = ?')
      .bind(eventId)
      .all();

    const rows = all.results || [];
    const consented = rows.filter((a) => a.sponsor_consent);
    const optedOut = rows.length - consented.length;

    const masked = consented.map((a) => {
      const base: Record<string, unknown> = {
        id: a.id,
        name: a.name,
        company: a.company,
        sessions: JSON.parse(a.sessions as string).length,
      };
      if (tier === 'Gold' || tier === 'Silver') {
        base.title = a.title;
        base.certs = JSON.parse(a.certs as string);
      }
      if (tier === 'Gold') {
        base.email = a.email;
      }
      return base;
    });

    return c.json({ attendees: masked, optedOut, tier });
  },
);

// Sponsor/admin: session analytics
app.get(
  '/:id/sessions',
  requireAuth,
  requireRole('sponsor', 'admin'),
  requireSponsorAccess('id'),
  async (c) => {
    const eventId = c.req.param('id');

    const [sessionsRes, attendeesRes] = await Promise.all([
      c.env.DB.prepare('SELECT * FROM sessions WHERE event_id = ? ORDER BY session_time ASC')
        .bind(eventId)
        .all(),
      c.env.DB.prepare('SELECT sessions FROM attendees WHERE event_id = ? AND sponsor_consent = 1')
        .bind(eventId)
        .all(),
    ]);

    const sessions = sessionsRes.results || [];
    const attendeeSessions = (attendeesRes.results || []).map((a) =>
      JSON.parse(a.sessions as string) as string[],
    );

    const stats = sessions.map((s) => ({
      id: s.id,
      title: s.title,
      speaker: s.speaker,
      time: s.session_time,
      cpe: s.cpe,
      consentedCount: attendeeSessions.filter((arr) => arr.includes(s.id as string)).length,
    }));

    return c.json(stats);
  },
);

export default app;
