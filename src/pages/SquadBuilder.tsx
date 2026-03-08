import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { leagues, getCountryCodes } from '@/data/leaguesAndTeams';
import { toast } from 'sonner';
import { Save, Trash2, Pencil, Plus, FileDown, CheckCircle } from 'lucide-react';
import { exportSquadPdf } from '@/lib/pdfExport';

const formationPositions: Record<string, { label: string; x: number; y: number }[]> = {
  '4-3-3': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CM', x: 30, y: 50 }, { label: 'CM', x: 50, y: 45 }, { label: 'CM', x: 70, y: 50 },
    { label: 'LW', x: 20, y: 25 }, { label: 'ST', x: 50, y: 18 }, { label: 'RW', x: 80, y: 25 },
  ],
  '4-4-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'LM', x: 15, y: 48 }, { label: 'CM', x: 37, y: 50 }, { label: 'CM', x: 63, y: 50 }, { label: 'RM', x: 85, y: 48 },
    { label: 'ST', x: 37, y: 22 }, { label: 'ST', x: 63, y: 22 },
  ],
  '3-5-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'CB', x: 25, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 75, y: 72 },
    { label: 'LWB', x: 10, y: 50 }, { label: 'CM', x: 35, y: 52 }, { label: 'CDM', x: 50, y: 56 }, { label: 'CM', x: 65, y: 52 }, { label: 'RWB', x: 90, y: 50 },
    { label: 'ST', x: 37, y: 22 }, { label: 'ST', x: 63, y: 22 },
  ],
  '4-2-3-1': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CDM', x: 37, y: 55 }, { label: 'CDM', x: 63, y: 55 },
    { label: 'LW', x: 20, y: 38 }, { label: 'CAM', x: 50, y: 35 }, { label: 'RW', x: 80, y: 38 },
    { label: 'ST', x: 50, y: 18 },
  ],
};

interface Squad {
  id: string;
  name: string;
  formation: string;
  positions: Record<string, string> | null;
  created_at: string;
}

