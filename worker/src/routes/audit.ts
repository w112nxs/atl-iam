import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Log data export
app.post('/export', requireAuth, requireRole('sponsor', 'admin'), async (c) => {
  const user = c.get('user');
  const { eventId, attendeeCount, tier, timestamp } = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    'INSERT INTO audit_log (id, user_email, action, event_id, attendee_count, tier, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(id, user.email, 'csv_export', eventId, attendeeCount, tier, timestamp)
    .run();

  return c.json({ success: true });
});

export default app;
