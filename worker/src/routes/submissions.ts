import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// List user's speaking submissions
app.get('/speaking/mine', requireAuth, async (c) => {
  const user = c.get('user');

  const rows = await c.env.DB.prepare(
    `SELECT id, title, status, current_step, created_at, updated_at, admin_comment, speaker_name
     FROM submissions_speaking
     WHERE user_id = ?
     ORDER BY updated_at DESC`,
  )
    .bind(user.id)
    .all();

  return c.json(
    (rows.results || []).map((r) => ({
      id: r.id,
      title: r.title || '',
      status: r.status || 'draft',
      currentStep: r.current_step ?? 1,
      createdAt: r.created_at || '',
      updatedAt: r.updated_at || '',
      adminComment: r.admin_comment || '',
      speakerName: r.speaker_name || '',
    })),
  );
});

// Get full speaking submission detail
app.get('/speaking/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const row = await c.env.DB.prepare(
    'SELECT * FROM submissions_speaking WHERE id = ? AND user_id = ?',
  )
    .bind(id, user.id)
    .first();

  if (!row) {
    return c.json({ error: 'Submission not found' }, 404);
  }

  return c.json({
    id: row.id,
    userId: row.user_id,
    status: row.status || 'draft',
    currentStep: row.current_step ?? 1,
    presenterType: row.presenter_type || '',
    company: row.company || '',
    title: row.title || '',
    abstract: row.abstract || '',
    coPresenter: row.co_presenter || '',
    email: row.email || '',
    phone: row.phone || '',
    linkedinUrl: row.linkedin_url || '',
    consentNameListed: Boolean(row.consent_name_listed),
    consentLinkedinLinked: Boolean(row.consent_linkedin_linked),
    consentWebsiteListed: Boolean(row.consent_website_listed),
    submitterName: row.submitter_name || '',
    submitterEmail: row.submitter_email || '',
    submitterPhone: row.submitter_phone || '',
    submitterCompany: row.submitter_company || '',
    speakerName: row.speaker_name || '',
    speakerEmail: row.speaker_email || '',
    speakerPhone: row.speaker_phone || '',
    speakerCompany: row.speaker_company || '',
    speakerLinkedinUrl: row.speaker_linkedin_url || '',
    adminComment: row.admin_comment || '',
    reviewedBy: row.reviewed_by || '',
    reviewedAt: row.reviewed_at || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  });
});

// Submit speaking proposal (create draft)
app.post('/speaking', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const {
    title, abstract, company, type, coPresenter, email, phone, linkedinUrl,
    consentNameListed, consentLinkedinLinked, consentWebsiteListed,
    currentStep, submitterName, submitterEmail, submitterPhone, submitterCompany,
    speakerName, speakerEmail, speakerPhone, speakerCompany, speakerLinkedinUrl,
  } = body;

  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO submissions_speaking (
      id, user_id, presenter_type, company, title, abstract, co_presenter,
      email, phone, linkedin_url,
      consent_name_listed, consent_linkedin_linked, consent_website_listed,
      status, current_step,
      submitter_name, submitter_email, submitter_phone, submitter_company,
      speaker_name, speaker_email, speaker_phone, speaker_company, speaker_linkedin_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id, user.id,
      type || '', company || '', (title || '').trim(), (abstract || '').trim(),
      coPresenter || null,
      (email || '').trim(), (phone || '').trim(), (linkedinUrl || '').trim(),
      consentNameListed ? 1 : 0, consentLinkedinLinked ? 1 : 0, consentWebsiteListed ? 1 : 0,
      currentStep ?? 1,
      submitterName || '', submitterEmail || '', submitterPhone || '', submitterCompany || '',
      speakerName || '', speakerEmail || '', speakerPhone || '', speakerCompany || '', speakerLinkedinUrl || '',
    )
    .run();

  return c.json({ success: true, id });
});