const SquadBuilder = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [formation, setFormation] = useState('4-3-3');
  const [squadName, setSquadName] = useState('');
  const [assignments, setAssignments] = useState<Record<number, { id: string; name: string }>>({});
  const [players, setPlayers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSquads, setSavedSquads] = useState<Squad[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewSquad, setViewSquad] = useState<Squad | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const [filterMode, setFilterMode] = useState<'mixed' | 'country' | 'league'>('mixed');
  const [filterCountry, setFilterCountry] = useState('TR');
  const [filterLeague, setFilterLeague] = useState('');

  const loadSquads = async () => {
    if (!user) return;
    const { data } = await supabase.from('squads').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setSavedSquads((data as Squad[]) || []);
  };

  useEffect(() => {
    if (!user) return;
    supabase.from('players').select('*').eq('user_id', user.id).then(({ data }) => setPlayers(data || []));
    loadSquads();
  }, [user]);

  const filteredPlayers = useMemo(() => {
    if (filterMode === 'mixed') return players;
    const leagueTeams = new Set<string>();
    leagues.forEach(l => {
      if (filterMode === 'country' && l.countryCode === filterCountry) l.teams.forEach(t => leagueTeams.add(t.toLowerCase()));
      if (filterMode === 'league' && l.name === filterLeague) l.teams.forEach(t => leagueTeams.add(t.toLowerCase()));
    });
    return players.filter(p => p.current_team && leagueTeams.has(p.current_team.toLowerCase()));
  }, [players, filterMode, filterCountry, filterLeague]);

  const positions = formationPositions[formation] || formationPositions['4-3-3'];

  const openPlayerModal = (idx: number) => { setSelectedIdx(idx); setModalOpen(true); };

  const assignPlayer = (player: any) => {
    if (selectedIdx !== null) setAssignments((prev) => ({ ...prev, [selectedIdx]: { id: player.id, name: player.name } }));
    setModalOpen(false);
  };

  const doSave = async (): Promise<boolean> => {
    if (!squadName) { toast.error(t('enterSquadName')); return false; }
    setSaving(true);
    const positionsData: Record<string, string> = {};
    Object.entries(assignments).forEach(([idx, p]) => { positionsData[idx] = p.id; });

    if (editingId) {
      const { error } = await supabase.from('squads').update({ name: squadName, formation, positions: positionsData }).eq('id', editingId);
      setSaving(false);
      if (error) { toast.error(error.message); return false; }
      toast.success(t('squadUpdated'));
      loadSquads();
      return true;
    } else {
      const { error } = await supabase.from('squads').insert({ name: squadName, formation, positions: positionsData, user_id: user!.id });
      setSaving(false);
      if (error) { toast.error(error.message); return false; }
      toast.success(t('squadSaved'));
      loadSquads();
      return true;
    }
  };

  const handleDraftSave = async () => {
    await doSave();
  };

  const handleSaveAndClose = async () => {
    const ok = await doSave();
    if (ok) {
      setShowEditor(false);
      setEditingId(null);
      setSquadName('');
      setAssignments({});
    }
  };

  const handleEdit = (squad: Squad) => {
    setEditingId(squad.id);
    setSquadName(squad.name);
    setFormation(squad.formation);
    const newAssignments: Record<number, { id: string; name: string }> = {};
    if (squad.positions) {
      for (const [idx, playerId] of Object.entries(squad.positions)) {
        const player = players.find((p) => p.id === playerId);
        if (player) newAssignments[Number(idx)] = { id: player.id, name: player.name };
      }
    }
    setAssignments(newAssignments);
    setShowEditor(true);
    setViewSquad(null);
  };

  const handleDelete = async (squadId: string) => {
    const { error } = await supabase.from('squads').delete().eq('id', squadId);
    if (error) toast.error(error.message);
    else { toast.success(t('squadDeleted')); loadSquads(); }
    if (editingId === squadId) { setEditingId(null); setSquadName(''); setAssignments({}); setShowEditor(false); }
    if (viewSquad?.id === squadId) setViewSquad(null);
  };

  const handleNewSquad = () => {
    setEditingId(null);
    setSquadName('');
    setFormation('4-3-3');
    setAssignments({});
    setShowEditor(true);
  };

  const handleExportPdf = async (squad: Squad) => {
    const playerNames: Record<number, string> = {};
    if (squad.positions) {
      for (const [idx, playerId] of Object.entries(squad.positions)) {
        const player = players.find((p) => p.id === playerId);
        if (player) playerNames[Number(idx)] = player.name;
      }
    }
    await exportSquadPdf({ name: squad.name, formation: squad.formation, playerNames }, lang);
    toast.success(t('exportPdf'));
  };

  const getViewAssignments = (squad: Squad) => {
    const result: Record<number, string> = {};
    if (squad.positions) {
      for (const [idx, playerId] of Object.entries(squad.positions)) {
        const player = players.find((p) => p.id === playerId);
        if (player) result[Number(idx)] = player.name;
      }
    }
    return result;
  };

  const renderPitch = (formationKey: string, assignMap: Record<number, string>, interactive: boolean = false) => {
    const pos = formationPositions[formationKey] || formationPositions['4-3-3'];
    return (
      <div className="relative w-full max-w-full aspect-[68/105] rounded-lg border-2 border-primary bg-primary/20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-primary/40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[44%] h-[17%] border border-primary/30 border-t-0" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[44%] h-[17%] border border-primary/30 border-b-0" />
        </div>
        {pos.map((p, idx) => (
          interactive ? (
            <button key={idx} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group" style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={() => openPlayerModal(idx)}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary-foreground group-hover:scale-110 transition-transform">{p.label}</div>
              <span className="text-[9px] sm:text-[10px] text-foreground font-medium truncate max-w-[50px] sm:max-w-[60px]">{assignments[idx]?.name || '—'}</span>
            </button>
          ) : (
            <div key={idx} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary-foreground">{p.label}</div>
              <span className="text-[9px] sm:text-[10px] text-foreground font-medium truncate max-w-[50px] sm:max-w-[60px]">{assignMap[idx] || '—'}</span>
            </div>
          )
        ))}
      </div>
    );
  };

  // Squad List View
  if (!showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('squadBuilder')}</h1>
          <Button onClick={handleNewSquad}><Plus className="mr-2 h-4 w-4" />{t('addSquad')}</Button>
        </div>
        <div className="space-y-3">
          {savedSquads.map((squad) => (
            <Card key={squad.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setViewSquad(squad)}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <span className="font-bold">{squad.name}</span>
                  <span className="text-muted-foreground text-sm ml-3">{squad.formation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleExportPdf(squad); }} title={t('exportPdf')}>
                    <FileDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(squad); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(squad.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {savedSquads.length === 0 && <p className="text-muted-foreground text-center py-8">{t('noSquadsFound')}</p>}
        </div>

        <Dialog open={!!viewSquad} onOpenChange={(open) => !open && setViewSquad(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{viewSquad?.name} — {viewSquad?.formation}</DialogTitle>
            </DialogHeader>
            {viewSquad && renderPitch(viewSquad.formation, getViewAssignments(viewSquad))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => viewSquad && handleExportPdf(viewSquad)}>
                <FileDown className="mr-2 h-4 w-4" />{t('exportPdf')}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => viewSquad && handleEdit(viewSquad)}>
                <Pencil className="mr-2 h-4 w-4" />{t('edit')}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => viewSquad && handleDelete(viewSquad.id)}>
                <Trash2 className="mr-2 h-4 w-4" />{t('delete')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Editor View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { setShowEditor(false); setEditingId(null); }}>← {t('savedSquads')}</Button>
          <h1 className="text-2xl font-bold">{editingId ? squadName : t('addSquad')}</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Input placeholder={t('squadName')} value={squadName} onChange={(e) => setSquadName(e.target.value)} className="w-48" />
          <Select value={formation} onValueChange={(v) => { setFormation(v); setAssignments({}); }}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(formationPositions).map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleDraftSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />{saving ? t('saving') : t('draftSave')}
          </Button>
          <Button onClick={handleSaveAndClose} disabled={saving}>
            <CheckCircle className="mr-2 h-4 w-4" />{t('finishAnalysis')}
          </Button>
        </div>
      </div>

      {/* Filter options */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">{t('filterBy')}:</span>
        <Select value={filterMode} onValueChange={(v) => setFilterMode(v as any)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mixed">{t('mixed')}</SelectItem>
            <SelectItem value="country">{t('country')}</SelectItem>
            <SelectItem value="league">{t('league')}</SelectItem>
          </SelectContent>
        </Select>
        {filterMode === 'country' && (
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {getCountryCodes().map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {filterMode === 'league' && (
          <Select value={filterLeague} onValueChange={setFilterLeague}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {leagues.map(l => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        {renderPitch(formation, {}, true)}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('selectPlayer')}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-64 overflow-auto">
            {filteredPlayers.length === 0 && <p className="text-muted-foreground text-sm">{t('noPlayersInLibrary')}</p>}
            {filteredPlayers.map((p) => (
              <button key={p.id} className="w-full text-left px-3 py-2 rounded hover:bg-secondary transition-colors" onClick={() => assignPlayer(p)}>
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground text-sm ml-2">{p.current_team} · {p.primary_position}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SquadBuilder;
