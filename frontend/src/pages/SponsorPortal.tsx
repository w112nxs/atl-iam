import { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { SectionLabel } from '../components/ui/SectionLabel';
import { StatBox } from '../components/ui/StatBox';
import { ExportAcknowledgmentModal } from '../components/modals/ExportAcknowledgmentModal';
import { api } from '../api/client';
import { useEvents } from '../hooks/useEvents';
import type { User, Event, Tier } from '../types';

interface SponsorPortalProps {
  user: User;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

function tierColor(tier: string, T: ReturnType<typeof useTheme>['T']) {
  return tier === 'Gold' ? T.gold : tier === 'Silver' ? T.subtle : T.accent;
}

export function SponsorPortal({ user, onToast }: SponsorPortalProps) {
  const { T } = useTheme();
  const { events } = useEvents();
  const [activeTab, setActiveTab] = useState<'attendees' | 'sessions' | 'access'>('attendees');
  const [search, setSearch] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  // Scope events to sponsor
  const scopedEvents = useMemo(() => {
    if (user.role === 'admin') return events;
    return events.filter(evt => evt.sponsors.some(s => s.id === user.sponsorId));
  }, [user, events]);

  const [selectedEventId, setSelectedEventId] = useState(scopedEvents[0]?.id || '');
  const selectedEvent = scopedEvents.find(e => e.id === selectedEventId) as Event | undefined;

  const sponsorEntry = selectedEvent?.sponsors.find(s => s.id === user.sponsorId);
  const currentTier: Tier = user.role === 'admin' ? 'Gold' : (sponsorEntry?.tier || 'Community');

  // Consent-filtered attendees only
  const consentedAttendees = useMemo(() =>
    selectedEvent?.attendees.filter(a => a.sponsorConsent) || [],
    [selectedEvent]
  );

  const optedOutCount = (selectedEvent?.attendees.length || 0) - consentedAttendees.length;

  const filteredAttendees = useMemo(() => {
    if (!search.trim()) return consentedAttendees;
    const q = search.toLowerCase();
    return consentedAttendees.filter(a =>
      a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q)
    );
  }, [consentedAttendees, search]);

  const handleExport = () => {
    // Log export to audit trail
    api.logExport({
      eventId: selectedEventId,
      attendeeCount: consentedAttendees.length,
      tier: currentTier,
      timestamp: new Date().toISOString(),
    }).catch(() => {}); // best-effort audit log

    // Build CSV
    const headers = ['Name', 'Company', 'Title', 'Certifications', 'Email', 'Sessions'];
    const rows = consentedAttendees.map(a => [
      a.name,
      a.company,
      currentTier === 'Community' ? '' : a.title,
      currentTier === 'Community' ? '' : a.certs.join('; '),
      currentTier === 'Gold' ? a.email : '',
      a.sessions.length.toString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atlanta-iam-attendees-${selectedEventId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    onToast('CSV exported successfully', 'success');
  };

  if (!selectedEvent) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: T.muted, fontFamily: "'Barlow', sans-serif" }}>
        No events available for your sponsor account.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 24 }}>◆</span>
        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 24,
          color: T.gold,
          margin: 0,
          transition: 'color 0.25s',
        }}>
          SPONSOR PORTAL
        </h1>
        <span style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: T.text,
          transition: 'color 0.25s',
        }}>
          {user.company}
        </span>
        <Pill label={currentTier} color={tierColor(currentTier, T)} />
      </div>

      {/* Data rights notice */}
      <div style={{
        background: T.amberDim,
        border: `1px solid ${T.amber}44`,
        borderRadius: 10,
        padding: '12px 18px',
        marginBottom: 24,
        fontFamily: "'Poppins', sans-serif",
        fontSize: 12,
        color: T.amber,
        lineHeight: 1.6,
        transition: 'background 0.25s, color 0.25s, border-color 0.25s',
      }}>
        Only consented attendees shown. Post-event use only. Prohibited: general marketing lists, third-party sharing, data enrichment. Max retention: 12 months.
      </div>

      {/* Event selector */}
      {scopedEvents.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {scopedEvents.map(evt => (
            <button
              key={evt.id}
              onClick={() => { setSelectedEventId(evt.id); setSearch(''); }}
              style={{
                background: selectedEventId === evt.id ? T.accent + '22' : 'transparent',
                border: `1px solid ${selectedEventId === evt.id ? T.accent + '44' : T.border}`,
                borderRadius: 20,
                color: selectedEventId === evt.id ? T.accent : T.muted,
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.06em',
                padding: '6px 16px',
                cursor: 'pointer',
                transition: 'background 0.25s, color 0.25s, border-color 0.25s',
              }}
            >
              {evt.name}
            </button>
          ))}
        </div>
      )}

      {/* Event overview */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: T.text,
              margin: '0 0 4px',
              transition: 'color 0.25s',
            }}>
              {selectedEvent.name}
            </h2>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 13,
              color: T.muted,
              transition: 'color 0.25s',
            }}>
              {selectedEvent.date} · {selectedEvent.venue}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Pill label={currentTier} color={tierColor(currentTier, T)} />
            <Pill label={`${consentedAttendees.length} consented`} color={T.green} />
            <Pill label={`${optedOutCount} opted out`} color={T.muted} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
          <StatBox label="Total Attended" value={selectedEvent.stats.checkedIn} color={T.accent} />
          <StatBox label="Consented" value={consentedAttendees.length} color={T.green} />
          <StatBox label="Your Tier" value={currentTier} color={tierColor(currentTier, T)} />
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${T.border}`, transition: 'border-color 0.25s' }}>
        {[
          { key: 'attendees' as const, label: 'Attendees' },
          { key: 'sessions' as const, label: 'Session Analytics' },
          { key: 'access' as const, label: 'Access Level' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? `2px solid ${T.accent}` : '2px solid transparent',
              color: activeTab === tab.key ? T.accent : T.muted,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              padding: '10px 18px',
              cursor: 'pointer',
              transition: 'color 0.25s, border-color 0.25s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Attendees */}
      {activeTab === 'attendees' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or company..."
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.inputBg,
                color: T.text,
                fontFamily: "'Poppins', sans-serif",
                fontSize: 13,
                outline: 'none',
                width: 260,
                transition: 'background 0.25s, color 0.25s, border-color 0.25s',
              }}
            />
            {currentTier === 'Gold' ? (
              <button
                onClick={() => setShowExportModal(true)}
                style={{
                  background: T.accent + '22',
                  border: `1px solid ${T.accent}44`,
                  borderRadius: 6,
                  color: T.accent,
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                }}
              >
                EXPORT CSV
              </button>
            ) : (
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.08em',
                color: T.muted,
                transition: 'color 0.25s',
              }}>
                EXPORT: GOLD ONLY
              </span>
            )}
          </div>

          {optedOutCount > 0 && (
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 12,
              color: T.muted,
              marginBottom: 12,
              transition: 'color 0.25s',
            }}>
              {optedOutCount} attendee{optedOutCount !== 1 ? 's' : ''} opted out of sponsor data sharing
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {(() => {
                    const cols: { label: string; show: boolean }[] = [
                      { label: '#', show: true },
                      { label: 'Name', show: true },
                      { label: 'Company', show: true },
                      { label: 'Title', show: currentTier !== 'Community' || true },
                      { label: 'Certifications', show: currentTier !== 'Community' },
                      { label: 'Email', show: currentTier === 'Gold' },
                      { label: 'Sessions', show: true },
                    ];
                    return cols.filter(c => c.show).map(col => (
                      <th key={col.label} style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: '0.15em',
                        color: T.muted,
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderBottom: `1px solid ${T.border}`,
                        textTransform: 'uppercase',
                        transition: 'color 0.25s, border-color 0.25s',
                      }}>
                        {col.label}
                      </th>
                    ));
                  })()}
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((att, idx) => (
                  <tr
                    key={att.id}
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={cellStyle(T)}>{idx + 1}</td>
                    <td style={{ ...cellStyle(T), fontWeight: 600 }}>{att.name}</td>
                    <td style={cellStyle(T)}>{att.company}</td>
                    <td style={cellStyle(T)}>
                      {currentTier === 'Community' ? (
                        <span style={{ color: T.muted, fontStyle: 'italic', fontSize: 11 }}>[Community access]</span>
                      ) : att.title}
                    </td>
                    {currentTier !== 'Community' && (
                      <td style={cellStyle(T)}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {att.certs.map(c => (
                            <Pill key={c} label={c} color={T.purple} size={9} />
                          ))}
                        </div>
                      </td>
                    )}
                    {currentTier === 'Gold' && (
                      <td style={{ ...cellStyle(T), fontSize: 12 }}>{att.email}</td>
                    )}
                    <td style={cellStyle(T)}>{att.sessions.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Session Analytics */}
      {activeTab === 'sessions' && (
        <div>
          <div style={{
            background: T.accentDim,
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 20,
            fontFamily: "'Poppins', sans-serif",
            fontSize: 12,
            color: T.accent,
            transition: 'background 0.25s, color 0.25s',
          }}>
            Aggregate only — individual session-attendee linking not available in Sponsor Portal
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedEvent.sessions.map(session => {
              const sessionAttendeeCount = consentedAttendees.filter(a =>
                a.sessions.includes(session.id)
              ).length;
              const pct = consentedAttendees.length > 0
                ? (sessionAttendeeCount / consentedAttendees.length) * 100
                : 0;

              return (
                <Card key={session.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: T.text,
                        transition: 'color 0.25s',
                      }}>
                        {session.title}
                      </div>
                      <div style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        color: T.muted,
                        transition: 'color 0.25s',
                      }}>
                        {session.speaker} · {session.time} · {session.cpe} CPE
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: T.accent,
                      transition: 'color 0.25s',
                    }}>
                      {sessionAttendeeCount} consented
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{
                    height: 6,
                    borderRadius: 3,
                    background: T.border,
                    overflow: 'hidden',
                    transition: 'background 0.25s',
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 3,
                      background: T.accent,
                      width: `${pct}%`,
                      transition: 'width 0.6s ease, background 0.25s',
                    }} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Access Level */}
      {activeTab === 'access' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
            {(['Gold', 'Silver', 'Community'] as Tier[]).map(tier => {
              const isActive = currentTier === tier;
              const color = tierColor(tier, T);
              const capabilities: { label: string; gold: boolean; silver: boolean; community: boolean }[] = [
                { label: 'Attendee name & company', gold: true, silver: true, community: true },
                { label: 'Job title', gold: true, silver: true, community: false },
                { label: 'Certifications', gold: true, silver: true, community: false },
                { label: 'Email address', gold: true, silver: false, community: false },
                { label: 'Session attendance count', gold: true, silver: true, community: true },
                { label: 'CSV data export', gold: true, silver: false, community: false },
              ];

              return (
                <Card key={tier} accent={isActive ? color : undefined}>
                  {isActive && (
                    <div style={{ marginBottom: 10 }}>
                      <Pill label="YOUR TIER" color={color} />
                    </div>
                  )}
                  <h3 style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: isActive ? color : T.muted,
                    margin: '0 0 12px',
                    transition: 'color 0.25s',
                  }}>
                    {tier}
                  </h3>
                  {capabilities.map(cap => {
                    const has = tier === 'Gold' ? cap.gold : tier === 'Silver' ? cap.silver : cap.community;
                    return (
                      <div key={cap.label} style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 13,
                        color: has ? (isActive ? color : T.subtle) : T.muted + '66',
                        padding: '3px 0',
                        transition: 'color 0.25s',
                      }}>
                        {has ? '✓' : '—'} {cap.label}
                      </div>
                    );
                  })}
                </Card>
              );
            })}
          </div>

          {/* Prohibited uses */}
          <Card accent={T.amber}>
            <SectionLabel text="Prohibited Uses" color={T.amber} />
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Adding to general marketing lists without direct consent',
                'Sharing or transferring data to any third party',
                'Combining with external data for enrichment',
                'Contacting attendees more than 90 days post-event',
                'Retaining data beyond 12 months',
              ].map(item => (
                <div key={item} style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 13,
                  color: T.red,
                  transition: 'color 0.25s',
                }}>
                  ✗ {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Export modal */}
      {showExportModal && (
        <ExportAcknowledgmentModal
          tier={currentTier}
          attendeeCount={consentedAttendees.length}
          onConfirm={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

function cellStyle(T: ReturnType<typeof useTheme>['T']): React.CSSProperties {
  return {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 13,
    color: T.text,
    padding: '10px 10px',
    borderBottom: `1px solid ${T.border}`,
    transition: 'color 0.25s, border-color 0.25s',
  };
}
