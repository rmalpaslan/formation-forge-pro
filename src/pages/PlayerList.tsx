import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePosition } from '@/lib/positionMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayerRadarChart } from '@/components/RadarChart';
import { Trash2, Edit, Plus, Search, ExternalLink, FileDown, Video, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { exportPlayerPdf } from '@/lib/pdfExport';

const footLabelTR: Record<string, string> = { Right: 'Sağ', Left: 'Sol', Both: 'Her İkisi' };

function localizeFoot(foot: string | null | undefined, lang: string): string {
  if (!foot) return '—';
  if (lang === 'tr') return footLabelTR[foot] || foot;
  return foot;
}

function formatDateDDMMYYYY(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
  } catch { return dateStr; }
}

const PlayerList = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [viewPlayer, setViewPlayer] = useState<any>(null);
  const [filterLeague, setFilterLeague] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [analystName, setAnalystName] = useState('');
  const [darkPdf, setDarkPdf] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('players').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setPlayers(data || []);
  };

  useEffect(() => {
    load();
    if (user) {
      supabase.from('profiles').select('first_name, last_name').eq('user_id', user.id).single().then(({ data }) => {
        if (data) setAnalystName([data.first_name, data.last_name].filter(Boolean).join(' '));
      });
    }
  }, [user]);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await supabase.from('players').delete().eq('id', id);
    toast.success(t('playerDeleted'));
    if (viewPlayer?.id === id) setViewPlayer(null);
    load();
  };

  const handleExportPdf = async (player: any, e?: React.MouseEvent, dark = false) => {
    e?.stopPropagation();
    await exportPlayerPdf(player, {
      currentTeam: t('currentTeam'),
      league: t('league'),
      primaryPosition: t('primaryPosition'),
      secondaryPosition: t('secondaryPosition'),
      preferredFoot: t('preferredFoot'),
      birthDate: t('birthDate'),
      technical: t('technical' as any),
      tactical: t('tactical' as any),
      physical: t('physical' as any),
      mental: t('mental' as any),
      tacticalIQ: t('tacticalIQ' as any),
      currentAbility: t('currentAbility' as any),
      potentialAbility: t('potentialAbility' as any),
      skillRatings: t('skillRatings' as any),
      keyTraits: t('keyTraits' as any),
      scoutNote: t('scoutNote' as any),
      playerRole: t('playerRole' as any),
      squadFit: t('squadFit' as any),
      squadFitPercentage: t('squadFitPercentage' as any),
      watchVideo: t('watchVideo' as any),
      marketValue: t('marketValue' as any),
      resalePotential: t('resalePotential' as any),
      injuryHistory: t('injuryHistory' as any),
      financialInfo: t('financialInfo' as any),
      radarChart: t('radarChart' as any),
    }, lang, analystName || undefined, dark);
    toast.success(t('exportPdf'));
  };

  const leagueOptions = useMemo(() => {
    const set = new Set<string>();
    players.forEach(p => { if ((p as any).league) set.add((p as any).league); });
    return Array.from(set).sort();
  }, [players]);

  const teamOptions = useMemo(() => {
    const set = new Set<string>();
    players.forEach(p => { if (p.current_team) set.add(p.current_team); });
    return Array.from(set).sort();
  }, [players]);

  const yearOptions = useMemo(() => {
    const set = new Set<string>();
    players.forEach(p => { if (p.created_at) set.add(p.created_at.substring(0, 4)); });
    return Array.from(set).sort().reverse();
  }, [players]);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (search && !`${p.name} ${p.current_team}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterLeague !== 'all' && (p as any).league !== filterLeague) return false;
      if (filterTeam !== 'all' && p.current_team !== filterTeam) return false;
      if (filterYear !== 'all' && !p.created_at?.startsWith(filterYear)) return false;
      return true;
    });
  }, [players, search, filterLeague, filterTeam, filterYear]);

  const traitLabel = (trait: string) => {
    try { return t(trait as any); } catch { return trait; }
  };

  const getRadarData = (p: any) => [
    { label: t('technical' as any), value: p.technical_rating || 0 },
    { label: t('tactical' as any), value: p.tactical_rating || 0 },
    { label: t('physical' as any), value: p.physical_rating || 0 },
    { label: t('mental' as any), value: p.mental_rating || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('playerLibrary')}</h1>
        <Button onClick={() => navigate('/players/new')}><Plus className="mr-2 h-4 w-4" />{t('addPlayer')}</Button>
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('searchPlayers')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
        {teamOptions.length > 0 && (
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="w-40"><SelectValue placeholder={t('team')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTeams')}</SelectItem>
              {teamOptions.map(tm => <SelectItem key={tm} value={tm}>{tm}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
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
        {filtered.map((p) => (
          <Card key={p.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setViewPlayer(p)}>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex flex-col min-w-0 flex-1 mr-4">
                <div className="font-bold text-base truncate">{p.name}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {p.current_team} · {localizePosition(p.primary_position, lang)} · {localizeFoot(p.preferred_foot, lang)}
                  {(p as any).player_role && <span className="ml-1">· {(p as any).player_role}</span>}
                  {(p as any).league && <span className="ml-1">· {(p as any).league}</span>}
                </div>
                {(p as any).key_traits?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(p as any).key_traits.map((tr: string) => (
                      <Badge key={tr} variant="secondary" className="text-[10px] px-1.5 py-0">{traitLabel(tr)}</Badge>
                    ))}
                  </div>
                )}
                <span className="text-muted-foreground text-xs mt-1">
                  {lang === 'tr' ? 'Son Güncelleme' : 'Last Updated'}: {formatDateDDMMYYYY(p.updated_at || p.created_at)}
                </span>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <Button variant="ghost" size="icon" onClick={(e) => handleExportPdf(p, e)} title={t('exportPlayerPdf')}>
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/players/${p.id}/edit`); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => handleDelete(p.id, e)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">{t('noPlayersFound')}</p>}
      </div>

      {/* Player Detail Modal */}
      <Dialog open={!!viewPlayer} onOpenChange={(open) => !open && setViewPlayer(null)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle className="text-xl font-bold pr-10 truncate">{viewPlayer?.name}</DialogTitle>
          </DialogHeader>
          {viewPlayer && (
            <div className="rounded-lg bg-background border border-border mx-2 mb-2 p-8">
              {/* Key Traits Badges */}
              {(viewPlayer as any).key_traits?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {(viewPlayer as any).key_traits.map((tr: string) => (
                    <Badge key={tr} className="bg-primary text-primary-foreground text-xs px-3 py-1">{traitLabel(tr)}</Badge>
                  ))}
                </div>
              )}

              {/* Info Grid */}
              <div className="space-y-0">
                <InfoRow label={t('currentTeam')} value={viewPlayer.current_team} />
                <InfoRow label={t('league')} value={(viewPlayer as any).league || '—'} />
                <InfoRow label={t('primaryPosition')} value={localizePosition(viewPlayer.primary_position, lang)} />
                {(viewPlayer as any).player_role && <InfoRow label={t('playerRole' as any)} value={(viewPlayer as any).player_role} />}
                <InfoRow label={t('secondaryPosition')} value={viewPlayer.secondary_position ? localizePosition(viewPlayer.secondary_position, lang) : t('none')} />
                <InfoRow label={t('preferredFoot')} value={localizeFoot(viewPlayer.preferred_foot, lang)} />
                <InfoRow label={t('birthDate')} value={viewPlayer.birth_date ? formatDateDDMMYYYY(viewPlayer.birth_date) : '—'} />
                {(viewPlayer as any).market_value && <InfoRow label={t('marketValue' as any)} value={(viewPlayer as any).market_value} />}
              </div>

              {/* Radar Chart */}
              <div className="mt-5">
                <h4 className="text-sm font-bold text-foreground mb-2">{t('radarChart' as any)}</h4>
                <PlayerRadarChart data={getRadarData(viewPlayer)} />
              </div>

              {/* Skill Ratings */}
              {(() => {
                const allRatings = [
                  { label: t('technical' as any), value: (viewPlayer as any).technical_rating || 0 },
                  { label: t('tactical' as any), value: (viewPlayer as any).tactical_rating || 0 },
                  { label: t('physical' as any), value: (viewPlayer as any).physical_rating || 0 },
                  { label: t('mental' as any), value: (viewPlayer as any).mental_rating || 0 },
                  { label: t('tacticalIQ' as any), value: (viewPlayer as any).tactical_iq_rating || 0 },
                  { label: t('currentAbility' as any), value: (viewPlayer as any).current_ability || 0 },
                  { label: t('potentialAbility' as any), value: (viewPlayer as any).contract_status || 0 },
                  { label: t('resalePotential' as any), value: (viewPlayer as any).resale_potential || 0 },
                ];
                const hasAny = allRatings.some(r => r.value > 0);
                if (!hasAny) return null;
                return (
                  <div className="mt-5 space-y-3">
                    <h4 className="text-sm font-bold text-foreground">{t('skillRatings' as any)}</h4>
                    {allRatings.filter(r => r.value > 0).map(r => (
                      <RatingBar key={r.label} label={r.label} value={r.value} />
                    ))}
                  </div>
                );
              })()}

              {/* Squad Fit */}
              {((viewPlayer as any).squad_fit_percentage > 0 || (viewPlayer as any).squad_fit_notes) && (
                <div className="mt-5 space-y-2">
                  <h4 className="text-sm font-bold text-foreground">{t('squadFit' as any)}</h4>
                  {(viewPlayer as any).squad_fit_percentage > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('squadFitPercentage' as any)}</span>
                        <span className="font-bold text-primary">%{(viewPlayer as any).squad_fit_percentage}</span>
                      </div>
                      <Progress value={(viewPlayer as any).squad_fit_percentage} className="h-2" />
                    </div>
                  )}
                  {(viewPlayer as any).squad_fit_notes && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(viewPlayer as any).squad_fit_notes}</p>
                  )}
                </div>
              )}

              {/* Injury History */}
              {(viewPlayer as any).injury_history && (
                <div className="mt-5 space-y-2">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    {t('injuryHistory' as any)}
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(viewPlayer as any).injury_history}</p>
                </div>
              )}

              {/* Scout Note */}
              {(viewPlayer as any).scout_note && (
                <div className="mt-5 space-y-2">
                  <h4 className="text-sm font-bold text-foreground">{t('scoutNote' as any)}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(viewPlayer as any).scout_note}</p>
                </div>
              )}

              {/* Video Link */}
              {(viewPlayer as any).video_link && (
                <a
                  href={(viewPlayer as any).video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Video className="h-4 w-4" /> {t('watchVideo' as any)}
                </a>
              )}

              {viewPlayer.transfermarkt_link && (
                <div className="flex items-baseline py-2.5 mt-3">
                  <span className="text-sm text-muted-foreground font-bold shrink-0" style={{ width: '140px', whiteSpace: 'nowrap' }}>Transfermarkt</span>
                  <a href={viewPlayer.transfermarkt_link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm inline-flex items-center gap-1 hover:underline truncate">
                    {t('viewDetails')} <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}
              <div className="flex gap-2 pt-5 flex-wrap">
                <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => handleExportPdf(viewPlayer, undefined, false)}>
                  <FileDown className="mr-2 h-4 w-4" />{t('lightPdf' as any)}
                </Button>
                <Button variant="outline" className="flex-1 min-w-[120px] bg-foreground text-background hover:bg-foreground/90" onClick={() => handleExportPdf(viewPlayer, undefined, true)}>
                  <FileDown className="mr-2 h-4 w-4" />{t('darkModePdf' as any)}
                </Button>
                <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => { setViewPlayer(null); navigate(`/players/${viewPlayer.id}/edit`); }}>
                  <Edit className="mr-2 h-4 w-4" />{t('edit')}
                </Button>
                <Button variant="destructive" className="flex-1 min-w-[120px]" onClick={() => handleDelete(viewPlayer.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />{t('delete')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid gap-3 border-b border-border/50 last:border-0" style={{ gridTemplateColumns: '140px 1fr', padding: '12px 0' }}>
      <span className="text-sm text-muted-foreground font-bold whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 }}>{value || '—'}</span>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-primary">{value}/5</span>
      </div>
      <Progress value={(value / 5) * 100} className="h-2" />
    </div>
  );
}

export default PlayerList;
