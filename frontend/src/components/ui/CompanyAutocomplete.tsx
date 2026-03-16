import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function CompanyAutocomplete({ value, onChange, style, placeholder }: CompanyAutocompleteProps) {
  const { T } = useTheme();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focused || value.length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await api.searchCompanies(value);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [value, focused]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        style={style}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
        placeholder={placeholder || 'Company name'}
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
          marginTop: 2, maxHeight: 180, overflowY: 'auto',
          boxShadow: T.shadow,
        }}>
          {suggestions.map(s => (
            <div
              key={s}
              onMouseDown={(e) => { e.preventDefault(); onChange(s); setOpen(false); }}
              style={{
                padding: '8px 12px', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.text,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = T.surface; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
