# Atlanta IAM User Group Platform

A full-stack web application for the [Atlanta IAM User Group](https://atlantaiam.com) — a practitioner-first, vendor-neutral community for Identity & Access Management professionals, founded in 2014.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript (Vite) |
| **Edge API** | Cloudflare Workers + Hono |
| **Database** | Cloudflare D1 (SQLite at edge) |
| **Auth** | Passkeys (WebAuthn/FIDO2), OAuth 2.0 (Google, Facebook, LinkedIn), JWT sessions |
| **Hosting** | Cloudflare Pages + Workers |
| **Local Backend** | Node.js + Express + PostgreSQL (development) |

## Features

### Public
- **Home** — Hero landing with Atlanta skyline artwork, featured upcoming event, community stats
- **Events** — Upcoming (hero banner) and past event archive with tile grid, speaker-focused cards, detail modals, share buttons (copy link + email), calendar subscriptions (iCal, Google Calendar, webcal)
- **About** — Community mission, history, and event/member statistics
- **Sponsors** — Tiered sponsorship information (Gold / Silver / Community)

### Members
- **Member Directory** — Searchable with type filtering (enterprise / vendor)
- **Profile** — Avatar, company, title, certifications, contact info, privacy controls per field, onboarding workflow, staleness reminders
- **Speaking Submissions** — Presentation proposals with co-presenter support and consent controls
- **Sponsorship Requests** — Tiered sponsorship applications

### Sponsor Portal
- **Consent-filtered attendee access** — Only attendees who opted in are visible
- **Tier-based column masking** — Gold sees all fields; Silver limited; Community minimal (columns excluded from DOM, not just hidden)
- **CSV export** — Client-side generation with server-side audit logging

### Admin
- **Dashboard** — Member, sponsor, event, and speaking submission management across four tabs
- **Kiosk Mode** — Event check-in station with QR code generation and printer integration

### Platform
- **Dark/Light theme** — System preference detection with manual override and smooth transitions
- **Passkey authentication** — Passwordless login via WebAuthn/FIDO2
- **OAuth social login** — Google, Facebook, LinkedIn
- **Rate limiting** — Global (100 req/15min) and stricter auth endpoint limits (20 req/15min)
- **Role-based access** — Guest, Member, Sponsor, Admin with scoped navigation and middleware enforcement
- **Responsive design** — 3-column desktop grid, single-column mobile

## Project Structure

```
├── frontend/              React SPA (Vite)
│   └── src/
│       ├── pages/         15 page components
│       ├── components/    Layout, modals, UI primitives
│       ├── hooks/         useAuth, useEvents
│       ├── context/       ThemeContext
│       ├── api/           HTTP client
│       ├── types/         TypeScript interfaces
│       └── data/          Seed data
│
├── backend/               Express.js (local development)
│   └── src/
│       ├── routes/        auth, events, users, submissions, admin, audit
│       ├── middleware/    JWT auth, error handling
│       └── db/            schema.sql, seed.sql (10+ tables)
│
├── worker/                Cloudflare Workers API (Hono)
│   └── src/
│       ├── routes/        auth, events, users, submissions, admin, audit, kiosk, calendar, invites
│       ├── middleware/    Rate limiting, auth
│       └── lib/           JWT, OAuth, hashing
│
└── docker-compose.yml     Local PostgreSQL
```

## Database Tables

`users` · `user_oauth` · `user_passkeys` · `webauthn_challenges` · `events` · `event_sponsors` · `sessions` · `attendees` · `audit_log` · `submissions_speaking` · `submissions_sponsor`

## Design System

| Token | Value |
|-------|-------|
| **Accent** | `#E8560A` (burnt orange) |
| **Headings** | Rajdhani 700 |
| **Labels** | Space Mono |
| **Body** | Inter |
| **Dark BG** | `#080D18` (deep navy) |
| **Light BG** | `#F4F6FA` |

## Local Development

### Prerequisites
- Node.js 18+
- Docker (optional, for PostgreSQL)

### Setup

```bash
# Frontend
cd frontend && npm install

# Backend (local dev)
cd ../backend && npm install

# Worker (Cloudflare)
cd ../worker && npm install
```

### Run locally

```bash
# Terminal 1: Frontend (port 5173)
cd frontend && npm run dev

# Terminal 2: Backend (port 3001)
cd backend && npm run dev
```

### Environment

```bash
cp .env.example .env
# Edit .env with your values
```

## Deployment

Hosted on Cloudflare:
- **Frontend** → Cloudflare Pages
- **API** → Cloudflare Workers + D1

See [DEPLOY_CLOUDFLARE_PAGES.md](DEPLOY_CLOUDFLARE_PAGES.md) for deployment instructions.

## Architecture Decisions

- **Consent filtering** — Attendees with `sponsorConsent: false` are never surfaced in any sponsor-facing view
- **Tier masking** — Data columns conditionally excluded from the DOM (not just CSS-hidden) based on sponsor tier
- **CSV export** — Generated client-side via Blob + URL.createObjectURL; only the audit log hits the server
- **Sponsor scoping** — Enforced at both frontend (UX) and backend middleware (source of truth)
- **Edge-first architecture** — Cloudflare Workers + D1 for low-latency global access
- **Passwordless-first auth** — Passkeys as primary, OAuth as secondary, no password storage
