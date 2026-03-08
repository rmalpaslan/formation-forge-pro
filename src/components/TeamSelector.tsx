import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { leagues, toTitleCase } from '@/data/leaguesAndTeams';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface TeamSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TeamSelector({ value, onChange, placeholder }: TeamSelectorProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const [dbTeams, setDbTeams] = useState<{ name: string; league: string | null }[]>([]);

  useEffect(() => {
    supabase.from('shared_teams').select('name, league').order('name').then(({ data }) => {
      setDbTeams((data || []) as any[]);
    });
  }, []);

  useEffect(() => { setQuery(value); }, [value]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const matched: { name: string; league?: string }[] = [];
    const seen = new Set<string>();

    const addTeam = (name: string, league?: string) => {
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        matched.push({ name, league });
      }
    };

    if (!q) {
      leagues.filter(l => l.favorite).forEach(l => l.teams.forEach(t => addTeam(t, l.name)));
      dbTeams.forEach(t => addTeam(t.name, t.league || undefined));
      return matched.slice(0, 20);
    }

    leagues.forEach(l => l.teams.forEach(team => {
      if (team.toLowerCase().includes(q)) addTeam(team, l.name);
    }));
    dbTeams.forEach(t => {
      if (t.name.toLowerCase().includes(q)) addTeam(t.name, t.league || undefined);
    });

    return matched.slice(0, 20);
  }, [query, dbTeams]);

  const handleSelect = (team: string) => {
    setQuery(team);
    onChange(team);
    setOpen(false);
  };

  const handleBlur = async () => {
    setTimeout(() => setOpen(false), 200);
    if (query && query !== value) {
      const trimmed = toTitleCase(query.trim());
      onChange(trimmed);
      // Save to shared_teams if new
      const allNames = new Set([
        ...leagues.flatMap(l => l.teams.map(t => t.toLowerCase())),
        ...dbTeams.map(t => t.name.toLowerCase()),
      ]);
      if (!allNames.has(trimmed.toLowerCase())) {
        await supabase.from('shared_teams').upsert(
          { name: trimmed } as any,
          { onConflict: 'name,league' }
        );
        setDbTeams(prev => [...prev, { name: trimmed, league: null }]);
      }
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder || t('searchTeam')}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onBlur={handleBlur}
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-md">
          {results.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(item.name); }}
            >
              {item.name}
              {item.league && <span className="text-muted-foreground text-xs ml-2">{item.league}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
