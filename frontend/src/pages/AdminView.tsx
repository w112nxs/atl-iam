import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { StatBox } from '../components/ui/StatBox';
import { Avatar } from '../components/ui/Avatar';
import { CompanyAutocomplete } from '../components/ui/CompanyAutocomplete';
import { api } from '../api/client';
import type { User, Event, ThemeTokens } from '../types';
import { EVENT_TYPE_LABELS } from '../types';

type AdminTab = 'events' | 'members' | 'sponsors';

export function AdminView() {
  const { T } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('members');

  const tabs: { id: AdminTab; label: string; color: string }[] = [
    { id: 'members', label: 'Members', color: T.accent },
    { id: 'sponsors', label: 'Sponsors', color: T.gold },
    { id: 'events', label: 'Events', color: T.purple },
  ];

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28,
        color: T.text, margin: '0 0 20px', transition: 'color 0.25s',
      }}>
        <span style={{ color: T.red }}>●</span> Admin Dashboard
      </h1>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${T.border}`, paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? tab.color : 'transparent'}`,
              color: activeTab === tab.id ? tab.color : T.muted,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              padding: '10px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'events' && <EventsTab />}
      {activeTab === 'members' && <MembersTab />}
      {activeTab === 'sponsors' && <SponsorsTab />}
    </div>
  );
}

// ── Shared styles ──
function inputStyle(T: ThemeTokens): React.CSSProperties {
  return {
    background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 6,
    padding: '8px 10px', fontFamily: "'Inter', sans-serif", fontSize: 13,
    color: T.text, outline: 'none', width: '100%', transition: 'all 0.25s',
  };
}

