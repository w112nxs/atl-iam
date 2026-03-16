-- Atlanta IAM — Seed Data

-- Demo users
INSERT OR IGNORE INTO users (id, name, email, role, company, sponsor_id, terms_accepted) VALUES
  ('u1', 'Nishad Sankaranarayanan', 'nishad@atlantaiam.com', 'admin', 'Atlanta IAM', NULL, 1),
  ('u2', 'Marcus Webb', 'marcus@delta.com', 'member', 'Delta Air Lines', NULL, 0),
  ('u3', 'Alex Morgan', 'alex@saviynt.com', 'sponsor', 'Saviynt', 'sp1', 1),
  ('u4', 'Taylor Brooks', 'taylor@cyberark.com', 'sponsor', 'CyberArk', 'sp3', 0);

-- Events
INSERT OR IGNORE INTO events (id, name, date, venue, stats_registered, stats_checked_in, stats_enterprise, stats_vendor) VALUES
  ('e1', 'Atlanta IAM Forum — Spring 2026', 'April 15, 2026', 'Atlanta Tech Village', 94, 81, 71, 10),
  ('e2', 'Atlanta IAM Forum — Fall 2025', 'Nov 12, 2025', 'Coda Building', 87, 80, 68, 12);

-- Sponsors
INSERT OR IGNORE INTO event_sponsors (event_id, sponsor_id, sponsor_name, tier) VALUES
  ('e1', 'sp1', 'Saviynt', 'Gold'),
  ('e1', 'sp2', 'Ping Identity', 'Silver'),
  ('e1', 'sp3', 'CyberArk', 'Gold'),
  ('e2', 'sp1', 'Saviynt', 'Gold'),
  ('e2', 'sp4', 'SailPoint', 'Silver');

-- Sessions
INSERT OR IGNORE INTO sessions (id, event_id, title, speaker, session_time, cpe) VALUES
  ('s1', 'e1', 'Zero Trust IAM at Scale', 'Marcus Webb', '9:00 AM', 1),
  ('s2', 'e1', 'CIAM Modernization', 'Samira Hassan', '10:00 AM', 1),
  ('s3', 'e1', 'PAM in the Cloud Era', 'Devon Price', '11:00 AM', 1),
  ('s4', 'e1', 'Passwordless Reality Check', 'Priya Nair', '1:00 PM', 1),
  ('s5', 'e2', 'Passwordless Myths vs Reality', 'Devon Price', '9:00 AM', 1),
  ('s6', 'e2', 'IGA in Financial Services', 'Quinn Adams', '10:30 AM', 1);

-- Attendees
INSERT OR IGNORE INTO attendees (id, event_id, name, company, title, certs, type, email, sessions, sponsor_consent) VALUES
  ('a1', 'e1', 'Nishad Sankaranarayanan', 'Genuine Parts Company', 'Global Dir. Cybersecurity', '["CISM","CISSP"]', 'enterprise', 'nishad@gpc.com', '["s1","s2","s3"]', 1),
  ('a2', 'e1', 'Marcus Webb', 'Delta Air Lines', 'Sr. IAM Architect', '["CISSP","CISA"]', 'enterprise', 'marcus@delta.com', '["s1","s4"]', 1),
  ('a3', 'e1', 'Priya Nair', 'UPS', 'Director of Identity Security', '["CISM"]', 'enterprise', 'priya@ups.com', '["s2","s3","s4"]', 0),
  ('a4', 'e1', 'Jordan Kim', 'Chick-fil-A', 'IAM Engineer III', '["Security+"]', 'enterprise', 'jordan@cfa.com', '["s1"]', 1),
  ('a5', 'e1', 'Samira Hassan', 'The Home Depot', 'CIAM Lead', '["CISM","CRISC"]', 'enterprise', 'samira@homedepot.com', '["s2"]', 1),
  ('a6', 'e1', 'Quinn Adams', 'Wells Fargo', 'Identity Governance Lead', '["CISA","CRISC"]', 'enterprise', 'quinn@wf.com', '["s1","s2","s3","s4"]', 0),
  ('a7', 'e1', 'Devon Price', 'NCR Voyix', 'Principal Architect', '["CISSP"]', 'enterprise', 'devon@ncr.com', '["s3"]', 1),
  ('a8', 'e1', 'Reese Patel', 'Equifax', 'IAM Program Manager', '["PMP","CISM"]', 'enterprise', 'reese@equifax.com', '["s1","s4"]', 1),
  ('b1', 'e2', 'Alex Chen', 'Home Depot', 'IAM Director', '["CISSP"]', 'enterprise', 'alex.c@homedepot.com', '["s5","s6"]', 1),
  ('b2', 'e2', 'Sam Rivera', 'Delta', 'Security Analyst', '["Security+"]', 'enterprise', 'sam@delta.com', '["s5"]', 1),
  ('b3', 'e2', 'Morgan Lee', 'UPS', 'IAM Architect', '["CISM"]', 'enterprise', 'morgan@ups.com', '["s6"]', 0);
