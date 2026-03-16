-- Migration 008: Enable all privacy/visibility fields by default

-- Update existing users to have all visibility enabled
UPDATE users SET
  privacy_show_email = 1,
  privacy_show_phone = 1,
  privacy_show_company = 1,
  privacy_show_title = 1,
  privacy_show_linkedin = 1,
  privacy_show_type = 1,
  privacy_listed = 1
WHERE privacy_show_email = 0 OR privacy_show_phone = 0 OR privacy_show_linkedin = 0;
