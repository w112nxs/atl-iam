import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get current user
app.get('/me', requireAuth, (c) => {
  return c.json(c.get('user'));
});

// Accept terms
app.put('/me/terms', requireAuth, async (c) => {
  const user = c.get('user');
  await c.env.DB.prepare('UPDATE users SET terms_accepted = 1 WHERE id = ?')
    .bind(user.id)
    .run();
  return c.json({ success: true });
});

export default app;
