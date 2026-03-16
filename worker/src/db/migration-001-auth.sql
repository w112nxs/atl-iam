-- Migration 001: OAuth & Passkey tables

-- Stores OAuth provider links (one user can have multiple providers)
CREATE TABLE IF NOT EXISTS user_oauth (
  provider TEXT NOT NULL CHECK (provider IN ('google', 'linkedin', 'github')),
  provider_user_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  access_token TEXT,
  refresh_token TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_oauth_user ON user_oauth(user_id);

-- Stores registered passkey credentials
CREATE TABLE IF NOT EXISTS user_passkeys (
  credential_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  transports TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_passkeys_user ON user_passkeys(user_id);

-- Temporary WebAuthn challenge storage
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  id TEXT PRIMARY KEY,
  challenge TEXT NOT NULL,
  user_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Add avatar_url to users table
ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT '';
