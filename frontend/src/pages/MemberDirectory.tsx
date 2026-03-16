import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/client';
import { Avatar } from '../components/ui/Avatar';
import { Pill } from '../components/ui/Pill';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { CompanyAutocomplete } from '../components/ui/CompanyAutocomplete';
import type { MemberProfile, User, ThemeTokens } from '../types';

interface MemberDirectoryProps {
  user?: User;
}

export function MemberDirectory({ user }: MemberDirectoryProps) {
  const { T } = useTheme();
  const isAdmin = user?.role === 'admin';
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'enterprise' | 'vendor'>('');
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [editingMember, setEditingMember] = useState<MemberProfile | null>(null);
  const [toast, setToast] = useState('');

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

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleAdminSave = async (id: string, data: Record<string, string>) => {
    try {
      await api.updateAdminMember(id, data);
      setEditingMember(null);
      setSelectedMember(null);
      search(query, typeFilter);
      flash('Member updated');
    } catch {
      flash('Failed to update');
    }
  };

  const handleAdminDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.deleteAdminMember(id);
      setSelectedMember(null);
      search(query, typeFilter);
      flash('Member deleted');
    } catch {
      flash('Failed to delete');
    }
  };

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

      {toast && (
        <div style={{
          background: T.greenDim, border: `1px solid ${T.green}44`, borderRadius: 8,
          padding: '6px 14px', marginBottom: 12, fontFamily: "'Inter', sans-serif",
          fontSize: 12, color: T.green,
        }}>{toast}</div>
      )}

      {/* Search & Filter */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
      }}>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={isAdmin ? 'Search by name, email, company, or title...' : 'Search by name, company, or title...'}
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
                  <Avatar name={m.name} size={40} role={isAdmin ? m.role as 'admin' | 'member' | undefined : undefined} />
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
                  {isAdmin && m.role && (
                    <Pill label={m.role} color={m.role === 'admin' ? T.red : T.purple} size={9} />
                  )}
                  {isAdmin && m.email && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted, marginTop: 2 }}>
                      {m.email}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && !editingMember && (
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
              <Avatar name={selectedMember.name} size={56} role={isAdmin ? selectedMember.role as 'admin' | 'member' | undefined : undefined} />
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
                  {isAdmin && selectedMember.role && (
                    <Pill label={selectedMember.role} color={selectedMember.role === 'admin' ? T.red : T.purple} size={9} />
                  )}
                </div>
              </div>
            </div>

            <SectionLabel text="Details" color={T.accent} />
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedMember.title && <DetailRow T={T} label="Title" value={selectedMember.title} />}
                {selectedMember.company && <DetailRow T={T} label="Company" value={selectedMember.company} />}
                {selectedMember.email && <DetailRow T={T} label="Email" value={selectedMember.email} link={`mailto:${selectedMember.email}`} />}
                {selectedMember.phone && <DetailRow T={T} label="Phone" value={selectedMember.phone} />}
                {selectedMember.linkedinUrl && <DetailRow T={T} label="LinkedIn" value="View Profile" link={selectedMember.linkedinUrl} />}
                {/* Admin-only fields */}
                {isAdmin && selectedMember.role && <DetailRow T={T} label="Role" value={selectedMember.role} />}
                {isAdmin && <DetailRow T={T} label="Onboarded" value={selectedMember.onboardingComplete ? 'Yes' : 'No'} />}
                {isAdmin && <DetailRow T={T} label="Listed" value={selectedMember.privacyListed ? 'Yes' : 'No'} />}
                {!isAdmin && !selectedMember.title && !selectedMember.company && !selectedMember.email && !selectedMember.phone && !selectedMember.linkedinUrl && (
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted,
                    fontStyle: 'italic', transition: 'color 0.25s',
                  }}>
                    This member has limited their profile visibility.
                  </div>
                )}
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setSelectedMember(null)}
                style={{
                  flex: 1, padding: '10px 0',
                  background: 'transparent', border: `1px solid ${T.border}`,
                  borderRadius: 8, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                  letterSpacing: '0.08em', color: T.muted,
                  transition: 'all 0.25s',
                }}
              >
                CLOSE
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => setEditingMember(selectedMember)}
                    style={{
                      flex: 1, padding: '10px 0',
                      background: T.accent, border: 'none',
                      borderRadius: 8, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                      letterSpacing: '0.08em', color: '#fff',
                    }}
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleAdminDelete(selectedMember.id, selectedMember.name)}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent', border: `1px solid ${T.red}44`,
                      borderRadius: 8, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                      letterSpacing: '0.08em', color: T.red,
                    }}
                  >
                    DELETE
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {editingMember && isAdmin && (
        <DirectoryEditModal
          T={T}
          member={editingMember}
          onSave={handleAdminSave}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}

function DetailRow({ T, label, value, link }: {
  T: ThemeTokens; label: string; value: string; link?: string;
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

function DirectoryEditModal({ T, member, onSave, onClose }: {
  T: ThemeTokens;
  member: MemberProfile;
  onSave: (id: string, data: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    firstName: member.firstName || member.name?.split(' ')[0] || '',
    lastName: member.lastName || member.name?.split(' ').slice(1).join(' ') || '',
    email: member.email || '',
    role: member.role || 'member',
    company: member.company || '',
    title: member.title || '',
    phone: member.phone || '',
    userType: member.userType || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const iStyle: React.CSSProperties = {
    background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 6,
    padding: '8px 10px', fontFamily: "'Inter', sans-serif", fontSize: 13,
    color: T.text, outline: 'none', width: '100%', transition: 'all 0.25s',
  };

  const lStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
    color: T.muted, letterSpacing: '0.08em', display: 'block', marginBottom: 3,
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(member.id, {
      ...form,
      name: `${form.firstName} ${form.lastName}`.trim(),
    });
    setSaving(false);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
        padding: 24, width: 440, maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto',
      }}>
        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 16px' }}>
          Edit Member
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={lStyle}>FIRST NAME</label>
            <input style={iStyle} value={form.firstName} onChange={e => set('firstName', e.target.value)} />
          </div>
          <div>
            <label style={lStyle}>LAST NAME</label>
            <input style={iStyle} value={form.lastName} onChange={e => set('lastName', e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={lStyle}>EMAIL</label>
          <input style={iStyle} value={form.email} onChange={e => set('email', e.target.value)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={lStyle}>COMPANY</label>
          <CompanyAutocomplete style={iStyle} value={form.company} onChange={v => set('company', v)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={lStyle}>TITLE</label>
          <input style={iStyle} value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={lStyle}>PHONE</label>
          <input style={iStyle} value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={lStyle}>ROLE</label>
            <select style={{ ...iStyle, cursor: 'pointer' }} value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="guest">Guest</option>
              <option value="member">Member</option>
              <option value="sponsor">Sponsor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label style={lStyle}>USER TYPE</label>
            <select style={{ ...iStyle, cursor: 'pointer' }} value={form.userType} onChange={e => set('userType', e.target.value)}>
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
            fontSize: 12, fontWeight: 700, color: T.muted,
          }}>CANCEL</button>
          <button onClick={handleSave} disabled={saving} style={{
            background: T.accent, border: 'none', borderRadius: 6,
            padding: '8px 18px', cursor: saving ? 'wait' : 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: '#fff',
          }}>{saving ? 'SAVING...' : 'SAVE'}</button>
        </div>
      </div>
    </div>
  );
}
