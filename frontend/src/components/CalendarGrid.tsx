import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Pill } from './ui/Pill';
import type { Event, ThemeTokens } from '../types';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '../types';

interface CalendarGridProps {
  events: Event[];
  month: Date;
  onMonthChange: (date: Date) => void;
}

function parseEventDate(dateStr: string): Date | null {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function eventColor(evt: Event, T: ThemeTokens): string {
  const colorKey = EVENT_TYPE_COLORS[evt.eventType || 'quarterly_meetup'] || 'accent';
  return (T as unknown as Record<string, string>)[colorKey] || T.accent;
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarGrid({ events, month, onMonthChange }: CalendarGridProps) {
  const { T } = useTheme();
  const [popover, setPopover] = useState<{ evt: Event; x: number; y: number } | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!popover) return;
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPopover(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popover]);

  // Build event map
  const eventMap = new Map<string, Event[]>();
  for (const evt of events) {
    const d = parseEventDate(evt.date);
    if (!d) continue;
    const key = dateKey(d);
    const arr = eventMap.get(key) || [];
    arr.push(evt);
    eventMap.set(key, arr);
  }

  // Calendar grid cells
  const year = month.getFullYear();
  const mo = month.getMonth();
  const firstDay = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const prevDays = new Date(year, mo, 0).getDate();

  const today = dateKey(new Date());

  const cells: { date: Date; inMonth: boolean }[] = [];
  // Previous month overflow
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, mo - 1, prevDays - i), inMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, mo, d), inMonth: true });
  }
  // Next month overflow to fill grid
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(year, mo + 1, d), inMonth: false });
    }
  }

  const prevMonth = () => onMonthChange(new Date(year, mo - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, mo + 1, 1));
  const goToday = () => onMonthChange(new Date());

  const arrowBtn: React.CSSProperties = {
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6,
    color: T.text, cursor: 'pointer', padding: '6px 12px',
    fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
    transition: 'background 0.2s, border-color 0.2s',
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevMonth} style={arrowBtn} aria-label="Previous month">‹</button>
          <button onClick={nextMonth} style={arrowBtn} aria-label="Next month">›</button>
          <button onClick={goToday} style={{
            ...arrowBtn, fontSize: 11, letterSpacing: '0.08em', padding: '6px 14px',
          }}>
            TODAY
          </button>
        </div>
        <h3 style={{
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24,
          color: T.text, margin: 0, letterSpacing: '0.04em',
        }}>
          {MONTH_NAMES[mo]} <span style={{ color: T.accent }}>{year}</span>
        </h3>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
        {DAYS.map(d => (
          <div key={d} style={{
            fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700,
            letterSpacing: '0.12em', color: T.muted, textAlign: 'center',
            padding: '8px 0', borderBottom: `1px solid ${T.border}`,
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
        {cells.map((cell, i) => {
          const key = dateKey(cell.date);
          const isToday = key === today;
          const dayEvents = eventMap.get(key) || [];

          return (
            <div
              key={i}
              style={{
                minHeight: 100,
                padding: '4px 6px',
                border: `1px solid ${T.border}`,
                borderTop: 'none',
                borderLeft: i % 7 === 0 ? `1px solid ${T.border}` : 'none',
                background: cell.inMonth ? T.card : T.bg,
                transition: 'background 0.2s, border-color 0.2s',
                position: 'relative',
              }}
            >
              {/* Day number */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end', marginBottom: 4,
              }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: isToday ? 700 : 400,
                  color: !cell.inMonth ? T.muted + '66' : isToday ? '#fff' : T.text,
                  ...(isToday ? {
                    background: T.accent, width: 24, height: 24, borderRadius: '50%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  } : {}),
                  transition: 'color 0.2s',
                }}>
                  {cell.date.getDate()}
                </span>
              </div>

              {/* Event chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayEvents.map(evt => {
                  const color = eventColor(evt, T);
                  return (
                    <button
                      key={evt.id}
                      onClick={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setPopover({ evt, x: rect.left, y: rect.bottom + 4 });
                      }}
                      style={{
                        background: color, color: '#fff', border: 'none', borderRadius: 3,
                        padding: '2px 6px', cursor: 'pointer', textAlign: 'left',
                        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                        lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', display: 'block', width: '100%',
                      }}
                      title={evt.name}
                    >
                      {evt.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event type legend */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, padding: '10px 0',
        borderTop: `1px solid ${T.border}`,
      }}>
        {(Object.entries(EVENT_TYPE_LABELS) as [string, string][]).map(([type, label]) => {
          const colorKey = EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS] || 'accent';
          const color = (T as unknown as Record<string, string>)[colorKey] || T.accent;
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Popover */}
      {popover && (
        <div
          ref={popRef}
          style={{
            position: 'fixed',
            left: Math.min(popover.x, window.innerWidth - 310),
            top: Math.min(popover.y, window.innerHeight - 220),
            width: 290,
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 16,
            boxShadow: T.shadow,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <h4 style={{
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18,
                color: T.text, margin: '0 0 2px', letterSpacing: '0.02em',
              }}>
                {popover.evt.name}
              </h4>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted }}>
                {popover.evt.date} · {popover.evt.venue}
              </div>
            </div>
            <button onClick={() => setPopover(null)} style={{
              background: 'none', border: 'none', color: T.muted, fontSize: 18,
              cursor: 'pointer', fontWeight: 700, lineHeight: 1, padding: 0,
            }}>×</button>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            <Pill label={EVENT_TYPE_LABELS[popover.evt.eventType || 'quarterly_meetup']} color={eventColor(popover.evt, T)} size={9} />
            <Pill label={`${popover.evt.sessions.length} sessions`} color={T.purple} size={9} />
            <Pill label={`${popover.evt.stats.registered} registered`} color={T.accent} size={9} />
          </div>

          {popover.evt.sessions.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {popover.evt.sessions.slice(0, 3).map(s => (
                <div key={s.id} style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.subtle,
                  padding: '3px 0', borderTop: `1px solid ${T.border}22`,
                }}>
                  <span style={{ color: T.muted, fontWeight: 700, marginRight: 6 }}>{s.time}</span>
                  {s.title}
                </div>
              ))}
              {popover.evt.sessions.length > 3 && (
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted, marginTop: 2 }}>
                  +{popover.evt.sessions.length - 3} more
                </div>
              )}
            </div>
          )}

          {popover.evt.sponsors.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {popover.evt.sponsors.map(sp => (
                <Pill key={sp.id} label={sp.name} color={T.gold} size={9} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
