-- Migration 013: Populate historical events from Meetup.com (atlanta-iam group)
-- Group founded: March 11, 2014 — 24 past events through Q3 2025
-- Source: https://www.meetup.com/atlanta-iam/events/?type=past

-- Remove placeholder seed events
DELETE FROM sessions WHERE event_id IN ('e1', 'e2');
DELETE FROM event_sponsors WHERE event_id IN ('e1', 'e2');
DELETE FROM attendees WHERE event_id IN ('e1', 'e2');
DELETE FROM events WHERE id IN ('e1', 'e2');

-- ── 2014 — Founding year ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2014q4', 'Atlanta IAM User Group Meeting', 'October 21, 2014', 'Atlanta, GA', 'quarterly_meetup', 13, 0, 0, 0);

-- ── 2015 ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2015q1', 'Atlanta IAM User Group Meeting — Q1 2015', 'February 12, 2015', 'Atlanta, GA', 'quarterly_meetup', 19, 0, 0, 0),
  ('ev-2015q3', 'Atlanta IAM User Group — Q3 2015', 'September 17, 2015', 'Atlanta, GA', 'quarterly_meetup', 25, 0, 0, 0);

-- ── 2016 ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2016q2', 'Atlanta IAM User Group — Q2 2016', 'May 5, 2016', 'Atlanta, GA', 'quarterly_meetup', 23, 0, 0, 0),
  ('ev-2016q4', 'Atlanta IAM User Group — Q4 2016', 'November 17, 2016', 'Maggiano''s, Perimeter Mall, Dunwoody', 'quarterly_meetup', 22, 0, 0, 0);

-- ── 2017 ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2017q1', 'Atlanta IAM User Group — Q1 2017', 'March 23, 2017', 'Maggiano''s, Perimeter Mall, Dunwoody', 'quarterly_meetup', 23, 0, 0, 0);

-- ── 2018 ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2018q2', 'Atlanta IAM User Group — Q2 2018', 'April 26, 2018', 'Maggiano''s, Perimeter Mall, Dunwoody', 'quarterly_meetup', 40, 0, 0, 0),
  ('ev-2018q4', 'Atlanta IAM User Group — Q4 2018', 'October 4, 2018', 'Maggiano''s, Perimeter Mall, Dunwoody', 'quarterly_meetup', 24, 0, 0, 0);

-- ── 2019 ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2019q2', 'Atlanta IAM User Group — Q2 2019', 'April 4, 2019', 'Maggiano''s, Perimeter Mall, Dunwoody', 'quarterly_meetup', 21, 0, 0, 0),
  ('ev-2019q4', 'Atlanta IAM User Group — Q4 2019', 'October 2, 2019', 'Maggiano''s, Perimeter Mall, Dunwoody', 'quarterly_meetup', 35, 0, 0, 0);

-- ── 2020 — COVID pivot to virtual ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2020q1', 'Atlanta IAM User Group — Q1 2020', 'February 12, 2020', 'Maggiano''s, Perimeter Mall, Dunwoody', 'quarterly_meetup', 38, 0, 0, 0),
  ('ev-2020q2', 'Atlanta IAM User Group — Q2 2020 (Virtual)', 'June 25, 2020', 'Online / Virtual', 'webinar', 24, 0, 0, 0),
  ('ev-2020q3', 'Atlanta IAM User Group — Q3 2020 (Virtual)', 'August 20, 2020', 'Online / Virtual', 'webinar', 20, 0, 0, 0),
  ('ev-2020q4', 'Atlanta IAM User Group — Q4 2020 (Virtual)', 'December 9, 2020', 'Online / Virtual', 'webinar', 21, 0, 0, 0);

-- ── 2021 — Virtual ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2021q1', 'Atlanta IAM User Group — Q1 2021 (Virtual)', 'March 11, 2021', 'Online / Virtual', 'webinar', 21, 0, 0, 0),
  ('ev-2021q2', 'Atlanta IAM User Group — Q2 2021 (Virtual)', 'June 2, 2021', 'Online / Virtual', 'webinar', 23, 0, 0, 0);

-- ── 2023 — Group relaunched as quarterly in-person meetups ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2023q1', 'Atlanta IAM User Group — Q1 2023', 'February 23, 2023', 'Maggiano''s, Perimeter Mall, Dunwoody', 'quarterly_meetup', 70, 0, 0, 0),
  ('ev-2023q2', 'Atlanta IAM User Group — Q2 2023', 'May 4, 2023', 'Mutation Brewing Company, Sandy Springs', 'quarterly_meetup', 85, 0, 0, 0),
  ('ev-2023q3', 'Atlanta IAM User Group — Q3 2023', 'September 20, 2023', 'Porter Brew & Que Brewery, Dunwoody', 'quarterly_meetup', 88, 0, 0, 0),
  ('ev-2023q4', 'Atlanta IAM User Group — Q4 2023', 'December 13, 2023', 'Porter Brew & Que Brewery, Dunwoody', 'quarterly_meetup', 56, 0, 0, 0);

-- ── 2024 ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2024q2', 'Atlanta IAM User Group — Q2 2024', 'May 16, 2024', 'Iron Hill Brewery & Restaurant, Dunwoody', 'quarterly_meetup', 85, 0, 0, 0),
  ('ev-2024q3', 'Atlanta IAM User Group — Q3 2024', 'August 22, 2024', 'Iron Hill Brewery & Restaurant, Dunwoody', 'quarterly_meetup', 89, 0, 0, 0);

-- ── 2025 ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2025q1', 'Atlanta IAM User Group — Q1 2025', 'February 12, 2025', 'Iron Hill Brewery & Restaurant, Dunwoody', 'quarterly_meetup', 60, 0, 0, 0),
  ('ev-2025q3', 'Atlanta IAM User Group — Q3 2025', 'August 28, 2025', 'Iron Hill Brewery & Restaurant, Dunwoody', 'quarterly_meetup', 116, 0, 0, 0);

-- ── 2026 — Upcoming ──
INSERT OR IGNORE INTO events (id, name, date, venue, event_type, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('ev-2026q1', 'Atlanta IAM User Group — Q1 2026', 'March 31, 2026', 'Iron Hill Brewery & Restaurant, Dunwoody', 'quarterly_meetup', 42, 0, 0, 0);
