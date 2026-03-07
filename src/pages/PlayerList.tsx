import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Search, ExternalLink, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

const PlayerList = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [viewPlayer, setViewPlayer] = useState<any>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('players').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setPlayers(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await supabase.from('players').delete().eq('id', id);
    toast.success(t('playerDeleted'));
    if (viewPlayer?.id === id) setViewPlayer(null);
    load();
  };

  const filtered = players.filter((p) =>
    `${p.name} ${p.current_team}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('playerLibrary')}</h1>
        <Button onClick={() => navigate('/players/new')}><Plus className="mr-2 h-4 w-4" />{t('addPlayer')}</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('searchPlayers')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="space-y-3">
        {filtered.map((p) => (
          <Card key={p.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setViewPlayer(p)}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-bold text-base">{p.name}</div>
                <div className="text-sm text-muted-foreground">
                  {p.current_team} · {p.primary_position} · {p.preferred_foot}
                </div>
              </div>
              <div className="flex gap-2">
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

      {/* View Card Modal */}
      <Dialog open={!!viewPlayer} onOpenChange={(open) => !open && setViewPlayer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{viewPlayer?.name}</DialogTitle>
          </DialogHeader>
          {viewPlayer && (
            <div className="space-y-3">
              <InfoRow label={t('currentTeam')} value={viewPlayer.current_team} />
              <InfoRow label={t('primaryPosition')} value={viewPlayer.primary_position} />
              <InfoRow label={t('secondaryPosition')} value={viewPlayer.secondary_position || t('none')} />
              <InfoRow label={t('preferredFoot')} value={viewPlayer.preferred_foot} />
              <InfoRow label={t('birthDate')} value={viewPlayer.birth_date || '—'} />
              {viewPlayer.transfermarkt_link && (
                <div>
                  <span className="text-sm text-muted-foreground">Transfermarkt: </span>
                  <a href={viewPlayer.transfermarkt_link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm inline-flex items-center gap-1 hover:underline">
                    {t('viewDetails')} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => { setViewPlayer(null); navigate(`/players/${viewPlayer.id}/edit`); }}>
                  <Edit className="mr-2 h-4 w-4" />{t('edit')}
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleDelete(viewPlayer.id)}>
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
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

export default PlayerList;
