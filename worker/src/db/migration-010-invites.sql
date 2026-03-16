-- Migration 010: Invites table for community referrals
CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  inviter_id TEXT NOT NULL REFERENCES users(id),
  invitee_email TEXT NOT NULL,
  invitee_name TEXT DEFAULT '',
  message TEXT DEFAULT '',
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  accepted_by TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  accepted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_inviter ON invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(invitee_email);
