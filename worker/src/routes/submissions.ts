import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Submit speaking proposal
app.post('/speaking', requireAuth, async (c) => {
  const user = c.get('user');
  const { title, abstract, company, type, coPresenter } = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    'INSERT INTO submissions_speaking (id, user_id, presenter_type, company, title, abstract, co_presenter) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(id, user.id, type, company, title, abstract, coPresenter || null)
    .run();

  return c.json({ success: true });
});

// Submit sponsorship request
app.post('/sponsor', requireAuth, async (c) => {
  const user = c.get('user');
  const { companyName, contactEmail, tier, notes } = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    'INSERT INTO submissions_sponsor (id, user_id, tier, company_name, contact_email, notes) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(id, user.id, tier, companyName, contactEmail, notes || null)
    .run();

  return c.json({ success: true });
});

export default app;
