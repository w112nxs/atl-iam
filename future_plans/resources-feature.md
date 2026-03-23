# Resources Feature Plan

A curated library of publicly available IAM templates, frameworks, and tools — external links that authenticated members can use in their day-to-day work.

**Access:** Authenticated users only (member, sponsor, admin)

---

## Resource Types

| Type | Icon | Example |
|------|------|---------|
| Policy Template | `description` | Access Control Policy Template |
| Compliance Framework | `verified_user` | NIST SP 800-63, SOX Checklist |
| Architecture Diagram | `account_tree` | Zero Trust Reference Architecture |
| Tool Comparison | `compare_arrows` | PAM Vendor Comparison Matrix |
| Career Resource | `school` | CISSP Study Guide, Interview Prep |
| Best Practice | `auto_awesome` | IAM Program Maturity Model |
| Presentation | `slideshow` | Conference slide decks |
| Video | `play_circle` | Talk recordings, tutorials |
| Whitepaper | `article` | Industry research papers |
| Checklist | `checklist` | Onboarding/offboarding checklists |

## Tagging System

Tags are admin-managed (members cannot create tags — keeps taxonomy clean).

### Tag Categories

- **Domain** — zero-trust, access-management, identity-governance, privileged-access, mfa, sso, federation, api-security, directory-services, identity-lifecycle
- **Compliance** — nist-800-63, nist-csf, sox, hipaa, gdpr, pci-dss, fedramp, iso-27001
- **Certification** — cissp, cism, cisa, security+, sc-300, okta-certified
- **Technology** — entra-id, okta, sailpoint, cyberark, ping-identity, aws-iam, gcp-iam

## Database Schema

Three new tables:

### `resources`

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | Pattern: `'r' + Date.now().toString(36)` |
| title | TEXT NOT NULL | |
| description | TEXT | |
| url | TEXT NOT NULL | External link to the resource |
| resource_type | TEXT NOT NULL | One of the types above |
| source | TEXT | e.g., "NIST", "ISACA", "AWS", "Microsoft" |
| thumbnail_url | TEXT | Optional preview image |
| added_by | TEXT FK | References users(id) |
| status | TEXT | draft / published / archived |
| featured | INTEGER | 0 or 1, admin toggle |
| view_count | INTEGER | Simple popularity metric |
| created_at | TEXT | datetime('now') |
| updated_at | TEXT | datetime('now') |

### `resource_tags`

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| name | TEXT UNIQUE | Lowercase slug (e.g., "nist-800-63") |
| display_name | TEXT | Human-readable (e.g., "NIST 800-63") |
| category | TEXT | domain / compliance / certification / vendor / technology / general |
| color | TEXT | Optional color override for Pill component |
| created_at | TEXT | datetime('now') |

### `resource_tag_map` (junction)

| Column | Type | Notes |
|--------|------|-------|
| resource_id | TEXT FK | ON DELETE CASCADE |
| tag_id | TEXT FK | ON DELETE CASCADE |
| PRIMARY KEY | (resource_id, tag_id) | |

## API Endpoints

### Member Endpoints (requireAuth + requireRole member/sponsor/admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/resources` | List with search, type, tag, sort, pagination |
| GET | `/api/resources/:id` | Single resource with tags |
| GET | `/api/resources/tags` | All tags for filter UI (optional `?category=`) |
| POST | `/api/resources/:id/view` | Increment view count (fire-and-forget via waitUntil) |

### Admin Endpoints (requireRole admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/resources` | All resources including draft/archived |
| POST | `/api/admin/resources` | Create resource |
| PUT | `/api/admin/resources/:id` | Update resource |
| DELETE | `/api/admin/resources/:id` | Delete resource (cascades tags) |
| POST | `/api/admin/resources/tags` | Create tag |
| PUT | `/api/admin/resources/tags/:id` | Update tag |
| DELETE | `/api/admin/resources/tags/:id` | Delete tag (cascades mappings) |

## UI — Resources Page (`/resources`)

### Layout

1. **Header** — Title "Resources" with subtitle "Curated templates, frameworks, and tools for IAM professionals."

2. **Search & Filter Bar**
   - Search input (debounced)
   - Resource type dropdown
   - Scrollable tag pills (toggle on/off to filter, grouped by category)
   - Sort dropdown: Newest, Most Viewed, Featured First

3. **Featured Row** — Highlighted cards for admin-featured resources (accent border)

4. **Card Grid** — Responsive (`repeat(auto-fill, minmax(320px, 1fr))`)
   - Type icon + pill (top-left)
   - Title (Rajdhani bold 16px)
   - Description (truncated 2-3 lines, Inter 13px)
   - Source line (subtle)
   - Tag pills (up to 4, "+N more" overflow)
   - Footer: view count + "Open Resource" button (new tab, external link icon)

5. **Load More** — Pagination button at bottom

6. **Empty State** — Centered message when no results match filters

### Navigation

New "Resources" tab in Navbar, positioned after "Members", visible to member/sponsor/admin roles.

## Admin Panel — New "Resources" Tab

### Resources Management
- Table of all resources with status badges (draft/published/archived)
- "Add Resource" form at top
- Edit modal for each resource
- Tag assignment via multi-select checkboxes
- Featured toggle
- Delete with confirmation

### Tag Management
- List of all tags grouped by category
- Add/edit/delete tags
- Show resource count per tag

## Implementation Phases

### Phase 1 — Backend Foundation
- [ ] Create `migration-014-resources.sql` with tables and seed tags
- [ ] Run migration against D1
- [ ] Create `worker/src/routes/resources.ts` with all endpoints
- [ ] Register route in `worker/src/index.ts`

### Phase 2 — Frontend Types & API
- [ ] Add Resource/ResourceTag types to `frontend/src/types/index.ts`
- [ ] Add API methods to `frontend/src/api/client.ts`

### Phase 3 — Resources Page
- [ ] Create `frontend/src/pages/ResourcesPage.tsx`
- [ ] Add route in `App.tsx` (isMember guard)
- [ ] Add nav tab in `Navbar.tsx`

### Phase 4 — Admin Integration
- [ ] Add Resources tab to `AdminView.tsx` with CRUD for resources and tags

### Phase 5 — Seed Data
- [ ] Curate initial real IAM resources (NIST SP 800-63, CIS Controls, OWASP ASVS, etc.)

## Key Decisions

- **External links only** — no file uploads, no R2/S3 needed
- **Tags are admin-managed** — keeps taxonomy clean and consistent
- **View tracking** — lightweight, fire-and-forget via `waitUntil`
- **No file storage** — resources are curated URLs to public content
