# Atlanta IAM User Group Platform

A full-stack web application for the Atlanta IAM User Group — a practitioner-first, vendor-neutral community for Identity & Access Management professionals.

## Tech Stack

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Auth**: Demo accounts with JWT (Clerk integration planned)

## Local Development Setup

### Prerequisites

- Node.js 18+
- Docker (optional, for PostgreSQL)

### 1. Clone and install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Start the database (optional)

```bash
# From project root
docker-compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Start development servers

```bash
# Terminal 1: Frontend (port 5173)
cd frontend
npm run dev

# Terminal 2: Backend (port 3001)
cd backend
npm run dev
```

### 5. Open the app

Navigate to `http://localhost:5173`

## Demo Accounts

| Account | Role | Details |
|---------|------|---------|
| Admin — Nishad | `admin` | Full access to all features |
| Saviynt Sponsor | `sponsor` | Gold tier, sees events e1 + e2 |
| CyberArk Sponsor | `sponsor` | Gold tier (terms pending), sees event e1 only |
| Member — Marcus | `member` | Terms pending, basic member access |

## Features

- **Theme System**: Dark/light mode with system preference detection, manual override, and smooth transitions
- **Event Management**: View events, sessions, and sponsor information
- **Sponsor Portal**: Tiered access to consented attendee data with export capabilities
- **Privacy Controls**: Consent-based data sharing, tier-based column masking, audit logging
- **Admin Dashboard**: Event statistics and sponsor management overview
- **Speaking Submissions**: Enterprise-led presentation proposals
- **Sponsorship Requests**: Tiered sponsorship applications

## Architecture Decisions

- **Consent filtering**: Attendees with `sponsorConsent: false` are never surfaced in any sponsor-facing view
- **Tier masking**: Data columns are conditionally excluded from the DOM (not just hidden) based on sponsor tier
- **CSV export**: Generated client-side via Blob + URL.createObjectURL; only audit log goes to the server
- **Sponsor scoping**: Enforced both in frontend (UX) and backend middleware (truth)
