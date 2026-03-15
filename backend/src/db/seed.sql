-- Seed data for Atlanta IAM User Group
-- Run after schema.sql

-- Users
INSERT INTO users (id, name, email, role, company, sponsor_id, terms_accepted) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Nishad Sankaranarayanan', 'nishad@atlantaiam.com', 'admin', 'Atlanta IAM', NULL, TRUE),
  ('00000000-0000-0000-0000-000000000002', 'Marcus Webb', 'marcus@delta.com', 'member', 'Delta Air Lines', NULL, FALSE),
  ('00000000-0000-0000-0000-000000000003', 'Alex Morgan', 'alex@saviynt.com', 'sponsor', 'Saviynt', 'sp1', TRUE),
  ('00000000-0000-0000-0000-000000000004', 'Taylor Brooks', 'taylor@cyberark.com', 'sponsor', 'CyberArk', 'sp3', FALSE);

-- Events
INSERT INTO events (id, name, date, venue, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('e1', 'Atlanta IAM Forum — Spring 2026', '2026-04-15', 'Atlanta Tech Village', 94, 81, 71, 10),
  ('e2', 'Atlanta IAM Forum — Fall 2025', '2025-11-12', 'Coda Building', 87, 80, 68, 12);

-- Event Sponsors
INSERT INTO event_sponsors (event_id, sponsor_id, sponsor_name, tier) VALUES
  ('e1', 'sp1', 'Saviynt', 'Gold'),
  ('e1', 'sp2', 'Ping Identity', 'Silver'),
  ('e1', 'sp3', 'CyberArk', 'Gold'),
  ('e2', 'sp1', 'Saviynt', 'Gold'),
  ('e2', 'sp4', 'SailPoint', 'Silver');

-- Sessions
INSERT INTO sessions (id, event_id, title, speaker, session_time, cpe) VALUES
  ('s1', 'e1', 'Zero Trust IAM at Scale', 'Marcus Webb', '9:00 AM', 1),
  ('s2', 'e1', 'CIAM Modernization', 'Samira Hassan', '10:00 AM', 1),
  ('s3', 'e1', 'PAM in the Cloud Era', 'Devon Price', '11:00 AM', 1),
  ('s4', 'e1', 'Passwordless Reality Check', 'Priya Nair', '1:00 PM', 1),
  ('s5', 'e2', 'Passwordless Myths vs Reality', 'Devon Price', '9:00 AM', 1),
  ('s6', 'e2', 'IGA in Financial Services', 'Quinn Adams', '10:30 AM', 1);

-- Attendees (Event 1)
INSERT INTO attendees (id, event_id, name, company, title, certs, type, email, sessions, sponsor_consent) VALUES
  ('a1', 'e1', 'Nishad Sankaranarayanan', 'Genuine Parts Company', 'Global Dir. Cybersecurity', ARRAY['CISM', 'CISSP'], 'enterprise', 'nishad@gpc.com', ARRAY['s1', 's2', 's3'], TRUE),
  ('a2', 'e1', 'Marcus Webb', 'Delta Air Lines', 'Sr. IAM Architect', ARRAY['CISSP', 'CISA'], 'enterprise', 'marcus@delta.com', ARRAY['s1', 's4'], TRUE),
  ('a3', 'e1', 'Priya Nair', 'UPS', 'Director of Identity Security', ARRAY['CISM'], 'enterprise', 'priya@ups.com', ARRAY['s2', 's3', 's4'], FALSE),
  ('a4', 'e1', 'Jordan Kim', 'Chick-fil-A', 'IAM Engineer III', ARRAY['Security+'], 'enterprise', 'jordan@cfa.com', ARRAY['s1'], TRUE),
  ('a5', 'e1', 'Samira Hassan', 'The Home Depot', 'CIAM Lead', ARRAY['CISM', 'CRISC'], 'enterprise', 'samira@homedepot.com', ARRAY['s2'], TRUE),
  ('a6', 'e1', 'Quinn Adams', 'Wells Fargo', 'Identity Governance Lead', ARRAY['CISA', 'CRISC'], 'enterprise', 'quinn@wf.com', ARRAY['s1', 's2', 's3', 's4'], FALSE),
  ('a7', 'e1', 'Devon Price', 'NCR Voyix', 'Principal Architect', ARRAY['CISSP'], 'enterprise', 'devon@ncr.com', ARRAY['s3'], TRUE),
  ('a8', 'e1', 'Reese Patel', 'Equifax', 'IAM Program Manager', ARRAY['PMP', 'CISM'], 'enterprise', 'reese@equifax.com', ARRAY['s1', 's4'], TRUE);

-- Attendees (Event 2)
INSERT INTO attendees (id, event_id, name, company, title, certs, type, email, sessions, sponsor_consent) VALUES
  ('b1', 'e2', 'Alex Chen', 'Home Depot', 'IAM Director', ARRAY['CISSP'], 'enterprise', 'alex.c@homedepot.com', ARRAY['s5', 's6'], TRUE),
  ('b2', 'e2', 'Sam Rivera', 'Delta', 'Security Analyst', ARRAY['Security+'], 'enterprise', 'sam@delta.com', ARRAY['s5'], TRUE),
  ('b3', 'e2', 'Morgan Lee', 'UPS', 'IAM Architect', ARRAY['CISM'], 'enterprise', 'morgan@ups.com', ARRAY['s6'], FALSE);
