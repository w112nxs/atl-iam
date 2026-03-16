-- Migration 012: Speaking submission wizard with draft saving and admin review
ALTER TABLE submissions_speaking ADD COLUMN status TEXT DEFAULT 'draft';
ALTER TABLE submissions_speaking ADD COLUMN current_step INTEGER DEFAULT 1;
ALTER TABLE submissions_speaking ADD COLUMN updated_at TEXT DEFAULT (datetime('now'));
ALTER TABLE submissions_speaking ADD COLUMN submitter_name TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN submitter_email TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN submitter_phone TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN submitter_company TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN speaker_name TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN speaker_email TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN speaker_phone TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN speaker_company TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN speaker_linkedin_url TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN admin_comment TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN reviewed_by TEXT DEFAULT '';
ALTER TABLE submissions_speaking ADD COLUMN reviewed_at TEXT DEFAULT '';
