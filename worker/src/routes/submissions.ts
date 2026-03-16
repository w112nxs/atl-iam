import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Submit speaking proposal
app.post('/speaking', requireAuth, async (c) => {
  const user = c.get('user');
  const { title, abstract, company, type, coPresenter, email, phone, linkedinUrl, consentNameListed, consentLinkedinLinked, consentWebsiteListed } = await c.req.json();

  // Validate required fields
  if (!title?.trim() || !abstract?.trim() || !email?.trim() || !phone?.trim()) {
    return c.json({ error: 'Title, abstract, email, and phone are required' }, 400);
  }
  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return c.json({ error: 'Please provide a valid email address' }, 400);
  }
  // Basic phone validation (at least 7 digits)
  if (!/\d{7,}/.test(phone.replace(/[\s\-().+]/g, ''))) {
    return c.json({ error: 'Please provide a valid phone number' }, 400);
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO submissions_speaking (id, user_id, presenter_type, company, title, abstract, co_presenter, email, phone, linkedin_url, consent_name_listed, consent_linkedin_linked, consent_website_listed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, user.id, type, company, title.trim(), abstract.trim(), coPresenter || null, email.trim(), phone.trim(), linkedinUrl?.trim() || '', consentNameListed ? 1 : 0, consentLinkedinLinked ? 1 : 0, consentWebsiteListed ? 1 : 0)
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
