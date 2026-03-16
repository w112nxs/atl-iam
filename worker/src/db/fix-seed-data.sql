-- Fix seed data: add vendor attendees, more check-ins, and sync stats

-- Add vendor attendees to e1 (Spring 2026)
INSERT OR IGNORE INTO attendees (id, event_id, name, email, company, title, type, checked_in, checked_in_at, checked_in_by, sponsor_consent) VALUES
  ('v1', 'e1', 'Rachel Torres', 'rachel@saviynt.com', 'Saviynt', 'Solutions Engineer', 'vendor', 1, '2026-04-15T09:15:00Z', 'kiosk-1', 1),
  ('v2', 'e1', 'Brian Cole', 'brian@sailpoint.com', 'SailPoint', 'Regional Director', 'vendor', 1, '2026-04-15T09:22:00Z', 'kiosk-1', 1),
  ('v3', 'e1', 'Amy Liu', 'amy@cyberark.com', 'CyberArk', 'Sr. Sales Engineer', 'vendor', 1, '2026-04-15T09:30:00Z', 'kiosk-2', 1),
  ('v4', 'e1', 'Carlos Ruiz', 'carlos@okta.com', 'Okta', 'Account Executive', 'vendor', 0, '', '', 1),
  ('v5', 'e1', 'Lisa Park', 'lisa@delinea.com', 'Delinea', 'Technical Consultant', 'vendor', 1, '2026-04-15T09:45:00Z', 'kiosk-1', 1);

-- Add more enterprise attendees to e1
INSERT OR IGNORE INTO attendees (id, event_id, name, email, company, title, type, checked_in, checked_in_at, checked_in_by, sponsor_consent) VALUES
  ('a10', 'e1', 'James Mitchell', 'james@coca-cola.com', 'The Coca-Cola Company', 'VP Identity & Access', 'enterprise', 1, '2026-04-15T09:05:00Z', 'kiosk-1', 1),
  ('a11', 'e1', 'Tanya Brooks', 'tanya@southerncompany.com', 'Southern Company', 'IAM Manager', 'enterprise', 1, '2026-04-15T09:10:00Z', 'kiosk-2', 1),
  ('a12', 'e1', 'Robert Chang', 'robert@aflac.com', 'Aflac', 'Identity Security Lead', 'enterprise', 1, '2026-04-15T09:18:00Z', 'kiosk-1', 1),
  ('a13', 'e1', 'Maya Patel', 'maya@intercontinental.com', 'InterContinental Hotels Group', 'Dir. Cybersecurity', 'enterprise', 1, '2026-04-15T09:25:00Z', 'kiosk-2', 1),
  ('a14', 'e1', 'Derek Johnson', 'derek@suntrust.com', 'Truist Financial', 'Sr. IAM Engineer', 'enterprise', 1, '2026-04-15T09:35:00Z', 'kiosk-1', 0),
  ('a15', 'e1', 'Sarah Kim', 'sarah@ncr.com', 'NCR Voyix', 'PAM Administrator', 'enterprise', 0, '', '', 1),
  ('a16', 'e1', 'William Foster', 'william@ge.com', 'GE Aerospace', 'Zero Trust Architect', 'enterprise', 1, '2026-04-15T09:40:00Z', 'kiosk-2', 1),
  ('a17', 'e1', 'Anita Sharma', 'anita@fiserv.com', 'Fiserv', 'IAM Analyst', 'enterprise', 0, '', '', 1);

-- Check in some existing e1 attendees
UPDATE attendees SET checked_in = 1, checked_in_at = '2026-04-15T09:00:00Z', checked_in_by = 'kiosk-1' WHERE id = 'a1' AND event_id = 'e1';
UPDATE attendees SET checked_in = 1, checked_in_at = '2026-04-15T09:08:00Z', checked_in_by = 'kiosk-2' WHERE id = 'a3' AND event_id = 'e1';
UPDATE attendees SET checked_in = 1, checked_in_at = '2026-04-15T09:28:00Z', checked_in_by = 'kiosk-1' WHERE id = 'a5' AND event_id = 'e1';
UPDATE attendees SET checked_in = 1, checked_in_at = '2026-04-15T09:38:00Z', checked_in_by = 'kiosk-2' WHERE id = 'a6' AND event_id = 'e1';
UPDATE attendees SET checked_in = 1, checked_in_at = '2026-04-15T09:42:00Z', checked_in_by = 'kiosk-1' WHERE id = 'a8' AND event_id = 'e1';

