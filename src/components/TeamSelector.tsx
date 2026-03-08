import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { leagues, toTitleCase } from '@/data/leaguesAndTeams';
import { useLanguage } from '@/contexts/LanguageContext';

interface TeamSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TeamSelector({ value, onChange, placeholder }: TeamSelectorProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Show favorite leagues' teams
      return leagues.filter(l => l.favorite).flatMap(l => l.teams).slice(0, 20);
    }
    const matched: string[] = [];
    leagues.forEach(l => {
      l.teams.forEach(team => {
        if (team.toLowerCase().includes(q) && !matched.includes(team)) {
          matched.push(team);
        }
      });
    });
    // Also allow custom input
    return matched.slice(0, 20);
  }, [query]);

  const handleSelect = (team: string) => {
    setQuery(team);
    onChange(team);
    setOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 200);
    if (query && query !== value) {
      onChange(toTitleCase(query));
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder || t('searchTeam')}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-md">
          {results.map((team) => (
            <button
              key={team}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(team); }}
            >
              {team}
              <span className="text-muted-foreground text-xs ml-2">
                {leagues.find(l => l.teams.includes(team))?.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
