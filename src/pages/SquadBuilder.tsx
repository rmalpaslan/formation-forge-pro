import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

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

const SquadBuilder = () => {
  const { user } = useAuth();
  const [formation, setFormation] = useState('4-3-3');
  const [squadName, setSquadName] = useState('');
  const [assignments, setAssignments] = useState<Record<number, { id: string; name: string }>>({});
  const [players, setPlayers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('players').select('*').eq('user_id', user.id).then(({ data }) => setPlayers(data || []));
  }, [user]);

  const positions = formationPositions[formation] || formationPositions['4-3-3'];

  const openPlayerModal = (idx: number) => {
    setSelectedIdx(idx);
    setModalOpen(true);
  };

  const assignPlayer = (player: any) => {
    if (selectedIdx !== null) {
      setAssignments((prev) => ({ ...prev, [selectedIdx]: { id: player.id, name: player.name } }));
    }
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!squadName) { toast.error('Enter a squad name'); return; }
    setSaving(true);
    const positionsData: Record<string, string> = {};
    Object.entries(assignments).forEach(([idx, p]) => { positionsData[idx] = p.id; });
    const { error } = await supabase.from('squads').insert({
      name: squadName, formation, positions: positionsData, user_id: user!.id,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Squad saved!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Squad Builder</h1>
        <div className="flex items-center gap-3">
          <Input placeholder="Squad Name" value={squadName} onChange={(e) => setSquadName(e.target.value)} className="w-48" />
          <Select value={formation} onValueChange={(v) => { setFormation(v); setAssignments({}); }}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(formationPositions).map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Pitch */}
      <div className="relative w-full max-w-2xl mx-auto aspect-[68/105] rounded-lg border-2 border-primary bg-primary/20 overflow-hidden">
        {/* Field markings */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-primary/40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/40" />
          {/* Penalty boxes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[44%] h-[17%] border border-primary/30 border-t-0" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[44%] h-[17%] border border-primary/30 border-b-0" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-[6%] border border-primary/30 border-t-0" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[20%] h-[6%] border border-primary/30 border-b-0" />
        </div>

        {positions.map((pos, idx) => (
          <button
            key={idx}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => openPlayerModal(idx)}
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground group-hover:scale-110 transition-transform">
              {pos.label}
            </div>
            <span className="text-[10px] text-foreground font-medium truncate max-w-[60px]">
              {assignments[idx]?.name || '—'}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Select Player</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-64 overflow-auto">
            {players.length === 0 && <p className="text-muted-foreground text-sm">No players in your library.</p>}
            {players.map((p) => (
              <button
                key={p.id}
                className="w-full text-left px-3 py-2 rounded hover:bg-secondary transition-colors"
                onClick={() => assignPlayer(p)}
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground text-sm ml-2">{p.primary_position}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SquadBuilder;
