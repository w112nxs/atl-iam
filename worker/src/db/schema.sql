-- Atlanta IAM — D1 Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('guest', 'member', 'sponsor', 'admin')),
  company TEXT DEFAULT '',
  sponsor_id TEXT,
  terms_accepted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  venue TEXT DEFAULT '',
  stats_registered INTEGER DEFAULT 0,
  stats_checked_in INTEGER DEFAULT 0,
  stats_enterprise INTEGER DEFAULT 0,
  stats_vendor INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_sponsors (
  event_id TEXT NOT NULL REFERENCES events(id),
  sponsor_id TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Gold', 'Silver', 'Community')),
  PRIMARY KEY (event_id, sponsor_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id),
  title TEXT NOT NULL,
  speaker TEXT DEFAULT '',
  session_time TEXT DEFAULT '',
  cpe INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS attendees (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id),
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  title TEXT DEFAULT '',
  certs TEXT DEFAULT '[]',
  type TEXT CHECK (type IN ('enterprise', 'vendor')),
  email TEXT DEFAULT '',
  sessions TEXT DEFAULT '[]',
  sponsor_consent INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS submissions_speaking (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  presenter_type TEXT,
  company TEXT,
  title TEXT NOT NULL,
  abstract TEXT,
  co_presenter TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions_sponsor (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  tier TEXT,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  event_id TEXT,
  attendee_count INTEGER,
  tier TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