function modalOverlay(_onClose?: () => void): React.CSSProperties {
  return {
    position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

function modalBox(T: ThemeTokens, width = 440): React.CSSProperties {
  return {
    background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
    padding: 24, width, maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' as const,
  };
}

function labelStyle(T: ThemeTokens): React.CSSProperties {
  return {
    fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
    color: T.muted, letterSpacing: '0.08em', display: 'block', marginBottom: 3,
  };
}

// ── Events Tab ──
function EventsTab() {
  const { T } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [editing, setEditing] = useState<Event | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingSession, setEditingSession] = useState<{ id: string; title: string; speaker: string; time: string; cpe: number } | null>(null);
  const [addingSession, setAddingSession] = useState(false);
  const [sponsorContacts, setSponsorContacts] = useState<Record<string, { id: string; name: string; email: string; title: string; phone: string }[]>>({});
  const [expandedSponsor, setExpandedSponsor] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  // Drill-down state for interactive stats
  type DrillAttendee = {
    id: string; name: string; email: string; company: string; title: string;
    type: string; checkedIn: boolean; checkedInAt: string; checkedInBy: string;
  };
  const [drillOpen, setDrillOpen] = useState<{ eventId: string; eventName: string; label: string; filter?: string } | null>(null);
  const [drillData, setDrillData] = useState<DrillAttendee[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillSearch, setDrillSearch] = useState('');

  const openAdminDrill = async (eventId: string, eventName: string, label: string, filter?: string) => {
    setDrillOpen({ eventId, eventName, label, filter });
    setDrillSearch('');
    setDrillLoading(true);
    try {
      const data = await api.getAdminEventAttendees(eventId, filter);
      setDrillData(data);
    } catch { setDrillData([]); }
    setDrillLoading(false);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAdminEvents();
      setEvents(data);
      if (!selectedEventId && data.length > 0) setSelectedEventId(data[0].id);
    } catch { setEvents([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const selectedEvent = events.find(e => e.id === selectedEventId);

  const tierColor = (tier: string) =>
    tier === 'Gold' ? T.gold : tier === 'Silver' ? T.subtle : T.accent;

  const handleToggleSponsorContacts = async (sponsorId: string) => {
    if (expandedSponsor === sponsorId) {
      setExpandedSponsor(null);
      return;
    }
    setExpandedSponsor(sponsorId);
    if (!sponsorContacts[sponsorId]) {
      try {
        const contacts = await api.getAdminSponsorContacts(sponsorId);
        setSponsorContacts(prev => ({ ...prev, [sponsorId]: contacts }));
      } catch {
        setSponsorContacts(prev => ({ ...prev, [sponsorId]: [] }));
      }
    }
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (!confirm(`Delete event "${name}"? This will remove all sessions, sponsors, and attendees for this event.`)) return;
    try {
      await api.deleteAdminEvent(id);
      if (selectedEventId === id) setSelectedEventId('');
      load();
      flash('Event deleted');
    } catch { flash('Failed to delete event'); }
  };

  const handleSaveEvent = async (id: string, data: { name?: string; date?: string; venue?: string }) => {
    try {
      await api.updateAdminEvent(id, data);
      setEditing(null);
      load();
      flash('Event updated');
    } catch { flash('Failed to update event'); }
  };

  const handleCreateEvent = async (data: { name: string; date: string; venue?: string; eventType?: string; description?: string }) => {
    try {
      await api.createAdminEvent(data);
      setAdding(false);
      load();
      flash('Event created');
    } catch { flash('Failed to create event'); }
  };

  const handleCreateSession = async (data: { title: string; speaker?: string; time?: string; cpe?: number }) => {
    if (!selectedEventId) return;
    try {
      await api.createAdminSession(selectedEventId, data);
      setAddingSession(false);
      load();
      flash('Session added');
    } catch { flash('Failed to add session'); }
  };

  const handleSaveSession = async (id: string, data: { title?: string; speaker?: string; time?: string; cpe?: number }) => {
    try {
      await api.updateAdminSession(id, data);
      setEditingSession(null);
      load();
      flash('Session updated');
    } catch { flash('Failed to update session'); }
  };

  const handleDeleteSession = async (id: string, title: string) => {
    if (!confirm(`Delete session "${title}"?`)) return;
    try {
      await api.deleteAdminSession(id);
      load();
      flash('Session deleted');
    } catch { flash('Failed to delete session'); }
  };

  if (loading) return <div style={{ color: T.muted, fontFamily: "'Inter', sans-serif", fontSize: 13, padding: 20 }}>Loading...</div>;

  return (
    <>
      {toast && (
        <div style={{
          background: T.greenDim, border: `1px solid ${T.green}44`, borderRadius: 8,
          padding: '6px 14px', marginBottom: 12, fontFamily: "'Inter', sans-serif",
          fontSize: 12, color: T.green,
        }}>{toast}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {events.map(evt => (
          <button
            key={evt.id}
            onClick={() => setSelectedEventId(evt.id)}
            style={{
              background: selectedEventId === evt.id ? T.purple + '22' : 'transparent',
              border: `1px solid ${selectedEventId === evt.id ? T.purple + '44' : T.border}`,
              borderRadius: 20, color: selectedEventId === evt.id ? T.purple : T.muted,
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
              letterSpacing: '0.06em', padding: '6px 16px', cursor: 'pointer',
              transition: 'all 0.25s',
            }}
          >
            {evt.name}
          </button>
        ))}
        <button onClick={() => setAdding(true)} style={{
          background: T.purple, border: 'none', borderRadius: 20,
          padding: '6px 16px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.06em',
        }}>+ NEW EVENT</button>
      </div>

      {selectedEvent && (
        <>
          {/* Event header with edit/delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h2 style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22,
              color: T.text, margin: 0, flex: 1,
            }}>
              {selectedEvent.name}
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, marginLeft: 10, fontWeight: 400 }}>
                {selectedEvent.date} &middot; {selectedEvent.venue || 'No venue'}
              </span>
              {selectedEvent.eventType && (
                <Pill label={EVENT_TYPE_LABELS[selectedEvent.eventType] || selectedEvent.eventType} color={T.purple} size={9} />
              )}
            </h2>
            <button onClick={() => setEditing(selectedEvent)} style={{
              background: 'transparent', border: `1px solid ${T.accent}44`, borderRadius: 4,
              padding: '4px 10px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              fontSize: 10, fontWeight: 700, color: T.accent, letterSpacing: '0.06em',
            }}>EDIT</button>
            <button onClick={() => handleDeleteEvent(selectedEvent.id, selectedEvent.name)} style={{
              background: 'transparent', border: `1px solid ${T.red}44`, borderRadius: 4,
              padding: '4px 10px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              fontSize: 10, fontWeight: 700, color: T.red, letterSpacing: '0.06em',
            }}>DELETE</button>
          </div>

          {/* Stats — clickable for drill-down */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div onClick={() => openAdminDrill(selectedEvent.id, selectedEvent.name, 'Registered')} style={{ cursor: 'pointer' }} title="Click to view all registered">
              <StatBox label="Registered" value={selectedEvent.stats.registered} color={T.accent} />
            </div>
            <div onClick={() => openAdminDrill(selectedEvent.id, selectedEvent.name, 'Checked In', 'checked_in')} style={{ cursor: 'pointer' }} title="Click to view checked-in">
              <StatBox label="Checked In" value={selectedEvent.stats.checkedIn} color={T.green}
                sub={selectedEvent.stats.registered > 0 ? `${Math.round((selectedEvent.stats.checkedIn / selectedEvent.stats.registered) * 100)}% of registered` : '—'} />
            </div>
            <div onClick={() => openAdminDrill(selectedEvent.id, selectedEvent.name, 'Enterprise', 'enterprise')} style={{ cursor: 'pointer' }} title="Click to view enterprise">
              <StatBox label="Enterprise" value={selectedEvent.stats.enterprise} color={T.purple} />
            </div>
            <StatBox label="Sponsors" value={selectedEvent.sponsors.length} color={T.gold} />
          </div>

          {/* Sponsors with contacts */}
          <Card>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: T.muted, marginBottom: 14 }}>
              SPONSOR BREAKDOWN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedEvent.sponsors.map(sp => (
                <div key={sp.id}>
                  <div
                    onClick={() => handleToggleSponsorContacts(sp.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      padding: '6px 8px', borderRadius: 6,
                      background: expandedSponsor === sp.id ? T.surface : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Pill label={sp.tier} color={tierColor(sp.tier)} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: T.text, flex: 1 }}>{sp.name}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted }}>
                      {expandedSponsor === sp.id ? '▾' : '▸'} contacts
                    </span>
                  </div>
                  {expandedSponsor === sp.id && (
                    <div style={{ marginLeft: 28, marginTop: 6, marginBottom: 4 }}>
                      {!sponsorContacts[sp.id] ? (
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted }}>Loading...</span>
                      ) : sponsorContacts[sp.id].length === 0 ? (
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted }}>No contacts linked to this sponsor</span>
                      ) : (
                        sponsorContacts[sp.id].map(c => (
                          <div key={c.id} style={{
                            display: 'flex', gap: 12, padding: '4px 0', alignItems: 'center',
                            fontFamily: "'Inter', sans-serif", fontSize: 12,
                          }}>
                            <span style={{ fontWeight: 600, color: T.text, minWidth: 120 }}>{c.name}</span>
                            <span style={{ color: T.muted }}>{c.email}</span>
                            {c.title && <span style={{ color: T.subtle }}>{c.title}</span>}
                            {c.phone && <span style={{ color: T.subtle }}>{c.phone}</span>}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
              {selectedEvent.sponsors.length === 0 && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted }}>No sponsors for this event</span>
              )}
            </div>
          </Card>

          {/* Sessions */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: T.muted }}>
                SESSIONS ({selectedEvent.sessions.length})
              </span>
              <button onClick={() => setAddingSession(true)} style={{
                background: T.accent, border: 'none', borderRadius: 6,
                padding: '5px 12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.06em',
              }}>+ ADD SESSION</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedEvent.sessions.map(s => (
                <div key={s.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 60px 100px',
                  gap: 8, padding: '8px 12px', alignItems: 'center',
                  background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.text }}>{s.title}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted }}>{s.speaker || '—'}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.subtle }}>{s.time || '—'}</span>
                  <Pill label={`${s.cpe} CPE`} color={T.green} size={9} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setEditingSession(s)} style={{
                      background: 'transparent', border: `1px solid ${T.accent}44`, borderRadius: 4,
                      padding: '3px 8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                      fontSize: 10, fontWeight: 700, color: T.accent,
                    }}>EDIT</button>
                    <button onClick={() => handleDeleteSession(s.id, s.title)} style={{
                      background: 'transparent', border: `1px solid ${T.red}44`, borderRadius: 4,
                      padding: '3px 8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                      fontSize: 10, fontWeight: 700, color: T.red,
                    }}>DEL</button>
                  </div>
                </div>
              ))}
              {selectedEvent.sessions.length === 0 && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, padding: 8 }}>No sessions yet</span>
              )}
            </div>
          </div>
        </>
      )}

      {!selectedEvent && events.length === 0 && (
        <div style={{ color: T.muted, fontFamily: "'Inter', sans-serif", textAlign: 'center', padding: 40 }}>
          No events yet. Click "+ NEW EVENT" to create one.
        </div>
      )}

      {/* Modals */}
      {adding && <AddEventModal T={T} onAdd={handleCreateEvent} onClose={() => setAdding(false)} />}
      {editing && <EditEventModal T={T} event={editing} onSave={handleSaveEvent} onClose={() => setEditing(null)} />}
      {addingSession && <AddSessionModal T={T} onAdd={handleCreateSession} onClose={() => setAddingSession(false)} />}
      {editingSession && <EditSessionModal T={T} session={editingSession} onSave={handleSaveSession} onClose={() => setEditingSession(null)} />}

      {/* Attendee drill-down modal */}
      {drillOpen && (() => {
        const filtered = drillSearch.length >= 2
          ? drillData.filter(a => {
              const q = drillSearch.toLowerCase();
              return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.company.toLowerCase().includes(q);
            })
          : drillData;
        return (
          <div onClick={() => { setDrillOpen(null); setDrillData([]); }} style={modalOverlay()}>
            <div onClick={e => e.stopPropagation()} style={{ ...modalBox(T, 720), padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: T.text, margin: 0 }}>{drillOpen.label}</h3>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, marginTop: 2 }}>{drillOpen.eventName} — {filtered.length} attendee{filtered.length !== 1 ? 's' : ''}</div>
                </div>
                <button onClick={() => { setDrillOpen(null); setDrillData([]); }} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 24, cursor: 'pointer', fontWeight: 700 }}>x</button>
              </div>
              <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}` }}>
                <input value={drillSearch} onChange={e => setDrillSearch(e.target.value)} placeholder="Search by name, email, or company..."
                  style={{ ...inputStyle(T), width: '100%' }} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 16px' }}>
                {drillLoading ? (
                  <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Inter', sans-serif", color: T.muted }}>Loading...</div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, fontFamily: "'Inter', sans-serif", color: T.muted }}>No attendees found</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Name', 'Company', 'Title', 'Type', 'Status', 'Checked In At'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 6px', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: T.muted, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${T.border}22` }}>
                          <td style={{ padding: '8px 6px' }}>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.text }}>{a.name}</div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted }}>{a.email}</div>
                          </td>
                          <td style={{ padding: '8px 6px', fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.text }}>{a.company}</td>
                          <td style={{ padding: '8px 6px', fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted }}>{a.title}</td>
                          <td style={{ padding: '8px 6px' }}>
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: (a.type === 'enterprise' ? T.accent : T.gold) + '22', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: a.type === 'enterprise' ? T.accent : T.gold, letterSpacing: '0.06em' }}>
                              {a.type === 'enterprise' ? 'ENT' : 'VND'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 6px' }}>
                            {a.checkedIn ? (
                              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: T.green + '22', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: '0.06em' }}>IN</span>
                            ) : (
                              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: T.muted + '22', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.06em' }}>--</span>
                            )}
                          </td>
                          <td style={{ padding: '8px 6px', fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted }}>{a.checkedInAt ? new Date(a.checkedInAt).toLocaleString() : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

// ── Event Modals ──

function AddEventModal({ T, onAdd, onClose }: {
  T: ThemeTokens; onAdd: (d: { name: string; date: string; venue?: string; eventType?: string; description?: string }) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ name: '', date: '', venue: '', eventType: 'quarterly_meetup', description: '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div onClick={onClose} style={modalOverlay(onClose)}>
      <div onClick={e => e.stopPropagation()} style={modalBox(T, 440)}>
        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 16px' }}>New Event</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>EVENT TYPE</label>
          <select style={{ ...inputStyle(T), cursor: 'pointer' }} value={form.eventType} onChange={e => set('eventType', e.target.value)}>
            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        {[
          { key: 'name', label: 'EVENT NAME', placeholder: 'Atlanta IAM Meetup #2' },
          { key: 'date', label: 'DATE', placeholder: '2025-06-15' },
          { key: 'venue', label: 'VENUE', placeholder: 'Tech Square, Atlanta' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 10 }}>
            <label style={labelStyle(T)}>{f.label}</label>
            <input style={inputStyle(T)} value={(form as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} />
          </div>
        ))}
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>DESCRIPTION</label>
          <textarea style={{ ...inputStyle(T), minHeight: 60, resize: 'vertical' as const }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief event description..." />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: T.muted }}>CANCEL</button>
          <button onClick={() => { if (form.name && form.date) onAdd(form); }} style={{
            background: T.purple, border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: '#fff',
            opacity: form.name && form.date ? 1 : 0.5,
          }}>CREATE</button>
        </div>
      </div>
    </div>
  );
}

function EditEventModal({ T, event, onSave, onClose }: {
  T: ThemeTokens; event: Event; onSave: (id: string, d: { name?: string; date?: string; venue?: string; eventType?: string; description?: string }) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: event.name, date: event.date, venue: event.venue,
    eventType: event.eventType || 'quarterly_meetup', description: event.description || '',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div onClick={onClose} style={modalOverlay(onClose)}>
      <div onClick={e => e.stopPropagation()} style={modalBox(T, 440)}>
        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 16px' }}>Edit Event</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>EVENT TYPE</label>
          <select style={{ ...inputStyle(T), cursor: 'pointer' }} value={form.eventType} onChange={e => set('eventType', e.target.value)}>
            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        {[
          { key: 'name', label: 'EVENT NAME' },
          { key: 'date', label: 'DATE' },
          { key: 'venue', label: 'VENUE' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 10 }}>
            <label style={labelStyle(T)}>{f.label}</label>
            <input style={inputStyle(T)} value={(form as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)} />
          </div>
        ))}
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>DESCRIPTION</label>
          <textarea style={{ ...inputStyle(T), minHeight: 60, resize: 'vertical' as const }} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: T.muted }}>CANCEL</button>
          <button onClick={() => onSave(event.id, form)} style={{
            background: T.purple, border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: '#fff',
          }}>SAVE</button>
        </div>
      </div>
    </div>
  );
}

