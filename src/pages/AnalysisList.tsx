import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const AnalysisList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('match_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setAnalyses(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from('analysis_tabs').delete().eq('match_analysis_id', id);
    await supabase.from('match_analyses').delete().eq('id', id);
    toast.success('Analysis deleted');
    load();
  };

  const filtered = analyses.filter((a) =>
    `${a.home_team} ${a.away_team}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analysis Library</h1>
        <Button onClick={() => navigate('/analyses/new')}><Plus className="mr-2 h-4 w-4" />New Analysis</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search analyses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="space-y-3">
        {filtered.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{a.home_team} vs {a.away_team}</div>
                <div className="text-sm text-muted-foreground">{a.match_date} · {a.target_team}</div>
              </div>
              <div className="flex gap-2">
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
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No analyses found.</p>}
      </div>
    </div>
  );
};

export default AnalysisList;
