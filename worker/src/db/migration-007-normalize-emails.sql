-- Migration 007: Normalize existing emails to lowercase
-- Note: duplicate accounts must be merged manually before running this
UPDATE users SET email = LOWER(email) WHERE email != LOWER(email);

-- Add case-insensitive unique index for email lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_nocase ON users(LOWER(email));
