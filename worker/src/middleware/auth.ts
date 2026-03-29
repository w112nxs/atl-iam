import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../lib/jwt';
import { hashToken } from '../lib/hash';
import type { Bindings, Variables, UserPayload } from '../types';

export const requireAuth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
  async (c, next) => {
    const header = c.req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const token = header.slice(7);
    try {
      const decoded = await verifyToken(token, c.env.JWT_SECRET);

      // Verify session still exists in DB (revoked sessions are deleted)
      const tokenHash = await hashToken(token);
      const session = await c.env.DB.prepare(
        'SELECT id FROM user_sessions WHERE token_hash = ? AND user_id = ?',
      ).bind(tokenHash, (decoded as Record<string, unknown>).id).first();

      if (!session) {
        return c.json({ error: 'Session revoked' }, 401);
      }

      // Update last_active timestamp (fire-and-forget)
      c.executionCtx.waitUntil(
        c.env.DB.prepare(
          "UPDATE user_sessions SET last_active = datetime('now') WHERE id = ?",
        ).bind(session.id).run(),
      );

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

