import { useState, useEffect } from 'react';
import type { Event } from '../types';
import { api } from '../api/client';
import { events as seedEvents } from '../data/seed';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>(seedEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getEvents()
      .then(apiEvents => {
        if (cancelled || apiEvents.length === 0) return;
        // API returns events without attendees — merge with seed data to preserve attendees
        const merged = apiEvents.map(apiEvt => {
          const seedEvt = seedEvents.find(s => s.id === apiEvt.id);
          return {
            ...apiEvt,
            attendees: seedEvt?.attendees || apiEvt.attendees || [],
          };
        });
        setEvents(merged);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { events, loading };
}
