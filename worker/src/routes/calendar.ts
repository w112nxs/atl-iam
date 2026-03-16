import { Hono } from 'hono';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

function parseDate(dateStr: string): Date | null {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function toIcsDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Public: ICS calendar feed
app.get('/events.ics', async (c) => {
  const eventType = c.req.query('eventType');
  const eventId = c.req.query('eventId');

  let eventsQuery = 'SELECT * FROM events';
  const params: string[] = [];

  if (eventId) {
    eventsQuery += ' WHERE id = ?';
    params.push(eventId);
  } else if (eventType) {
    eventsQuery += ' WHERE event_type = ?';
    params.push(eventType);
  }

  eventsQuery += ' ORDER BY id ASC';

  const stmt = params.length
    ? c.env.DB.prepare(eventsQuery).bind(...params)
    : c.env.DB.prepare(eventsQuery);

  const [eventsRes, sessionsRes] = await Promise.all([
    stmt.all(),
    c.env.DB.prepare('SELECT * FROM sessions ORDER BY session_time ASC').all(),
  ]);

  const events = eventsRes.results || [];
  const sessions = sessionsRes.results || [];

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atlanta IAM User Group//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Atlanta IAM Events',
    'X-WR-TIMEZONE:America/New_York',
    // VTIMEZONE block for broad client compatibility
    'BEGIN:VTIMEZONE',
    'TZID:America/New_York',
    'BEGIN:STANDARD',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0500',
    'TZNAME:EST',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0400',
    'TZNAME:EDT',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
  ];

  for (const evt of events) {
    const date = parseDate(evt.date as string);
    if (!date) continue;

    const icsDate = toIcsDate(date);
    const eventSessions = sessions.filter((s) => s.event_id === evt.id);

    let description = escapeIcs((evt.description as string) || (evt.name as string));
    if (eventSessions.length > 0) {
      description += '\\n\\nSessions:';
      for (const s of eventSessions) {
        description += `\\n- ${escapeIcs(s.session_time as string)}: ${escapeIcs(s.title as string)} (${escapeIcs(s.speaker as string)})`;
      }
    }

    const uid = `${evt.id}@atlantaiam.com`;
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=America/New_York:${icsDate}T090000`,
      `DTEND;TZID=America/New_York:${icsDate}T170000`,
      `SUMMARY:${escapeIcs(evt.name as string)}`,
      `LOCATION:${escapeIcs((evt.venue as string) || 'Atlanta, GA')}`,
      `DESCRIPTION:${description}`,
      `URL:https://atlantaiam.com/events`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    );
  }

  ics.push('END:VCALENDAR');

  const body = ics.join('\r\n');
  const filename = eventId ? `atlanta-iam-event-${eventId}.ics` : 'atlanta-iam-events.ics';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

export default app;
