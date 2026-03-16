-- Migration 009: Event types + attendee check-in tracking

-- Add event_type to events
ALTER TABLE events ADD COLUMN event_type TEXT DEFAULT 'quarterly_meetup'
  CHECK (event_type IN ('quarterly_meetup', 'training', 'webinar', 'vendor_demo', 'executive_roundtable', 'social', 'study_group', 'hackathon'));

-- Add description and max_capacity to events
ALTER TABLE events ADD COLUMN description TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN max_capacity INTEGER DEFAULT 0;

-- Add per-attendee check-in tracking
ALTER TABLE attendees ADD COLUMN checked_in INTEGER DEFAULT 0;
ALTER TABLE attendees ADD COLUMN checked_in_at TEXT DEFAULT '';
ALTER TABLE attendees ADD COLUMN checked_in_by TEXT DEFAULT '';

-- Tag existing events
UPDATE events SET event_type = 'quarterly_meetup';
