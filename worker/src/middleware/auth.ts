import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../lib/jwt';
import type { Bindings, Variables, UserPayload } from '../types';

export const requireAuth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
  async (c, next) => {
    const header = c.req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    try {
      const decoded = await verifyToken(header.slice(7), c.env.JWT_SECRET);
      c.set('user', decoded as unknown as UserPayload);
      await next();
    } catch {
      return c.json({ error: 'Invalid token' }, 401);
    }
  },
);

export function requireRole(...roles: string[]) {
  return createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
    async (c, next) => {
      const user = c.get('user');
      if (!user || !roles.includes(user.role)) {
        return c.json({ error: 'Forbidden' }, 403);
      }
      await next();
    },
  );
}

export function requireSponsorAccess(eventIdParam: string) {
  return createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
    async (c, next) => {
      const user = c.get('user');
      if (!user) return c.json({ error: 'Unauthorized' }, 401);
      if (user.role === 'admin') {
        await next();
        return;
      }
      const eventId = c.req.param(eventIdParam);
      const sponsor = await c.env.DB.prepare(
        'SELECT 1 FROM event_sponsors WHERE event_id = ? AND sponsor_id = ?',
      )
        .bind(eventId, user.sponsorId)
        .first();
      if (!sponsor) {
        return c.json({ error: 'No sponsor access to this event' }, 403);
      }
      await next();
    },
  );
}