-- Add vendor attendees to e2 (Fall 2025)
INSERT OR IGNORE INTO attendees (id, event_id, name, email, company, title, type, checked_in, checked_in_at, checked_in_by, sponsor_consent) VALUES
  ('v6', 'e2', 'Kevin White', 'kevin@saviynt.com', 'Saviynt', 'Solutions Architect', 'vendor', 1, '2025-11-12T09:20:00Z', 'kiosk-1', 1),
  ('v7', 'e2', 'Diana Ross', 'diana@sailpoint.com', 'SailPoint', 'Sales Engineer', 'vendor', 1, '2025-11-12T09:25:00Z', 'kiosk-1', 1),
  ('v8', 'e2', 'Raj Kapoor', 'raj@cyberark.com', 'CyberArk', 'Technical Lead', 'vendor', 0, '', '', 1);

-- Add more enterprise attendees to e2
INSERT OR IGNORE INTO attendees (id, event_id, name, email, company, title, type, checked_in, checked_in_at, checked_in_by, sponsor_consent) VALUES
  ('b4', 'e2', 'Chris Evans', 'chris@delta.com', 'Delta Air Lines', 'IAM Program Manager', 'enterprise', 1, '2025-11-12T09:10:00Z', 'kiosk-1', 1),
  ('b5', 'e2', 'Laura Nguyen', 'laura@gpc.com', 'Genuine Parts Company', 'Security Engineer', 'enterprise', 1, '2025-11-12T09:15:00Z', 'kiosk-2', 1),
  ('b6', 'e2', 'Tom Harris', 'tom@coca-cola.com', 'The Coca-Cola Company', 'IAM Lead', 'enterprise', 1, '2025-11-12T09:30:00Z', 'kiosk-1', 0),
  ('b7', 'e2', 'Nina Williams', 'nina@equifax.com', 'Equifax', 'Dir. Identity Services', 'enterprise', 0, '', '', 1),
  ('b8', 'e2', 'David Park', 'david@homedepot.com', 'The Home Depot', 'Sr. IAM Architect', 'enterprise', 1, '2025-11-12T09:35:00Z', 'kiosk-2', 1);

-- Check in some existing e2 attendees
UPDATE attendees SET checked_in = 1, checked_in_at = '2025-11-12T09:12:00Z', checked_in_by = 'kiosk-1' WHERE id = 'b2' AND event_id = 'e2';
UPDATE attendees SET checked_in = 1, checked_in_at = '2025-11-12T09:18:00Z', checked_in_by = 'kiosk-2' WHERE id = 'b3' AND event_id = 'e2';

-- Now sync stats from actual attendee data
UPDATE events SET
  stats_registered = (SELECT COUNT(*) FROM attendees WHERE event_id = 'e1'),
  stats_checked_in = (SELECT COUNT(*) FROM attendees WHERE event_id = 'e1' AND checked_in = 1),
  stats_enterprise = (SELECT COUNT(*) FROM attendees WHERE event_id = 'e1' AND type = 'enterprise'),
  stats_vendor = (SELECT COUNT(*) FROM attendees WHERE event_id = 'e1' AND type = 'vendor')
WHERE id = 'e1';

UPDATE events SET
  stats_registered = (SELECT COUNT(*) FROM attendees WHERE event_id = 'e2'),
  stats_checked_in = (SELECT COUNT(*) FROM attendees WHERE event_id = 'e2' AND checked_in = 1),
  stats_enterprise = (SELECT COUNT(*) FROM attendees WHERE event_id = 'e2' AND type = 'enterprise'),
  stats_vendor = (SELECT COUNT(*) FROM attendees WHERE event_id = 'e2' AND type = 'vendor')
WHERE id = 'e2';

-- Clean up the test "Tom Cruise" entry
DELETE FROM attendees WHERE id = 'ammss0ngazmgj';

-- Fix "Home Depot" → "The Home Depot" and "Delta" → "Delta Air Lines" for consistency
UPDATE attendees SET company = 'The Home Depot' WHERE company = 'Home Depot';
UPDATE attendees SET company = 'Delta Air Lines' WHERE company = 'Delta';
