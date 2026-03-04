import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Edit, Plus, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const PlayerList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('players').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setPlayers(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from('players').delete().eq('id', id);
    toast.success('Player deleted');
    load();
  };

  const filtered = players.filter((p) =>
    `${p.name} ${p.current_team}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Player Library</h1>
        <Button onClick={() => navigate('/players/new')}><Plus className="mr-2 h-4 w-4" />Add Player</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search players..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="space-y-3">
        {filtered.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">
                  {p.current_team} · {p.primary_position} · {p.preferred_foot}
                </div>
                {p.transfermarkt_link && (
                  <a href={p.transfermarkt_link} target="_blank" rel="noopener noreferrer" className="text-primary text-xs inline-flex items-center gap-1 hover:underline mt-1">
                    Transfermarkt <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/players/${p.id}/edit`)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No players found.</p>}
      </div>
    </div>
  );
};

export default PlayerList;