// Update a draft/rejected speaking submission
app.put('/speaking/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  // Verify ownership and status
  const existing = await c.env.DB.prepare(
    'SELECT user_id, status FROM submissions_speaking WHERE id = ?',
  )
    .bind(id)
    .first();

  if (!existing) {
    return c.json({ error: 'Submission not found' }, 404);
  }
  if (existing.user_id !== user.id) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  if (existing.status !== 'draft' && existing.status !== 'rejected') {
    return c.json({ error: 'Cannot edit a submission with status: ' + existing.status }, 400);
  }

  const body = await c.req.json();

  const updates: string[] = [];
  const values: unknown[] = [];

  const fieldMap: Record<string, string> = {
    title: 'title',
    abstract: 'abstract',
    company: 'company',
    type: 'presenter_type',
    coPresenter: 'co_presenter',
    email: 'email',
    phone: 'phone',
    linkedinUrl: 'linkedin_url',
    currentStep: 'current_step',
    submitterName: 'submitter_name',
    submitterEmail: 'submitter_email',
    submitterPhone: 'submitter_phone',
    submitterCompany: 'submitter_company',
    speakerName: 'speaker_name',
    speakerEmail: 'speaker_email',
    speakerPhone: 'speaker_phone',
    speakerCompany: 'speaker_company',
    speakerLinkedinUrl: 'speaker_linkedin_url',
  };

  for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
    if (body[jsKey] !== undefined) {
      updates.push(`${dbCol} = ?`);
      values.push(typeof body[jsKey] === 'string' ? body[jsKey].trim() : body[jsKey]);
    }
  }

  // Boolean fields
  const boolMap: Record<string, string> = {
    consentNameListed: 'consent_name_listed',
    consentLinkedinLinked: 'consent_linkedin_linked',
    consentWebsiteListed: 'consent_website_listed',
  };
  for (const [jsKey, dbCol] of Object.entries(boolMap)) {
    if (body[jsKey] !== undefined) {
      updates.push(`${dbCol} = ?`);
      values.push(body[jsKey] ? 1 : 0);
    }
  }

  // If the submission was rejected, allow re-editing as draft
  if (existing.status === 'rejected') {
    updates.push('status = ?');
    values.push('draft');
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE submissions_speaking SET ${updates.join(', ')} WHERE id = ?`,
  )
    .bind(...values)
    .run();

  return c.json({ success: true });
});

// Submit a draft for review
app.post('/speaking/:id/submit', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const row = await c.env.DB.prepare(
    'SELECT * FROM submissions_speaking WHERE id = ? AND user_id = ?',
  )
    .bind(id, user.id)
    .first();

  if (!row) {
    return c.json({ error: 'Submission not found' }, 404);
  }
  if (row.status !== 'draft') {
    return c.json({ error: 'Only draft submissions can be submitted for review' }, 400);
  }

  // Validate required fields
  const errors: string[] = [];
  if (!row.title || !(row.title as string).trim()) errors.push('title');
  if (!row.abstract || !(row.abstract as string).trim()) errors.push('abstract');
  if (!row.speaker_name || !(row.speaker_name as string).trim()) errors.push('speaker name');
  if (!row.speaker_email || !(row.speaker_email as string).trim()) errors.push('speaker email');
  if (!row.speaker_phone || !(row.speaker_phone as string).trim()) errors.push('speaker phone');
  if (!row.consent_name_listed) errors.push('consent to name being listed');
  if (!row.consent_linkedin_linked) errors.push('consent to LinkedIn being linked');
  if (!row.consent_website_listed) errors.push('consent to website listing');

  if (errors.length > 0) {
    return c.json({ error: `Missing required fields: ${errors.join(', ')}` }, 400);
  }

  // Copy speaker fields to legacy columns and change status to pending
  await c.env.DB.prepare(
    `UPDATE submissions_speaking
     SET status = 'pending',
         email = ?,
         phone = ?,
         linkedin_url = ?,
         company = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(
      (row.speaker_email as string).trim(),
      (row.speaker_phone as string).trim(),
      ((row.speaker_linkedin_url as string) || '').trim(),
      ((row.speaker_company as string) || '').trim(),
      id,
    )
    .run();

  return c.json({ success: true });
});

// Delete a draft speaking submission
app.delete('/speaking/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare(
    'SELECT user_id, status FROM submissions_speaking WHERE id = ?',
  )
    .bind(id)
    .first();

  if (!existing) {
    return c.json({ error: 'Submission not found' }, 404);
  }
  if (existing.user_id !== user.id) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  if (existing.status !== 'draft') {
    return c.json({ error: 'Only draft submissions can be deleted' }, 400);
  }

  await c.env.DB.prepare('DELETE FROM submissions_speaking WHERE id = ?')
    .bind(id)
    .run();

  return c.json({ success: true });
});

// Submit sponsorship request
app.post('/sponsor', requireAuth, async (c) => {
  const user = c.get('user');
  const { companyName, contactEmail, notes } = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    'INSERT INTO submissions_sponsor (id, user_id, company_name, contact_email, notes) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, user.id, companyName, contactEmail, notes || null)
    .run();

  return c.json({ success: true });
});

export default app;