function AddSessionModal({ T, onAdd, onClose }: {
  T: ThemeTokens; onAdd: (d: { title: string; speaker?: string; time?: string; cpe?: number }) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ title: '', speaker: '', time: '', cpe: '1' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div onClick={onClose} style={modalOverlay(onClose)}>
      <div onClick={e => e.stopPropagation()} style={modalBox(T, 400)}>
        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 16px' }}>Add Session</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>TITLE</label>
          <input style={inputStyle(T)} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Session title" />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>SPEAKER</label>
          <input style={inputStyle(T)} value={form.speaker} onChange={e => set('speaker', e.target.value)} placeholder="Speaker name" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={labelStyle(T)}>TIME</label>
            <input style={inputStyle(T)} value={form.time} onChange={e => set('time', e.target.value)} placeholder="10:00 AM" />
          </div>
          <div>
            <label style={labelStyle(T)}>CPE</label>
            <input style={inputStyle(T)} type="number" min="0" value={form.cpe} onChange={e => set('cpe', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: T.muted }}>CANCEL</button>
          <button onClick={() => { if (form.title) onAdd({ title: form.title, speaker: form.speaker, time: form.time, cpe: Number(form.cpe) || 1 }); }} style={{
            background: T.accent, border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: '#fff',
            opacity: form.title ? 1 : 0.5,
          }}>ADD</button>
        </div>
      </div>
    </div>
  );
}

