# Notifications System Plan

Email notification system for the Atlanta IAM User Group portal using Amazon SES, with admin-managed templates and variable substitution.

**Email Provider:** Amazon SES (domain on Cloudflare, DNS verification via CNAME/TXT records)

---

## Setup: Amazon SES + Cloudflare DNS

### 1. SES Configuration
- Create SES identity for `atlantaiam.com` in AWS Console
- Add the required CNAME/TXT DNS records to Cloudflare for domain verification
- Set `FROM` address: `noreply@atlantaiam.com`
- Optional reply-to: `hello@atlantaiam.com`
- Request production access (out of sandbox) once verified

### 2. Worker Integration
- Store AWS credentials as Cloudflare Worker secrets:
  - `AWS_SES_ACCESS_KEY_ID`
  - `AWS_SES_SECRET_ACCESS_KEY`
  - `AWS_SES_REGION` (e.g., `us-east-1`)
- Use AWS SES v2 `SendEmail` API directly via `fetch()` (no SDK needed — sign requests with AWS Signature V4)
- Alternative: use `@aws-sdk/client-ses` if bundle size is acceptable

---

## Notification Scenarios

### Member Notifications

| Trigger | Recipient | Template Key |
|---------|-----------|-------------|
| New member registration | Member | `welcome_member` |
| New member registration | Admin | `admin_new_member` |
| Profile update reminder (1yr stale) | Member | `profile_stale_reminder` |
| Invite accepted | Inviter | `invite_accepted` |

### Speaking Submission Notifications

| Trigger | Recipient | Template Key |
|---------|-----------|-------------|
| New submission (draft → pending) | Submitter | `speaking_submitted` |
| New submission | Admin | `admin_new_speaking` |
| Submission approved | Submitter | `speaking_approved` |
| Submission rejected | Submitter | `speaking_rejected` |

### Sponsorship Notifications

| Trigger | Recipient | Template Key |
|---------|-----------|-------------|
| Sponsorship request submitted | Submitter | `sponsor_submitted` |
| Sponsorship request submitted | Admin | `admin_new_sponsor` |

### Event Notifications

| Trigger | Recipient | Template Key |
|---------|-----------|-------------|
| Event check-in (kiosk) | Attendee | `event_checkin` |
| Walk-in registration (kiosk) | Attendee | `event_walkin_welcome` |

---

## Template Variables

Each template has access to a set of variables that get substituted at send time.

### Global Variables (available in all templates)
- `{{siteName}}` — "Atlanta IAM User Group"
- `{{siteUrl}}` — "https://atlantaiam.com"
- `{{currentYear}}` — e.g., "2026"

### Member Variables
- `{{name}}` — full name
- `{{firstName}}` — first name
- `{{email}}` — email address
- `{{company}}` — company name
- `{{date}}` — action date (formatted)

### Speaking Variables
- `{{title}}` — talk title
- `{{abstract}}` — talk abstract (truncated)
- `{{speakerName}}` — speaker name
- `{{comment}}` — admin review comment (for approved/rejected)

### Event Variables
- `{{eventName}}` — event name
- `{{eventDate}}` — event date (formatted)
- `{{venue}}` — venue name

### Sponsor Variables
- `{{companyName}}` — sponsor company
- `{{contactEmail}}` — sponsor contact email
- `{{notes}}` — submission notes

### Invite Variables
- `{{inviterName}}` — who sent the invite
- `{{inviteeName}}` — who accepted
- `{{inviteeEmail}}` — invitee's email

---

## Database Schema

### `notification_templates` table

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | Template key (e.g., `welcome_member`) |
| name | TEXT | Human-readable name |
| description | TEXT | What triggers this notification |
| subject | TEXT | Email subject line (supports `{{variables}}`) |
| body_html | TEXT | Email body as HTML (supports `{{variables}}`) |
| enabled | INTEGER | 0 or 1 — admin can disable individual notifications |
| variables | TEXT | JSON array of available variable names for this template |
| updated_at | TEXT | Last modified timestamp |

### `notification_log` table

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| template_id | TEXT | FK to notification_templates |
| recipient_email | TEXT | Who received it |
| subject | TEXT | Rendered subject |
| status | TEXT | `sent` / `failed` / `queued` |
| error | TEXT | Error message if failed |
| created_at | TEXT | Timestamp |

---

## API Endpoints

### Admin Template Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/notifications/templates` | List all templates |
| GET | `/api/admin/notifications/templates/:id` | Get single template with preview |
| PUT | `/api/admin/notifications/templates/:id` | Update template (subject, body_html, enabled) |
| POST | `/api/admin/notifications/templates/:id/preview` | Render template with sample data, return HTML preview |
| POST | `/api/admin/notifications/templates/:id/test` | Send test email to admin |

