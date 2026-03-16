import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
  accent?: string;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: Section[];
  relatedLinks?: { label: string; note: string; path: string }[];
  onNavigate?: (path: string) => void;
}

export function LegalPageLayout({ title, subtitle, lastUpdated, sections, relatedLinks, onNavigate }: LegalPageLayoutProps) {
  const { T } = useTheme();
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleScroll = useCallback(() => {
    const offset = 120;
    for (const section of sections) {
      const el = sectionRefs.current.get(section.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom > offset) {
          setActiveId(section.id);
          break;
        }
      }
    }
  }, [sections]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    const el = sectionRefs.current.get(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ width: '90%', margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10,
          letterSpacing: '0.26em', textTransform: 'uppercase',
          color: T.accent, marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          Legal
          <span style={{ flex: '0 0 40px', height: 1, background: T.accent, display: 'inline-block' }} />
        </div>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          fontSize: 'clamp(32px, 5vw, 48px)', color: T.text,
          margin: '0 0 6px', letterSpacing: '0.04em',
        }}>
          {title}
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.muted, margin: '0 0 4px' }}>
          {subtitle}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, margin: 0 }}>
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid-sidebar" style={{
        display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start',
      }}>
        {/* Sticky sidebar TOC */}
        <nav style={{
          position: 'sticky', top: 80,
          maxHeight: 'calc(100vh - 100px)', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 0,
          borderRight: `1px solid ${T.border}`, paddingRight: 16,
        }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: T.muted, marginBottom: 10,
          }}>
            On this page
          </div>
          {sections.map((s, i) => {
            const isActive = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  background: 'none', border: 'none', textAlign: 'left',
                  padding: '5px 0 5px 10px', cursor: 'pointer',
                  borderLeft: `2px solid ${isActive ? T.accent : 'transparent'}`,
                  fontFamily: "'Inter', sans-serif", fontSize: 11.5,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? T.text : T.muted,
                  transition: 'all 0.15s',
                  lineHeight: 1.4,
                  marginBottom: i === sections.length - 1 ? 0 : 1,
                }}
              >
                {s.title}
              </button>
            );
          })}

          {relatedLinks && relatedLinks.length > 0 && (
            <>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: T.muted, marginTop: 16, marginBottom: 8,
              }}>
                Related
              </div>
              {relatedLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => onNavigate?.(link.path)}
                  style={{
                    background: 'none', border: 'none', textAlign: 'left',
                    padding: '4px 0 4px 10px', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif", fontSize: 11.5,
                    color: T.accent, lineHeight: 1.4,
                  }}
                >
                  {link.label}
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Main content — two-column grid for sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          alignItems: 'start',
        }}>
          {sections.map(s => (
            <div
              key={s.id}
              ref={el => { if (el) sectionRefs.current.set(s.id, el); }}
              style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: '20px 22px',
                borderLeft: s.accent ? `3px solid ${s.accent}` : undefined,
                gridColumn: s.id === 'contact' ? '1 / -1' : undefined,
                transition: 'background 0.25s, border-color 0.25s',
              }}
            >
              {s.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Shared typography helpers for legal pages */
export function useLegalStyles() {
  const { T } = useTheme();

  const h2: React.CSSProperties = {
    fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20,
    color: T.accent, margin: '0 0 8px', letterSpacing: '0.02em',
  };

  const h3: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14,
    color: T.text, margin: '0 0 4px',
  };

  const p: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: T.subtle,
    lineHeight: 1.7, margin: '0 0 10px',
  };

  const li: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: T.subtle,
    lineHeight: 1.7, marginBottom: 3,
  };

  const ul: React.CSSProperties = {
    margin: '4px 0 10px', paddingLeft: 18,
  };

  const tableCell: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: T.subtle,
    padding: '6px 10px', borderBottom: `1px solid ${T.border}`,
    verticalAlign: 'top',
  };

  const tableCellHeader: React.CSSProperties = {
    ...tableCell, fontWeight: 700, color: T.text, fontSize: 10,
    letterSpacing: '0.06em', textTransform: 'uppercase',
  };

  const strong: React.CSSProperties = { color: T.text };

  return { T, h2, h3, p, li, ul, tableCell, tableCellHeader, strong };
}
