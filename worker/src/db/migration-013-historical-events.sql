-- Migration 013: Populate historical events from Meetup.com (atlanta-iam group)
-- Group founded: March 11, 2014 — 24 past events through Q3 2025

-- Remove placeholder seed events
DELETE FROM sessions WHERE event_id IN ('e1', 'e2');
DELETE FROM event_sponsors WHERE event_id IN ('e1', 'e2');
DELETE FROM attendees WHERE event_id IN ('e1', 'e2');
DELETE FROM events WHERE id IN ('e1', 'e2');

-- ── Historical Events (from Meetup.com) ──

-- 2023 — Group relaunched as quarterly in-person meetups
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2023q1', 'Atlanta IAM User Group — Q1 2023', 'February 23, 2023', 'Maggiano''s, Perimeter Mall, Dunwoody', 'quarterly_meetup', 70, 0, 0, 0),
  ('ev-2023q2', 'Atlanta IAM User Group — Q2 2023', 'May 4, 2023', 'Mutation Brewing Company, Sandy Springs', 'quarterly_meetup', 85, 0, 0, 0),
  ('ev-2023q3', 'Atlanta IAM User Group — Q3 2023', 'September 20, 2023', 'Porter Brew & Que Brewery, Dunwoody', 'quarterly_meetup', 88, 0, 0, 0),
  ('ev-2023q4', 'Atlanta IAM User Group — Q4 2023', 'December 13, 2023', 'Porter Brew & Que Brewery, Dunwoody', 'quarterly_meetup', 56, 0, 0, 0);

-- 2024
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2024q2', 'Atlanta IAM User Group — Q2 2024', 'May 16, 2024', 'Dunwoody, GA', 'quarterly_meetup', 85, 0, 0, 0),
  ('ev-2024q3', 'Atlanta IAM User Group — Q3 2024', 'August 22, 2024', 'Iron Hill Brewery, Dunwoody', 'quarterly_meetup', 89, 0, 0, 0);

-- 2025
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2025q1', 'Atlanta IAM User Group — Q1 2025', 'February 12, 2025', 'Iron Hill Brewery, Dunwoody', 'quarterly_meetup', 60, 0, 0, 0),
  ('ev-2025q3', 'Atlanta IAM User Group — Q3 2025', 'August 28, 2025', 'Iron Hill Brewery, Dunwoody', 'quarterly_meetup', 116, 0, 0, 0);

-- 2021 — Virtual events during COVID
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2021q1', 'Atlanta IAM User Group — Q1 2021 (Virtual)', 'March 11, 2021', 'Online / Virtual', 'webinar', 21, 0, 0, 0),
  ('ev-2021q2', 'Atlanta IAM User Group — Q2 2021 (Virtual)', 'June 2, 2021', 'Online / Virtual', 'webinar', 23, 0, 0, 0);

-- 2026 — Upcoming
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2026q1', 'Atlanta IAM User Group — Q1 2026', 'March 31, 2026', 'Iron Hill Brewery, Dunwoody', 'quarterly_meetup', 42, 0, 0, 0);
