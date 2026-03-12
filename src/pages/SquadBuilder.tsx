import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePosition, localizePositionAbbr } from '@/lib/positionMap';
import { leagues, getCountryCodes } from '@/data/leaguesAndTeams';
import { ExportModal } from '@/components/ExportModal';
import { countries } from '@/data/countries';
import { toast } from 'sonner';
import { Save, Trash2, Pencil, Plus, FileDown, CheckCircle } from 'lucide-react';
import { exportSquadPdf } from '@/lib/pdfExport';

const formationPositions: Record<string, { label: string; x: number; y: number }[]> = {
  '3-4-3': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'CB', x: 25, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 75, y: 72 },
    { label: 'LM', x: 15, y: 50 }, { label: 'CM', x: 37, y: 52 }, { label: 'CM', x: 63, y: 52 }, { label: 'RM', x: 85, y: 50 },
    { label: 'LW', x: 20, y: 25 }, { label: 'ST', x: 50, y: 18 }, { label: 'RW', x: 80, y: 25 },
  ],
  '3-5-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'CB', x: 25, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 75, y: 72 },
    { label: 'LWB', x: 10, y: 50 }, { label: 'CM', x: 35, y: 52 }, { label: 'CDM', x: 50, y: 56 }, { label: 'CM', x: 65, y: 52 }, { label: 'RWB', x: 90, y: 50 },
    { label: 'ST', x: 37, y: 22 }, { label: 'ST', x: 63, y: 22 },
  ],
  '3-4-1-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'CB', x: 25, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 75, y: 72 },
    { label: 'LM', x: 15, y: 52 }, { label: 'CM', x: 37, y: 52 }, { label: 'CM', x: 63, y: 52 }, { label: 'RM', x: 85, y: 52 },
    { label: 'CAM', x: 50, y: 35 },
    { label: 'ST', x: 37, y: 20 }, { label: 'ST', x: 63, y: 20 },
  ],
  '3-1-4-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'CB', x: 25, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 75, y: 72 },
    { label: 'CDM', x: 50, y: 58 },
    { label: 'LM', x: 15, y: 45 }, { label: 'CM', x: 37, y: 45 }, { label: 'CM', x: 63, y: 45 }, { label: 'RM', x: 85, y: 45 },
    { label: 'ST', x: 37, y: 22 }, { label: 'ST', x: 63, y: 22 },
  ],
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
  '4-2-3-1': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CDM', x: 37, y: 55 }, { label: 'CDM', x: 63, y: 55 },
    { label: 'LW', x: 20, y: 38 }, { label: 'CAM', x: 50, y: 35 }, { label: 'RW', x: 80, y: 38 },
    { label: 'ST', x: 50, y: 18 },
  ],
  '4-1-4-1': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CDM', x: 50, y: 56 },
    { label: 'LM', x: 15, y: 40 }, { label: 'CM', x: 37, y: 42 }, { label: 'CM', x: 63, y: 42 }, { label: 'RM', x: 85, y: 40 },
    { label: 'ST', x: 50, y: 18 },
  ],
  '4-3-1-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CM', x: 30, y: 52 }, { label: 'CM', x: 50, y: 50 }, { label: 'CM', x: 70, y: 52 },
    { label: 'CAM', x: 50, y: 35 },
    { label: 'ST', x: 37, y: 20 }, { label: 'ST', x: 63, y: 20 },
  ],
  '4-3-2-1': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CM', x: 30, y: 52 }, { label: 'CM', x: 50, y: 50 }, { label: 'CM', x: 70, y: 52 },
    { label: 'LW', x: 30, y: 32 }, { label: 'RW', x: 70, y: 32 },
    { label: 'ST', x: 50, y: 18 },
  ],
  '5-3-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LWB', x: 10, y: 68 }, { label: 'CB', x: 30, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 70, y: 72 }, { label: 'RWB', x: 90, y: 68 },
    { label: 'CM', x: 30, y: 48 }, { label: 'CM', x: 50, y: 45 }, { label: 'CM', x: 70, y: 48 },
    { label: 'ST', x: 37, y: 22 }, { label: 'ST', x: 63, y: 22 },
  ],
  '5-4-1': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LWB', x: 10, y: 68 }, { label: 'CB', x: 30, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 70, y: 72 }, { label: 'RWB', x: 90, y: 68 },
    { label: 'LM', x: 15, y: 45 }, { label: 'CM', x: 37, y: 47 }, { label: 'CM', x: 63, y: 47 }, { label: 'RM', x: 85, y: 45 },
    { label: 'ST', x: 50, y: 20 },
  ],
  '5-2-1-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LWB', x: 10, y: 68 }, { label: 'CB', x: 30, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 70, y: 72 }, { label: 'RWB', x: 90, y: 68 },
    { label: 'CM', x: 37, y: 50 }, { label: 'CM', x: 63, y: 50 },
    { label: 'CAM', x: 50, y: 35 },
    { label: 'ST', x: 37, y: 20 }, { label: 'ST', x: 63, y: 20 },
  ],
};

