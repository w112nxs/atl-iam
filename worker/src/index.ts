import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

app.route('/api/auth', authRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/users', userRoutes);
app.route('/api/submissions', submissionRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/audit', auditRoutes);

app.get('/api/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }));

export default app;
