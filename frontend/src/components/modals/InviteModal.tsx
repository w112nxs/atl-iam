import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Pill } from '../ui/Pill';
import { api } from '../../api/client';
import type { User } from '../../types';

interface InviteModalProps {
  user: User;
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

type SentInvite = {
  id: string; email: string; name: string; code: string;
  status: string; createdAt: string; acceptedAt: string | null;
};

export function InviteModal({ user, onClose, onToast }: InviteModalProps) {
  const { T } = useTheme();
  const [tab, setTab] = useState<'send' | 'sent'>('send');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [lastInvite, setLastInvite] = useState<{ code: string; inviteUrl: string } | null>(null);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [loadingSent, setLoadingSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tab === 'sent') {
      setLoadingSent(true);
      api.getMyInvites().then(setSentInvites).catch(() => {}).finally(() => setLoadingSent(false));
    }
  }, [tab]);

  const handleSend = async () => {
    if (!email.trim() || !email.includes('@')) {
      onToast('Please enter a valid email', 'error');
      return;
    }
    setSending(true);
    try {
      const res = await api.sendInvite({ email: email.trim(), name: name.trim(), message: message.trim() });
      setLastInvite({ code: res.invite.code, inviteUrl: res.invite.inviteUrl });
      onToast('Invite created!', 'success');
    } catch (err: unknown) {
      onToast((err as Error).message || 'Failed to send invite', 'error');
    }
    setSending(false);
  };

  const handleEmailClient = () => {
    if (!lastInvite) return;
    const subject = encodeURIComponent(`Join the Atlanta IAM Community`);
    const body = encodeURIComponent(
      `Hi${name ? ` ${name}` : ''},\n\n` +
      `${user.name} has invited you to join the Atlanta IAM User Group — a practitioner-first, vendor-neutral community for identity and access management professionals in Atlanta.\n\n` +
      (message ? `"${message}"\n\n` : '') +
      `Join here: ${lastInvite.inviteUrl}\n\n` +
      `Learn more at atlantaiam.com`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
  };

  const handleCopy = async () => {
    if (!lastInvite) return;
    try {
      await navigator.clipboard.writeText(lastInvite.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast('Failed to copy', 'error');
    }
  };

  const handleReset = () => {
    setEmail('');
    setName('');
    setMessage('');
    setLastInvite(null);
    setCopied(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.inputBg,
    color: T.text, fontFamily: "'Inter', sans-serif", fontSize: 13,
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted,
    marginBottom: 4, display: 'block',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.card, borderRadius: 16, border: `1px solid ${T.border}`,
          width: '100%', maxWidth: 480, maxHeight: '85vh', display: 'flex',
          flexDirection: 'column', boxShadow: T.shadow, overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22,
              color: T.text, margin: 0, letterSpacing: '0.04em',
            }}>
              Invite to Atlanta IAM
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted, margin: '2px 0 0' }}>
              Invite a colleague or friend to join the community
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: T.muted, fontSize: 22,
            cursor: 'pointer', fontWeight: 700, lineHeight: 1,
          }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
          {(['send', 'sent'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, background: 'none', border: 'none',
                borderBottom: tab === t ? `2px solid ${T.accent}` : '2px solid transparent',
                color: tab === t ? T.accent : T.muted,
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12,
                letterSpacing: '0.06em', padding: '10px 0', cursor: 'pointer',
                textTransform: 'uppercase', transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {t === 'send' ? 'Send Invite' : `Sent (${sentInvites.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {tab === 'send' && !lastInvite && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Their Name</label>
                <input
                  type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Personal Message (optional)</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Hey, I think you'd enjoy this IAM community..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={sending || !email.trim()}
                style={{
                  background: T.accent, color: '#fff', border: 'none',
                  borderRadius: 8, padding: '12px 0', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
                  letterSpacing: '0.06em', transition: 'background 0.2s',
                  opacity: sending || !email.trim() ? 0.6 : 1,
                }}
              >
                {sending ? 'CREATING INVITE...' : 'CREATE INVITE'}
              </button>
            </div>
          )}

          {tab === 'send' && lastInvite && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
              {/* Success state */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: T.greenDim, border: `2px solid ${T.green}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                </svg>
              </div>

              <div>
                <h3 style={{
                  fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20,
                  color: T.text, margin: '0 0 4px',
                }}>
                  Invite Created!
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, margin: 0 }}>
                  Share the link below with <strong style={{ color: T.text }}>{name || email}</strong>
                </p>
              </div>

              {/* Invite URL */}
              <div style={{
                width: '100%', background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <input
                  readOnly value={lastInvite.inviteUrl}
                  style={{
                    flex: 1, background: 'none', border: 'none', color: T.accent,
                    fontFamily: "'Space Mono', monospace", fontSize: 11, outline: 'none',
                  }}
                />
                <button onClick={handleCopy} style={{
                  background: copied ? T.green : T.accent, color: '#fff', border: 'none',
                  borderRadius: 5, padding: '5px 12px', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.06em', transition: 'background 0.2s', whiteSpace: 'nowrap',
                }}>
                  {copied ? 'COPIED!' : 'COPY'}
                </button>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button onClick={handleEmailClient} style={{
                  flex: 1, background: T.accentDim, border: `1px solid ${T.accent}44`,
                  borderRadius: 8, color: T.accent, padding: '10px 0', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.06em',
                }}>
                  OPEN EMAIL CLIENT
                </button>
                <button onClick={handleReset} style={{
                  flex: 1, background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 8, color: T.text, padding: '10px 0', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.06em',
                }}>
                  INVITE ANOTHER
                </button>
              </div>
            </div>
          )}

          {tab === 'sent' && (
            <div>
              {loadingSent ? (
                <div style={{ textAlign: 'center', padding: 32, color: T.muted, fontFamily: "'Inter', sans-serif" }}>
                  Loading...
                </div>
              ) : sentInvites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted }}>
                    No invites sent yet. Switch to the Send tab to invite someone!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sentInvites.map(inv => (
                    <div
                      key={inv.id}
                      style={{
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderLeft: `3px solid ${inv.status === 'accepted' ? T.green : inv.status === 'expired' ? T.muted : T.accent}`,
                        borderRadius: 8, padding: '10px 14px',
                        transition: 'background 0.2s, border-color 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.text,
                          }}>
                            {inv.name || inv.email}
                          </div>
                          {inv.name && (
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.muted }}>
                              {inv.email}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Pill
                            label={inv.status.toUpperCase()}
                            color={inv.status === 'accepted' ? T.green : inv.status === 'expired' ? T.muted : T.accent}
                            size={9}
                          />
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.muted, marginTop: 4,
                      }}>
                        Sent {new Date(inv.createdAt + 'Z').toLocaleDateString()}
                        {inv.acceptedAt && ` · Accepted ${new Date(inv.acceptedAt + 'Z').toLocaleDateString()}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
