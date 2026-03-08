import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Search, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { exportAnalysisPdf } from '@/lib/pdfExport';

const AnalysisList = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterLeague, setFilterLeague] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('match_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setAnalyses(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from('analysis_tabs').delete().eq('match_analysis_id', id);
    await supabase.from('match_analyses').delete().eq('id', id);
    toast.success(t('analysisDeleted'));
    load();
  };

  const handleExportPdf = async (analysis: any) => {
    const { data: tabsData } = await supabase.from('analysis_tabs').select('*').eq('match_analysis_id', analysis.id);
    const tabLabels: Record<string, string> = {
      aut_karsilama: t('autKarsilama'), on_alan_baskisi: t('onAlanBaskisi'),
      orta_blok_karsilama: t('ortaBlokKarsilama'), derin_blok_karsilama: t('derinBlokKarsilama'),
      aut_baslangici: t('autBaslangici'), geriden_oyun_kurma: t('geridenOyunKurma'),
      corner: t('corner'), free_kick: t('freeKick'), throw_in: t('throwIn'),
    };
    await exportAnalysisPdf(
      analysis, tabsData || [], tabLabels,
      t('target'), t('formation'), t('generalNotes'), t('pros'), t('cons'),
      { defense: t('defense').toUpperCase(), attack: t('attack').toUpperCase(), setPieces: t('setPieces').toUpperCase() },
      lang,
    );
  };

  // Derive filter options from data
  const leagueOptions = useMemo(() => {
    const set = new Set<string>();
    analyses.forEach(a => { if ((a as any).league) set.add((a as any).league); });
    return Array.from(set).sort();
  }, [analyses]);

  const teamOptions = useMemo(() => {
    const set = new Set<string>();
    analyses.forEach(a => { set.add(a.home_team); set.add(a.away_team); });
    return Array.from(set).sort();
  }, [analyses]);

  const yearOptions = useMemo(() => {
    const set = new Set<string>();
    analyses.forEach(a => { if (a.match_date) set.add(a.match_date.substring(0, 4)); });
    return Array.from(set).sort().reverse();
  }, [analyses]);

  const filtered = useMemo(() => {
    return analyses.filter((a) => {
      if (search && !`${a.home_team} ${a.away_team}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterLeague !== 'all' && (a as any).league !== filterLeague) return false;
      if (filterTeam !== 'all' && a.home_team !== filterTeam && a.away_team !== filterTeam) return false;
      if (filterYear !== 'all' && !a.match_date?.startsWith(filterYear)) return false;
      return true;
    });
  }, [analyses, search, filterLeague, filterTeam, filterYear]);

  const getTargetName = (a: any) => {
    if (a.target_team === 'home') return a.home_team;
    if (a.target_team === 'away') return a.away_team;
    return `${a.home_team} & ${a.away_team}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('analysisLibrary')}</h1>
        <Button onClick={() => navigate('/analyses/new')}><Plus className="mr-2 h-4 w-4" />{t('newAnalysis')}</Button>
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('searchAnalyses')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {leagueOptions.length > 0 && (
          <Select value={filterLeague} onValueChange={setFilterLeague}>
            <SelectTrigger className="w-40"><SelectValue placeholder={t('league')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allLeagues')}</SelectItem>
              {leagueOptions.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('team')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTeams')}</SelectItem>
            {teamOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        {yearOptions.length > 0 && (
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-28"><SelectValue placeholder={t('year')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allYears')}</SelectItem>
              {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="space-y-3">
        {filtered.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{a.home_team} vs {a.away_team}</div>
                <div className="text-sm text-muted-foreground">
                  {a.match_date} · {t('target')}: {getTargetName(a)}
                  {(a as any).league && <span className="ml-2">· {(a as any).league}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleExportPdf(a)} title={t('exportPdf')}>
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/analyses/${a.id}/edit`)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">{t('noAnalysesFound')}</p>}
      </div>
    </div>
  );
};

export default AnalysisList;
