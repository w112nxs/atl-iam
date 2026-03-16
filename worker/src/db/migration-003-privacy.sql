-- Migration 003: Privacy settings for member directory

ALTER TABLE users ADD COLUMN privacy_show_email INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN privacy_show_phone INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN privacy_show_company INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN privacy_show_title INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN privacy_show_linkedin INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN privacy_show_type INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN privacy_listed INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN title TEXT DEFAULT '';

-- Set existing demo users as listed
UPDATE users SET privacy_listed = 1 WHERE id IN ('u1', 'u2', 'u3', 'u4');
