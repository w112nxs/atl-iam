-- Migration 005: Track when profile was last updated/confirmed
ALTER TABLE users ADD COLUMN profile_updated_at TEXT DEFAULT '';
