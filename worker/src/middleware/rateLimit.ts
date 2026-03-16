import type { Context, Next } from 'hono';
import type { Bindings, Variables } from '../types';

/**
 * Simple rate limiter using D1 for state.
 * Uses a sliding window approach — tracks request counts per IP per window.
 */
export function rateLimit(opts: { windowMs: number; limit: number; keyPrefix?: string }) {
  const { windowMs, limit, keyPrefix = 'global' } = opts;

  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    const key = `${keyPrefix}:${ip}`;

    try {
      // Clean old entries and count recent ones in a single transaction
      await c.env.DB.prepare(
        'DELETE FROM rate_limits WHERE key = ? AND timestamp < ?'
      ).bind(key, windowStart).run();

      const countRow = await c.env.DB.prepare(
        'SELECT COUNT(*) as cnt FROM rate_limits WHERE key = ? AND timestamp >= ?'
      ).bind(key, windowStart).first();

      const count = Number(countRow?.cnt || 0);

      if (count >= limit) {
        return c.json(
          { error: 'Too many requests, please try again later' },
          429,
        );
      }

      // Record this request
      await c.env.DB.prepare(
        'INSERT INTO rate_limits (key, timestamp) VALUES (?, ?)'
      ).bind(key, now).run();
    } catch {
      // If rate limit table doesn't exist or DB fails, allow the request
      // Rate limiting should not break the app
    }

    await next();
  };
}
