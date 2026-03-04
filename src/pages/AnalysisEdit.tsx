import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BulletInput } from '@/components/BulletInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const formations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2', '4-1-4-1', '4-5-1'];
const setPieceSubTabs = ['corner', 'free_kick', 'throw_in'] as const;

interface TabData {
  formation: string;
  general_notes: string[];
  pros: string[];
  cons: string[];
}

const emptyTab = (): TabData => ({ formation: '4-4-2', general_notes: [''], pros: [''], cons: [''] });

const AnalysisEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [tabs, setTabs] = useState<Record<string, TabData>>({
    defense: emptyTab(),
    attack: emptyTab(),
    corner: emptyTab(),
    free_kick: emptyTab(),
    throw_in: emptyTab(),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: a } = await supabase.from('match_analyses').select('*').eq('id', id).single();
      if (a) setAnalysis(a);
      const { data: tabsData } = await supabase.from('analysis_tabs').select('*').eq('match_analysis_id', id);
      if (tabsData && tabsData.length > 0) {
        const map: Record<string, TabData> = { ...tabs };
        tabsData.forEach((t: any) => {
          const key = t.sub_tab || t.tab_type;
          map[key] = {
            formation: t.formation || '4-4-2',
            general_notes: t.general_notes || [''],
            pros: t.pros || [''],
            cons: t.cons || [''],
          };
        });
        setTabs(map);
      }
    };
    load();
  }, [id]);

  const updateTab = (key: string, field: keyof TabData, value: any) => {
    setTabs((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Delete existing tabs and re-insert
    await supabase.from('analysis_tabs').delete().eq('match_analysis_id', id!);
    const rows: any[] = [
      { match_analysis_id: id, tab_type: 'defense', sub_tab: null, ...tabs.defense },
      { match_analysis_id: id, tab_type: 'attack', sub_tab: null, ...tabs.attack },
      ...setPieceSubTabs.map((st) => ({
        match_analysis_id: id, tab_type: 'set_pieces', sub_tab: st as string, ...tabs[st],
      })),
    ];
    const { error } = await supabase.from('analysis_tabs').insert(rows);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Analysis saved!');
  };

  const renderTabContent = (key: string) => (
    <div className="space-y-6 pt-4">
      <div className="max-w-xs">
        <label className="text-sm text-muted-foreground">Formation</label>
        <Select value={tabs[key].formation} onValueChange={(v) => updateTab(key, 'formation', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {formations.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <BulletInput label="General Notes" value={tabs[key].general_notes} onChange={(v) => updateTab(key, 'general_notes', v)} />
      <BulletInput label="Pros (Positive)" value={tabs[key].pros} onChange={(v) => updateTab(key, 'pros', v)} />
      <BulletInput label="Cons (Negative)" value={tabs[key].cons} onChange={(v) => updateTab(key, 'cons', v)} />
    </div>
  );

  if (!analysis) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{analysis.home_team} vs {analysis.away_team}</h1>
          <p className="text-sm text-muted-foreground">{analysis.match_date} · Target: {analysis.target_team}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <Tabs defaultValue="defense">
        <TabsList>
          <TabsTrigger value="defense">Defense</TabsTrigger>
          <TabsTrigger value="attack">Attack</TabsTrigger>
          <TabsTrigger value="set_pieces">Set Pieces</TabsTrigger>
        </TabsList>

        <TabsContent value="defense">{renderTabContent('defense')}</TabsContent>
        <TabsContent value="attack">{renderTabContent('attack')}</TabsContent>
        <TabsContent value="set_pieces">
          <Tabs defaultValue="corner" className="mt-4">
            <TabsList>
              <TabsTrigger value="corner">Corner</TabsTrigger>
              <TabsTrigger value="free_kick">Free Kick</TabsTrigger>
              <TabsTrigger value="throw_in">Throw-in</TabsTrigger>
            </TabsList>
            {setPieceSubTabs.map((st) => (
              <TabsContent key={st} value={st}>{renderTabContent(st)}</TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisEdit;
