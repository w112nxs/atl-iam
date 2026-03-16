import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/client';
import { Avatar } from '../components/ui/Avatar';
import { Pill } from '../components/ui/Pill';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import type { MemberProfile } from '../types';

export function MemberDirectory() {
  const { T } = useTheme();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'enterprise' | 'vendor'>('');
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);

  const search = useCallback(async (q: string, type: string) => {
    setLoading(true);
    try {
      const result = await api.searchMembers({ q, type, limit: 50 });
      setMembers(result.members);
      setTotal(result.total);
    } catch {
      setMembers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query, typeFilter), 300);
    return () => clearTimeout(timer);
  }, [query, typeFilter, search]);

  const inputStyle = {
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: T.text,
    outline: 'none',
    transition: 'border-color 0.25s, background 0.25s, color 0.25s',
    minWidth: 0,
  };

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32,
        color: T.text, margin: '0 0 6px', transition: 'color 0.25s',
      }}>
        Member Directory
      </h1>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.muted,
        margin: '0 0 24px', transition: 'color 0.25s',
      }}>
        Connect with {total} Atlanta IAM community members
      </p>

      {/* Search & Filter */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
      }}>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, company, or title..."
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { value: '', label: 'All' },
            { value: 'enterprise', label: 'Enterprise' },
            { value: 'vendor', label: 'Vendor' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value as '' | 'enterprise' | 'vendor')}
              style={{
                background: typeFilter === f.value ? T.accentDim : 'transparent',
                border: `1px solid ${typeFilter === f.value ? T.accent : T.border}`,
                borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12,
                color: typeFilter === f.value ? T.accent : T.muted,
                letterSpacing: '0.04em',
                transition: 'all 0.25s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center', padding: 40,
          fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.muted,
        }}>
          Loading members...
        </div>
      ) : members.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 40,
          fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.muted,
        }}>
          {query ? 'No members match your search' : 'No members found'}
        </div>
      ) : (
        <div className="grid-3col" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        }}>
          {members.map(m => (
            <div key={m.id} onClick={() => setSelectedMember(m)} style={{ cursor: 'pointer' }}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={m.name} size={40} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14,
                      color: T.text, transition: 'color 0.25s',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {m.name}
                    </div>
                    {m.company && (
                      <div style={{
                        fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted,
                        transition: 'color 0.25s',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.company}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  {m.title && <Pill label={m.title} color={T.subtle} size={9} />}
                  {m.userType && (
                    <Pill
                      label={m.userType}
                      color={m.userType === 'enterprise' ? T.accent : T.gold}
                      size={9}
                    />
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div
          onClick={() => setSelectedMember(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
              padding: 'clamp(20px, 5vw, 28px)', width: 400, maxWidth: '92vw',
              transition: 'background 0.25s, border-color 0.25s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Avatar name={selectedMember.name} size={56} />
              <div>
                <h2 style={{
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20,
                  color: T.text, margin: 0, transition: 'color 0.25s',
                }}>
                  {selectedMember.name}
                </h2>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {selectedMember.userType && (
                    <Pill
                      label={selectedMember.userType}
                      color={selectedMember.userType === 'enterprise' ? T.accent : T.gold}
                      size={9}
                    />
                  )}
                </div>
              </div>
            </div>

            <SectionLabel text="Details" color={T.accent} />
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedMember.title && (
                  <DetailRow T={T} label="Title" value={selectedMember.title} />
                )}
                {selectedMember.company && (
                  <DetailRow T={T} label="Company" value={selectedMember.company} />
                )}
                {selectedMember.email && (
                  <DetailRow T={T} label="Email" value={selectedMember.email} link={`mailto:${selectedMember.email}`} />
                )}
                {selectedMember.phone && (
                  <DetailRow T={T} label="Phone" value={selectedMember.phone} />
                )}
                {selectedMember.linkedinUrl && (
                  <DetailRow T={T} label="LinkedIn" value="View Profile" link={selectedMember.linkedinUrl} />
                )}
                {!selectedMember.title && !selectedMember.company && !selectedMember.email && !selectedMember.phone && !selectedMember.linkedinUrl && (
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted,
                    fontStyle: 'italic', transition: 'color 0.25s',
                  }}>
                    This member has limited their profile visibility.
                  </div>
                )}
              </div>
            </Card>

            <button
              onClick={() => setSelectedMember(null)}
              style={{
                width: '100%', marginTop: 16, padding: '10px 0',
                background: 'transparent', border: `1px solid ${T.border}`,
                borderRadius: 8, cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                letterSpacing: '0.08em', color: T.muted,
                transition: 'all 0.25s',
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ T, label, value, link }: {
  T: import('../types').ThemeTokens; label: string; value: string; link?: string;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      paddingTop: 6, borderTop: `1px solid ${T.border}`,
      transition: 'border-color 0.25s',
    }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, transition: 'color 0.25s' }}>
        {label}
      </span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: T.accent,
            textDecoration: 'none', transition: 'color 0.25s',
          }}
        >
          {value}
        </a>
      ) : (
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: T.text, transition: 'color 0.25s' }}>
          {value}
        </span>
      )}
    </div>
  );
}
