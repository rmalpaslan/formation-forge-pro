import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface CreatableSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  table: 'shared_leagues' | 'shared_teams';
  staticOptions?: string[];
  filterColumn?: string;
  filterValue?: string;
}

export function CreatableSelector({
  value, onChange, placeholder, table, staticOptions = [], filterColumn, filterValue,
}: CreatableSelectorProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [dbOptions, setDbOptions] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      let q = supabase.from(table).select('name');
      if (filterColumn && filterValue) {
        q = q.eq(filterColumn, filterValue);
      }
      const { data } = await q.order('name');
      setDbOptions((data || []).map((r: any) => r.name));
    };
    load();
  }, [table, filterColumn, filterValue]);

  useEffect(() => { setQuery(value); }, [value]);

  const allOptions = useMemo(() => {
    const set = new Set([...staticOptions, ...dbOptions]);
    return Array.from(set).sort();
  }, [staticOptions, dbOptions]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allOptions.slice(0, 20);
    return allOptions.filter(o => o.toLowerCase().includes(q)).slice(0, 20);
  }, [query, allOptions]);

  const handleSelect = (item: string) => {
    setQuery(item);
    onChange(item);
    setOpen(false);
  };

  const handleBlur = async () => {
    setTimeout(() => setOpen(false), 200);
    if (query && query !== value) {
      const trimmed = query.trim();
      if (trimmed) {
        onChange(trimmed);
        // Save new entry to DB if not already there
        if (!allOptions.includes(trimmed)) {
          await supabase.from(table).upsert({ name: trimmed } as any, { onConflict: 'name' });
          setDbOptions(prev => [...prev, trimmed]);
        }
      }
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-md">
          {results.map((item) => (
            <button
              key={item}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
