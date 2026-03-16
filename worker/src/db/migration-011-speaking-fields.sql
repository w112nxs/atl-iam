-- Migration 011: Add contact info and consent fields to speaking submissions
ALTER TABLE submissions_speaking ADD COLUMN email TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN phone TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN linkedin_url TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN consent_name_listed INTEGER DEFAULT 0;
ALTER TABLE submissions_speaking ADD COLUMN consent_linkedin_linked INTEGER DEFAULT 0;
ALTER TABLE submissions_speaking ADD COLUMN consent_website_listed INTEGER DEFAULT 0;