function EditSessionModal({ T, session, onSave, onClose }: {
  T: ThemeTokens; session: { id: string; title: string; speaker: string; time: string; cpe: number };
  onSave: (id: string, d: { title?: string; speaker?: string; time?: string; cpe?: number }) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ title: session.title, speaker: session.speaker, time: session.time, cpe: String(session.cpe) });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div onClick={onClose} style={modalOverlay(onClose)}>
      <div onClick={e => e.stopPropagation()} style={modalBox(T, 400)}>
        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 16px' }}>Edit Session</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>TITLE</label>
          <input style={inputStyle(T)} value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>SPEAKER</label>
          <input style={inputStyle(T)} value={form.speaker} onChange={e => set('speaker', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={labelStyle(T)}>TIME</label>
            <input style={inputStyle(T)} value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle(T)}>CPE</label>
            <input style={inputStyle(T)} type="number" min="0" value={form.cpe} onChange={e => set('cpe', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: T.muted }}>CANCEL</button>
          <button onClick={() => onSave(session.id, { title: form.title, speaker: form.speaker, time: form.time, cpe: Number(form.cpe) || 1 })} style={{
            background: T.accent, border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: '#fff',
          }}>SAVE</button>
        </div>
      </div>
    </div>
  );
}

// ── Members Tab ──
function MembersTab() {
  const { T } = useTheme();
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const result = await api.getAdminMembers({ q, limit: 100 });
      setMembers(result.members);
      setTotal(result.total);
    } catch { setMembers([]); setTotal(0); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const handleSave = async (id: string, data: Record<string, string>) => {
    setSaving(true);
    try {
      await api.updateAdminMember(id, data);
      setEditing(null);
      search(query);
      setToast('Member updated');
      setTimeout(() => setToast(''), 2000);
    } catch {
      setToast('Failed to save');
      setTimeout(() => setToast(''), 2000);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.deleteAdminMember(id);
      search(query);
      setToast('Member deleted');
      setTimeout(() => setToast(''), 2000);
    } catch {
      setToast('Failed to delete');
      setTimeout(() => setToast(''), 2000);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <input
          style={{ ...inputStyle(T), maxWidth: 350 }}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, email, or company..."
        />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted }}>
          {total} member{total !== 1 ? 's' : ''}
        </span>
      </div>

      {toast && (
        <div style={{
          background: T.greenDim, border: `1px solid ${T.green}44`, borderRadius: 8,
          padding: '6px 14px', marginBottom: 12, fontFamily: "'Inter', sans-serif",
          fontSize: 12, color: T.green,
        }}>{toast}</div>
      )}

      {loading ? (
        <div style={{ color: T.muted, fontFamily: "'Inter', sans-serif", fontSize: 13, padding: 20 }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 1.5fr 2fr 1fr 80px 100px',
            gap: 8, padding: '6px 12px', alignItems: 'center',
          }}>
            {['', 'Name', 'Email', 'Role', 'Type', 'Actions'].map(h => (
              <span key={h} style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: T.subtle, letterSpacing: '0.1em' }}>
                {h}
              </span>
            ))}
          </div>

          {members.map(m => (
            <div key={m.id} style={{
              display: 'grid', gridTemplateColumns: '40px 1.5fr 2fr 1fr 80px 100px',
              gap: 8, padding: '8px 12px', alignItems: 'center',
              background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`,
              transition: 'all 0.2s',
            }}>
              <Avatar name={m.name} size={28} role={m.role} />
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{m.name}</div>
                {m.company && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.company}</div>
                )}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{m.email}</div>
              <Pill label={m.role} color={m.role === 'admin' ? T.red : m.role === 'sponsor' ? T.gold : T.accent} size={9} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted }}>
                {m.userType || '—'}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditing(m)} style={{
                  background: 'transparent', border: `1px solid ${T.accent}44`, borderRadius: 4,
                  padding: '3px 8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  fontSize: 10, fontWeight: 700, color: T.accent, letterSpacing: '0.06em',
                }}>EDIT</button>
                <button onClick={() => handleDelete(m.id, m.name)} style={{
                  background: 'transparent', border: `1px solid ${T.red}44`, borderRadius: 4,
                  padding: '3px 8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  fontSize: 10, fontWeight: 700, color: T.red, letterSpacing: '0.06em',
                }}>DEL</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditMemberModal
          T={T} member={editing} saving={saving}
          onSave={handleSave} onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function EditMemberModal({ T, member, saving, onSave, onClose }: {
  T: ThemeTokens; member: User; saving: boolean;
  onSave: (id: string, data: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    firstName: member.firstName || '',
    lastName: member.lastName || '',
    email: member.email,
    role: member.role,
    company: member.company || '',
    title: member.title || '',
    phone: member.phone || '',
    userType: member.userType || '',
  });

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div onClick={onClose} style={modalOverlay(onClose)}>
      <div onClick={e => e.stopPropagation()} style={modalBox(T)}>
        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 16px' }}>
          Edit Member
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={labelStyle(T)}>FIRST NAME</label>
            <input style={inputStyle(T)} value={form.firstName} onChange={e => set('firstName', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle(T)}>LAST NAME</label>
            <input style={inputStyle(T)} value={form.lastName} onChange={e => set('lastName', e.target.value)} />
          </div>
        </div>

        {[
          { key: 'email', label: 'EMAIL' },
          { key: 'title', label: 'TITLE' },
          { key: 'phone', label: 'PHONE' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 10 }}>
            <label style={labelStyle(T)}>{f.label}</label>
            <input style={inputStyle(T)} value={(form as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)} />
          </div>
        ))}

        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>COMPANY</label>
          <CompanyAutocomplete style={inputStyle(T)} value={form.company} onChange={v => set('company', v)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={labelStyle(T)}>ROLE</label>
            <select style={{ ...inputStyle(T), cursor: 'pointer' }} value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="guest">Guest</option>
              <option value="member">Member</option>
              <option value="sponsor">Sponsor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label style={labelStyle(T)}>USER TYPE</label>
            <select style={{ ...inputStyle(T), cursor: 'pointer' }} value={form.userType} onChange={e => set('userType', e.target.value)}>
              <option value="">—</option>
              <option value="enterprise">Enterprise</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6,
            padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: '0.06em',
          }}>CANCEL</button>
          <button
            onClick={() => onSave(member.id, {
              ...form,
              name: `${form.firstName} ${form.lastName}`.trim(),
            })}
            disabled={saving}
            style={{
              background: T.accent, border: 'none', borderRadius: 6,
              padding: '8px 18px', cursor: saving ? 'wait' : 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
              color: '#fff', letterSpacing: '0.06em',
            }}
          >{saving ? 'SAVING...' : 'SAVE'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Sponsors Tab ──
function SponsorsTab() {
  const { T } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [sponsors, setSponsors] = useState<{ eventId: string; eventName: string; sponsorId: string; sponsorName: string; tier: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<typeof sponsors[0] | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sponsorData, eventData] = await Promise.all([
        api.getAdminSponsors(),
        api.getAdminEvents(),
      ]);
      setSponsors(sponsorData);
      setEvents(eventData);
    } catch { setSponsors([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const handleDelete = async (eventId: string, sponsorId: string, name: string) => {
    if (!confirm(`Remove sponsor "${name}"?`)) return;
    try {
      await api.deleteAdminSponsor(eventId, sponsorId);
      load();
      flash('Sponsor removed');
    } catch { flash('Failed to remove'); }
  };

  const handleSaveEdit = async (eventId: string, sponsorId: string, data: { sponsorName?: string; tier?: string }) => {
    try {
      await api.updateAdminSponsor(eventId, sponsorId, data);
      setEditing(null);
      load();
      flash('Sponsor updated');
    } catch { flash('Failed to update'); }
  };

  const handleAdd = async (data: { eventId: string; sponsorId: string; sponsorName: string; tier: string }) => {
    try {
      await api.addAdminSponsor(data);
      setAdding(false);
      load();
      flash('Sponsor added');
    } catch { flash('Failed to add'); }
  };

  const tierColor = (tier: string) =>
    tier === 'Gold' ? T.gold : tier === 'Silver' ? T.subtle : T.accent;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted }}>
          {sponsors.length} sponsor assignment{sponsors.length !== 1 ? 's' : ''}
        </span>
        <button onClick={() => setAdding(true)} style={{
          background: T.gold, border: 'none', borderRadius: 6,
          padding: '7px 16px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.06em',
        }}>+ ADD SPONSOR</button>
      </div>

      {toast && (
        <div style={{
          background: T.greenDim, border: `1px solid ${T.green}44`, borderRadius: 8,
          padding: '6px 14px', marginBottom: 12, fontFamily: "'Inter', sans-serif",
          fontSize: 12, color: T.green,
        }}>{toast}</div>
      )}

      {loading ? (
        <div style={{ color: T.muted, fontFamily: "'Inter', sans-serif", fontSize: 13, padding: 20 }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 80px 100px',
            gap: 8, padding: '6px 12px',
          }}>
            {['Event', 'Sponsor', 'Tier', 'Actions'].map(h => (
              <span key={h} style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: T.subtle, letterSpacing: '0.1em' }}>{h}</span>
            ))}
          </div>

          {sponsors.map(s => (
            <div key={`${s.eventId}-${s.sponsorId}`} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 80px 100px',
              gap: 8, padding: '10px 12px', alignItems: 'center',
              background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`,
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.text }}>{s.eventName}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.text }}>{s.sponsorName}</span>
              <Pill label={s.tier} color={tierColor(s.tier)} size={9} />
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditing(s)} style={{
                  background: 'transparent', border: `1px solid ${T.accent}44`, borderRadius: 4,
                  padding: '3px 8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  fontSize: 10, fontWeight: 700, color: T.accent, letterSpacing: '0.06em',
                }}>EDIT</button>
                <button onClick={() => handleDelete(s.eventId, s.sponsorId, s.sponsorName)} style={{
                  background: 'transparent', border: `1px solid ${T.red}44`, borderRadius: 4,
                  padding: '3px 8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  fontSize: 10, fontWeight: 700, color: T.red, letterSpacing: '0.06em',
                }}>DEL</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Sponsor Modal */}
      {editing && <EditSponsorModal T={T} sponsor={editing} onSave={handleSaveEdit} onClose={() => setEditing(null)} />}

      {/* Add Sponsor Modal */}
      {adding && <AddSponsorModal T={T} events={events} onAdd={handleAdd} onClose={() => setAdding(false)} />}
    </>
  );
}

