-- Migration 002: Onboarding profile fields

ALTER TABLE users ADD COLUMN first_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN last_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN phone TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN work_email TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN consent_email INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN consent_text INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN consent_data_sharing INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN linkedin_url TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN onboarding_complete INTEGER DEFAULT 0;

-- Mark existing demo/seed users as onboarded
UPDATE users SET onboarding_complete = 1, user_type = 'enterprise' WHERE id IN ('u1', 'u2');
UPDATE users SET onboarding_complete = 1, user_type = 'vendor' WHERE id IN ('u3', 'u4');
