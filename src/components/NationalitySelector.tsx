import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { countries } from '@/data/countries';
import { useLanguage } from '@/contexts/LanguageContext';

interface NationalitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function NationalitySelector({ value, onChange, placeholder }: NationalitySelectorProps) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const displayValue = useMemo(() => {
    if (!value) return '';
    const c = countries.find(c => c.code === value);
    if (!c) return value;
    return `${c.flag} ${lang === 'tr' ? c.nameTR : c.name}`;
  }, [value, lang]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = countries.filter(c => {
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.nameTR.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    });
    return list.slice(0, 20);
  }, [query]);

  const handleSelect = (code: string) => {
    onChange(code);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder || (lang === 'tr' ? 'Milliyet ara...' : 'Search nationality...')}
        value={open ? query : displayValue}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-md">
          {results.map((c) => (
            <button
              key={c.code}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(c.code); }}
            >
              <span>{c.flag}</span>
              <span>{lang === 'tr' ? c.nameTR : c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