interface Squad {
  id: string;
  name: string;
  formation: string;
  positions: Record<string, string> | null;
  created_at: string;
  updated_at: string;
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
  const [exportSquadData, setExportSquadData] = useState<Squad | null>(null);

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [customOffsets, setCustomOffsets] = useState<Record<number, { x: number; y: number }>>({});
  const pitchRef = useRef<HTMLDivElement>(null);

  const [filterMode, setFilterMode] = useState<'mixed' | 'country' | 'league'>('mixed');
  const [filterCountry, setFilterCountry] = useState('TR');
  const [filterLeague, setFilterLeague] = useState('');
  const [analystName, setAnalystName] = useState('');

  const loadSquads = async () => {
    if (!user) return;
    const { data } = await supabase.from('squads').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setSavedSquads((data as Squad[]) || []);
  };

  useEffect(() => {
    if (!user) return;
    supabase.from('players').select('*').eq('user_id', user.id).then(({ data }) => setPlayers(data || []));
    supabase.from('profiles').select('first_name, last_name').eq('user_id', user.id).single().then(({ data }) => {
      if (data) setAnalystName([data.first_name, data.last_name].filter(Boolean).join(' '));
    });
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
    if (selectedIdx !== null) {
      setAssignments((prev) => {
        const updated = { ...prev };
        for (const [key, val] of Object.entries(updated)) {
          if (val.id === player.id) delete updated[Number(key)];
        }
        updated[selectedIdx] = { id: player.id, name: player.name };
        return updated;
      });
    }
    setModalOpen(false);
  };

  // Drag handlers
  const handlePointerDown = useCallback((idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    setDragIdx(idx);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragIdx === null || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setCustomOffsets(prev => ({ ...prev, [dragIdx]: { x: xPct, y: yPct } }));
  }, [dragIdx]);

  const handlePointerUp = useCallback(() => {
    setDragIdx(null);
  }, []);

  const doSave = async (): Promise<boolean> => {
    if (!squadName) { toast.error(t('enterSquadName')); return false; }
    setSaving(true);
    const positionsData: Record<string, string> = {};
    Object.entries(assignments).forEach(([idx, p]) => { positionsData[idx] = p.id; });

    const saveData = {
      name: squadName,
      formation,
      positions: { ...positionsData, _offsets: customOffsets } as any,
    };

    if (editingId) {
      const { error } = await supabase.from('squads').update(saveData).eq('id', editingId);
      setSaving(false);
      if (error) { toast.error(error.message); return false; }
      toast.success(t('squadUpdated'));
      loadSquads();
      return true;
    } else {
      const { error } = await supabase.from('squads').insert({ ...saveData, user_id: user!.id });
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
      setCustomOffsets({});
    }
  };

  const handleEdit = (squad: Squad) => {
    setEditingId(squad.id);
    setSquadName(squad.name);
    setFormation(squad.formation);
    const newAssignments: Record<number, { id: string; name: string }> = {};
    const newOffsets: Record<number, { x: number; y: number }> = {};
    if (squad.positions) {
      const pos = squad.positions as any;
      if (pos._offsets) {
        for (const [k, v] of Object.entries(pos._offsets)) {
          newOffsets[Number(k)] = v as { x: number; y: number };
        }
      }
      for (const [idx, playerId] of Object.entries(squad.positions)) {
        if (idx === '_offsets') continue;
        const player = players.find((p) => p.id === playerId);
        if (player) newAssignments[Number(idx)] = { id: player.id, name: player.name };
      }
    }
    setAssignments(newAssignments);
    setCustomOffsets(newOffsets);
    setShowEditor(true);
    setViewSquad(null);
  };

  const handleDelete = async (squadId: string) => {
    const { error } = await supabase.from('squads').delete().eq('id', squadId);
    if (error) toast.error(error.message);
    else { toast.success(t('squadDeleted')); loadSquads(); }
    if (editingId === squadId) { setEditingId(null); setSquadName(''); setAssignments({}); setCustomOffsets({}); setShowEditor(false); }
    if (viewSquad?.id === squadId) setViewSquad(null);
  };

  const handleNewSquad = () => {
    setEditingId(null);
    setSquadName('');
    setFormation('4-3-3');
    setAssignments({});
    setCustomOffsets({});
    setShowEditor(true);
  };

  const handleExportPdf = async (squad: Squad, dark: boolean = false) => {
    const playerNames: Record<number, string> = {};
    if (squad.positions) {
      for (const [idx, playerId] of Object.entries(squad.positions)) {
        if (idx === '_offsets') continue;
        const player = players.find((p) => p.id === playerId);
        if (player) playerNames[Number(idx)] = player.name;
      }
    }
    await exportSquadPdf({ name: squad.name, formation: squad.formation, playerNames }, lang, analystName || undefined, dark);
    toast.success(t('exportPdf'));
  };

  const getViewAssignments = (squad: Squad) => {
    const result: Record<number, string> = {};
    if (squad.positions) {
      for (const [idx, playerId] of Object.entries(squad.positions)) {
        if (idx === '_offsets') continue;
        const player = players.find((p) => p.id === playerId);
        if (player) result[Number(idx)] = player.name;
      }
    }
    return result;
  };

  const getViewOffsets = (squad: Squad): Record<number, { x: number; y: number }> => {
    if (squad.positions && (squad.positions as any)._offsets) {
      const offsets: Record<number, { x: number; y: number }> = {};
      for (const [k, v] of Object.entries((squad.positions as any)._offsets)) {
        offsets[Number(k)] = v as { x: number; y: number };
      }
      return offsets;
    }
    return {};
  };

  const renderPitch = (
    formationKey: string,
    assignMap: Record<number, string>,
    interactive: boolean = false,
    offsets?: Record<number, { x: number; y: number }>,
  ) => {
    const pos = formationPositions[formationKey] || formationPositions['4-3-3'];
    const activeOffsets = interactive ? customOffsets : (offsets || {});

    return (
      <div
        ref={interactive ? pitchRef : undefined}
        className="relative w-full max-w-full rounded-xl overflow-hidden touch-none"
        style={{
          aspectRatio: '68/105',
          maxHeight: '70vh',
          background: 'linear-gradient(180deg, #1a6b2a 0%, #228b22 30%, #1e7a24 50%, #228b22 70%, #1a6b2a 100%)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
        onPointerMove={interactive ? handlePointerMove : undefined}
        onPointerUp={interactive ? handlePointerUp : undefined}
      >
        {/* Grass stripe texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 8%, rgba(255,255,255,0.03) 8%, rgba(255,255,255,0.03) 16%)',
        }} />
        {/* Field lines via SVG for accurate proportions */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 68 105" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Boundary */}
          <rect x="2" y="2" width="64" height="101" stroke="white" strokeOpacity="0.6" strokeWidth="0.4" rx="0.3" />
          {/* Half line */}
          <line x1="2" y1="52.5" x2="66" y2="52.5" stroke="white" strokeOpacity="0.6" strokeWidth="0.4" />
          {/* Center circle */}
          <circle cx="34" cy="52.5" r="9.15" stroke="white" strokeOpacity="0.6" strokeWidth="0.4" />
          {/* Center dot */}
          <circle cx="34" cy="52.5" r="0.5" fill="white" fillOpacity="0.7" />
          {/* Penalty area top */}
          <rect x="13.84" y="2" width="40.32" height="16.5" stroke="white" strokeOpacity="0.6" strokeWidth="0.4" />
          {/* Penalty area bottom */}
          <rect x="13.84" y="86.5" width="40.32" height="16.5" stroke="white" strokeOpacity="0.6" strokeWidth="0.4" />
          {/* Goal area top */}
          <rect x="24.84" y="2" width="18.32" height="5.5" stroke="white" strokeOpacity="0.5" strokeWidth="0.35" />
          {/* Goal area bottom */}
          <rect x="24.84" y="97.5" width="18.32" height="5.5" stroke="white" strokeOpacity="0.5" strokeWidth="0.35" />
          {/* Penalty spots */}
          <circle cx="34" cy="13" r="0.35" fill="white" fillOpacity="0.6" />
          <circle cx="34" cy="92" r="0.35" fill="white" fillOpacity="0.6" />
          {/* Penalty arcs */}
          <path d="M 25.5 18.5 A 9.15 9.15 0 0 0 42.5 18.5" stroke="white" strokeOpacity="0.5" strokeWidth="0.35" />
          <path d="M 25.5 86.5 A 9.15 9.15 0 0 1 42.5 86.5" stroke="white" strokeOpacity="0.5" strokeWidth="0.35" />
          {/* Corner arcs — perfect 90° quarter circles at each corner */}
          <path d="M 2 4 A 2 2 0 0 0 4 2" stroke="white" strokeOpacity="0.5" strokeWidth="0.35" />
          <path d="M 64 2 A 2 2 0 0 0 66 4" stroke="white" strokeOpacity="0.5" strokeWidth="0.35" />
          <path d="M 2 101 A 2 2 0 0 1 4 103" stroke="white" strokeOpacity="0.5" strokeWidth="0.35" />
          <path d="M 64 103 A 2 2 0 0 1 66 101" stroke="white" strokeOpacity="0.5" strokeWidth="0.35" />
        </svg>
        {pos.map((p, idx) => {
          const ox = activeOffsets[idx]?.x ?? p.x;
          const oy = activeOffsets[idx]?.y ?? p.y;
          const abbrLabel = localizePositionAbbr(p.label, lang);

          const playerData = interactive ? assignments[idx] : null;
          const playerName = interactive ? assignments[idx]?.name : assignMap[idx];
          const playerObj = interactive && assignments[idx] ? players.find(pl => pl.id === assignments[idx].id) : null;
          const natCode = playerObj?.nationality || null;
          const natName = natCode ? (() => {
            const c = countries.find(c => c.code === natCode);
            if (!c) return '';
            return lang === 'tr' ? c.nameTR : c.name;
          })() : null;

          const circleClasses = `
            w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
            text-[10px] sm:text-xs font-bold text-white
            shadow-[0_0_16px_rgba(255,255,255,0.15)]
            border border-white/40
          `;
          const circleStyle = {
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          };

          return interactive ? (
            <button
              key={idx}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group cursor-grab active:cursor-grabbing"
              style={{ left: `${ox}%`, top: `${oy}%` }}
              onClick={() => openPlayerModal(idx)}
              onPointerDown={(e) => handlePointerDown(idx, e)}
            >
              <div className={`${circleClasses} group-hover:scale-110 transition-transform`} style={circleStyle}>{abbrLabel}</div>
              <span className="text-[9px] sm:text-[10px] text-white font-semibold truncate max-w-[60px] sm:max-w-[70px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{playerName || '—'}</span>
              {natName && <span className="text-[8px] text-white/70 truncate max-w-[60px] sm:max-w-[70px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{natName}</span>}
            </button>
          ) : (
            <div key={idx} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5" style={{ left: `${ox}%`, top: `${oy}%` }}>
              <div className={circleClasses} style={circleStyle}>{abbrLabel}</div>
              <span className="text-[9px] sm:text-[10px] text-white font-semibold truncate max-w-[60px] sm:max-w-[70px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{assignMap[idx] || '—'}</span>
              {/* View mode doesn't have player nationality readily available */}
            </div>
          );
        })}
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
                <div className="flex flex-col">
                  <div>
                    <span className="font-bold">{squad.name}</span>
                    <span className="text-muted-foreground text-sm ml-3">{squad.formation}</span>
                  </div>
                  <span className="text-muted-foreground text-xs mt-1">
                    {lang === 'tr' ? 'Son Güncelleme' : 'Last Updated'}:{'\u00A0\u00A0'}{formatDateDDMMYYYY(squad.updated_at || squad.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setExportSquadData(squad); }} title={t('exportPdf')}>
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
          <DialogContent className="max-w-2xl p-4">
            <DialogHeader>
              <DialogTitle>{viewSquad?.name} — {viewSquad?.formation}</DialogTitle>
            </DialogHeader>
            <div className="w-full" style={{ maxHeight: '70vh' }}>
              {viewSquad && renderPitch(viewSquad.formation, getViewAssignments(viewSquad), false, getViewOffsets(viewSquad))}
            </div>
          </DialogContent>
        </Dialog>

        <ExportModal
          open={!!exportSquadData}
          onOpenChange={(open) => !open && setExportSquadData(null)}
          onExport={(dark) => {
            if (exportSquadData) {
              handleExportPdf(exportSquadData, dark);
            }
          }}
        />
      </div>
    );
  }

  // Editor View
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { setShowEditor(false); setEditingId(null); }}>← {t('savedSquads')}</Button>
          <h1 className="text-2xl font-bold">{editingId ? squadName : t('addSquad')}</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Input placeholder={t('squadName')} value={squadName} onChange={(e) => setSquadName(e.target.value)} className="w-48" />
          <Select value={formation} onValueChange={(v) => { setFormation(v); setAssignments({}); setCustomOffsets({}); }}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(formationPositions).sort().map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
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

      <p className="text-xs text-muted-foreground italic">
        {lang === 'tr' ? 'Oyuncuları sürükleyerek pozisyonlarını ayarlayabilirsiniz.' : 'Drag players to fine-tune their positions.'}
      </p>

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
                <span className="text-muted-foreground text-sm ml-2">{p.current_team} · {localizePosition(p.primary_position, lang)}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SquadBuilder;
