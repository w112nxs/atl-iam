import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { rateLimit } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import userRoutes from './routes/users';
import submissionRoutes from './routes/submissions';
import adminRoutes from './routes/admin';
import auditRoutes from './routes/audit';
import type { Bindings, Variables } from './types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use(
  '/*',
  cors({
    origin: (origin) => origin || '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

// Global rate limit — 100 requests per 15 minutes per IP
app.use('/*', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, keyPrefix: 'global' }));

// Stricter rate limit for auth endpoints — 20 requests per 15 minutes
app.use('/api/auth/*', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, keyPrefix: 'auth' }));

app.route('/api/auth', authRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/users', userRoutes);
app.route('/api/submissions', submissionRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/audit', auditRoutes);

app.get('/api/health', async (c) => {
  // Opportunistically clean up old rate limit entries (older than 1 hour)
  try {
    await c.env.DB.prepare('DELETE FROM rate_limits WHERE timestamp < ?')
      .bind(Date.now() - 60 * 60 * 1000).run();
  } catch { /* ignore */ }
  return c.json({ status: 'ok', ts: new Date().toISOString() });
});

export default app;