function EditSponsorModal({ T, sponsor, onSave, onClose }: {
  T: ThemeTokens;
  sponsor: { eventId: string; sponsorId: string; sponsorName: string; tier: string };
  onSave: (eventId: string, sponsorId: string, data: { sponsorName?: string; tier?: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(sponsor.sponsorName);
  const [tier, setTier] = useState(sponsor.tier);

  return (
    <div onClick={onClose} style={modalOverlay(onClose)}>
      <div onClick={e => e.stopPropagation()} style={modalBox(T, 380)}>
        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 16px' }}>Edit Sponsor</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>SPONSOR NAME</label>
          <input style={inputStyle(T)} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle(T)}>TIER</label>
          <select style={{ ...inputStyle(T), cursor: 'pointer' }} value={tier} onChange={e => setTier(e.target.value)}>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Community">Community</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6,
            padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontSize: 12, fontWeight: 700, color: T.muted,
          }}>CANCEL</button>
          <button onClick={() => onSave(sponsor.eventId, sponsor.sponsorId, { sponsorName: name, tier })} style={{
            background: T.gold, border: 'none', borderRadius: 6,
            padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>SAVE</button>
        </div>
      </div>
    </div>
  );
}

function AddSponsorModal({ T, events, onAdd, onClose }: {
  T: ThemeTokens;
  events: { id: string; name: string }[];
  onAdd: (data: { eventId: string; sponsorId: string; sponsorName: string; tier: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ eventId: events[0]?.id || '', sponsorId: '', sponsorName: '', tier: 'Gold' });
  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div onClick={onClose} style={modalOverlay(onClose)}>
      <div onClick={e => e.stopPropagation()} style={modalBox(T, 380)}>
        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 16px' }}>Add Sponsor</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>EVENT</label>
          <select style={{ ...inputStyle(T), cursor: 'pointer' }} value={form.eventId} onChange={e => set('eventId', e.target.value)}>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>SPONSOR ID</label>
          <input style={inputStyle(T)} value={form.sponsorId} onChange={e => set('sponsorId', e.target.value)} placeholder="e.g. saviynt" />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle(T)}>SPONSOR NAME</label>
          <input style={inputStyle(T)} value={form.sponsorName} onChange={e => set('sponsorName', e.target.value)} placeholder="e.g. Saviynt" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle(T)}>TIER</label>
          <select style={{ ...inputStyle(T), cursor: 'pointer' }} value={form.tier} onChange={e => set('tier', e.target.value)}>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Community">Community</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6,
            padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontSize: 12, fontWeight: 700, color: T.muted,
          }}>CANCEL</button>
          <button
            onClick={() => { if (form.sponsorId && form.sponsorName) onAdd(form); }}
            style={{
              background: T.gold, border: 'none', borderRadius: 6,
              padding: '8px 18px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              fontSize: 12, fontWeight: 700, color: '#fff',
              opacity: form.sponsorId && form.sponsorName ? 1 : 0.5,
            }}
          >ADD</button>
        </div>
      </div>
    </div>
  );
}