### Admin Notification Log

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/notifications/log` | List recent notification log (paginated) |

### Internal (not exposed via API — called from other routes)

```typescript
// worker/src/lib/notifications.ts
async function sendNotification(
  db: D1Database,
  templateId: string,
  recipientEmail: string,
  variables: Record<string, string>,
  env: { AWS_SES_ACCESS_KEY_ID: string; AWS_SES_SECRET_ACCESS_KEY: string; AWS_SES_REGION: string }
): Promise<void>
```

---

## Admin UI — Notifications Tab

New tab in AdminView: `{ id: 'notifications', label: 'Notifications', color: T.amber }`

### Template List View
- Table of all templates showing: name, description, enabled toggle, last modified
- Click a template to edit

### Template Editor
- **Subject** input field with variable insertion buttons
- **Body** rich text area (HTML) with variable insertion buttons
- **Available variables** shown as clickable pills — clicking inserts `{{varName}}` at cursor
- **Preview panel** — live rendered HTML with sample data
- **Test button** — sends a test email to the logged-in admin's email
- **Enable/disable toggle**

### Notification Log View
- Recent sends table: timestamp, template, recipient, status
- Filter by template or status

---

## Trigger Points (where to add `sendNotification` calls)

### worker/src/routes/auth.ts
- After successful OAuth registration (new user created): `welcome_member` + `admin_new_member`

### worker/src/routes/submissions.ts
- After speaking submission status changes to `pending`: `speaking_submitted` + `admin_new_speaking`
- After sponsorship request: `sponsor_submitted` + `admin_new_sponsor`

### worker/src/routes/admin.ts
- After speaking review (approved): `speaking_approved`
- After speaking review (rejected): `speaking_rejected`

### worker/src/routes/kiosk.ts
- After check-in: `event_checkin`
- After walk-in registration: `event_walkin_welcome`

### worker/src/routes/invites.ts
- After invite accepted: `invite_accepted`

All sends should use `c.executionCtx.waitUntil()` so they don't block the response.

---

## Implementation Phases

### Phase 1 — Foundation
- [ ] Set up Amazon SES for `atlantaiam.com` (DNS verification on Cloudflare)
- [ ] Add AWS secrets to Cloudflare Worker environment
- [ ] Create `worker/src/lib/notifications.ts` — SES send function with AWS Sig V4 signing
- [ ] Create migration for `notification_templates` and `notification_log` tables
- [ ] Seed default templates for all scenarios

### Phase 2 — Admin UI
- [ ] Add "Notifications" tab to AdminView
- [ ] Build template list view
- [ ] Build template editor with variable insertion and live preview
- [ ] Build test send functionality
- [ ] Build notification log viewer

### Phase 3 — Admin API
- [ ] Create `worker/src/routes/notifications.ts` with template CRUD and preview endpoints
- [ ] Register route in `worker/src/index.ts`

### Phase 4 — Wire Up Triggers
- [ ] Add sends to auth routes (registration)
- [ ] Add sends to submission routes (speaking + sponsor)
- [ ] Add sends to admin routes (speaking review)
- [ ] Add sends to kiosk routes (check-in, walk-in)
- [ ] Add sends to invite routes (accepted)
- [ ] All sends via `waitUntil()` for non-blocking

### Phase 5 — Polish
- [ ] Default HTML email layout template (branded, responsive)
- [ ] Unsubscribe link / email preference support
- [ ] Retry logic for failed sends
- [ ] Rate limiting on test sends

---

## Default Email Template (HTML wrapper)

All notification emails share a common HTML wrapper:

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://atlantaiam.com/badge.png" width="40" height="40" alt="Atlanta IAM">
      <div style="font-size:16px;font-weight:700;color:#E8560A;margin-top:8px;">Atlanta IAM User Group</div>
    </div>
    <!-- Content (from template body_html) -->
    <div style="background:#fff;border-radius:8px;padding:24px;border:1px solid #e5e7eb;">
      {{content}}
    </div>
    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;font-size:11px;color:#9ca3af;">
      Atlanta IAM User Group · Atlanta, Georgia<br>
      <a href="{{siteUrl}}" style="color:#E8560A;">atlantaiam.com</a>
    </div>
  </div>
</body>
</html>
```

---

## AWS SES Signing (Cloudflare Workers)

Since we can't use the full AWS SDK easily in Workers, we sign requests manually:

```typescript
// Simplified — use aws4fetch library for Sig V4 signing in Workers
import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({
  accessKeyId: env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY,
  region: env.AWS_SES_REGION,
});

const response = await aws.fetch(
  `https://email.${env.AWS_SES_REGION}.amazonaws.com/v2/email/outbound-emails`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      FromEmailAddress: 'noreply@atlantaiam.com',
      Destination: { ToAddresses: [recipientEmail] },
      Content: {
        Simple: {
          Subject: { Data: renderedSubject },
          Body: { Html: { Data: renderedHtml } },
        },
      },
    }),
  }
);
```

The `aws4fetch` package is lightweight and designed for Cloudflare Workers.

---

## Key Decisions

- **Amazon SES** — cost-effective, domain already on Cloudflare for DNS
- **aws4fetch** — lightweight AWS request signing for Workers (no full SDK)
- **Admin-managed templates** — editable subject + HTML body with variable pills
- **Non-blocking sends** — all via `waitUntil()` so API responses aren't delayed
- **Notification log** — track all sends for debugging and audit
- **Per-template enable/disable** — admin can turn off individual notifications
