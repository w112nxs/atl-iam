# Admin Portal Enhancement Plan

Expand the existing `/admin` page into a comprehensive admin portal for superadmins, with reusable event templates, notification template management, and future feature admin surfaces.

---

## Current State

The admin portal at `/admin` currently has 4 tabs:
- **Members** — search, edit, delete members
- **Sponsors** — manage event-sponsor assignments
- **Events** — CRUD events, sessions, view stats
- **Speaking** — review speaking submissions

## Planned Tabs (in order)

| Tab | Status | Description |
|-----|--------|-------------|
| Members | Exists | Member management |
| Events | Exists (enhance) | Event CRUD + new template system |
| Speaking | Exists | Submission review |
| Sponsors | Exists | Event-sponsor management |
| Notifications | New | Email template management + send log |
| Resources | New | Curated resource library management (see resources-feature.md) |
| Settings | New | Site settings, admin preferences |

---

## Event Templates System

### Concept
Reusable templates for common event types so admins can spin up new events quickly without re-entering the same structure every time.

### Template Data Model

**`event_templates` table:**

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| name | TEXT | e.g., "Quarterly Meetup", "Virtual Webinar" |
| description | TEXT | What this template is for |
| event_type | TEXT | Default event type |
| default_venue | TEXT | Pre-filled venue |
| default_max_capacity | INTEGER | Pre-filled capacity |
| default_description | TEXT | Pre-filled event description |
| session_templates | TEXT | JSON array of default sessions (title patterns, time slots, CPE values) |
| created_at | TEXT | Timestamp |
| updated_at | TEXT | Timestamp |

### Example Template: "Quarterly Meetup"
```json
{
  "name": "Quarterly Meetup",
  "event_type": "quarterly_meetup",
  "default_venue": "Atlanta Tech Village",
  "default_max_capacity": 100,
  "default_description": "Join us for our quarterly in-person meetup featuring practitioner-led sessions on the latest IAM topics.",
  "session_templates": [
    { "title": "", "time": "9:00 AM", "cpe": 1 },
    { "title": "", "time": "10:00 AM", "cpe": 1 },
    { "title": "", "time": "11:00 AM", "cpe": 1 },
    { "title": "Networking Lunch", "time": "12:00 PM", "cpe": 0 },
    { "title": "", "time": "1:00 PM", "cpe": 1 }
  ]
}
```

### Admin UI — Event Templates

#### Template List
- Card grid of saved templates
- Each card shows: name, event type, session count, last used
- "Create Template" button
- "Create Event from Template" button on each card

#### Template Editor
- Form: name, description, event type, default venue, capacity, description
- Session template builder:
  - Drag-to-reorder session slots
  - Each slot: title (optional — blank = fill in later), time, CPE
  - Add/remove slots
- **Preview panel** — shows how the event would look when created
- Save / Update / Delete

#### "Create Event from Template" Flow
1. Select template → pre-fills the event creation form
2. Admin fills in: event name, date, specific session titles/speakers
3. Optionally assign sponsors
4. Create event — all sessions auto-created

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/event-templates` | List all templates |
| GET | `/api/admin/event-templates/:id` | Get single template |
| POST | `/api/admin/event-templates` | Create template |
| PUT | `/api/admin/event-templates/:id` | Update template |
| DELETE | `/api/admin/event-templates/:id` | Delete template |
| POST | `/api/admin/event-templates/:id/create-event` | Create event from template (accepts date, name overrides) |

---

## Notifications Tab (from notifications-system.md)

### Summary
- Template list with enable/disable toggles
- Template editor with `{{variable}}` insertion pills
- Live HTML preview with sample data
- Test send button (sends to admin's email)
- Notification log viewer (recent sends, status, errors)

Full details in `future_plans/notifications-system.md`.

---

## Resources Tab (from resources-feature.md)

### Summary
- CRUD for curated IAM resources (external links)
- Tag management (create, edit, delete tags by category)
- Resource status management (draft/published/archived)
- Featured toggle

Full details in `future_plans/resources-feature.md`.

---

## Settings Tab

### Site Settings
- **Site name** — "Atlanta IAM User Group"
- **Contact email** — "hello@atlantaiam.com"
- **Default FROM email** — for notifications
- **Social links** — LinkedIn URL

### Admin Preferences
- **Default event template** — which template to pre-select
- **Notification defaults** — which notifications are on by default for new templates

---

## Implementation Phases

### Phase 1 — Event Templates
- [ ] Create `event_templates` migration
- [ ] Create admin API endpoints for template CRUD
- [ ] Build template list UI in Events tab
- [ ] Build template editor with session slot builder
- [ ] Build "Create Event from Template" flow
- [ ] Preview panel

### Phase 2 — Notifications Tab
- [ ] Build notifications tab UI (depends on notifications-system.md Phase 2-3)
- [ ] Template editor with variable pills
- [ ] Live preview
- [ ] Test send
- [ ] Log viewer

### Phase 3 — Resources Tab
- [ ] Build resources admin tab (depends on resources-feature.md Phase 4)
- [ ] Resource CRUD
- [ ] Tag management

### Phase 4 — Settings Tab
- [ ] Build settings tab
- [ ] Site settings form
- [ ] Admin preferences

---

## Navigation / Access

- Admin Portal accessible via:
  - Nav bar "Admin" tab (existing)
  - User dropdown "Admin Portal" link (added)
- Role-gated: `admin` role only
- All admin API endpoints use `requireRole('admin')` middleware
