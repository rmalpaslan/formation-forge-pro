import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BulletInput } from '@/components/BulletInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, ImagePlus, X } from 'lucide-react';

const formations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2', '4-1-4-1', '4-5-1'];
const setPieceSubTabs = ['corner', 'free_kick', 'throw_in'] as const;

interface TabData {
  formation: string;
  general_notes: string[];
  pros: string[];
  cons: string[];
  images: string[];
}

const emptyTab = (): TabData => ({ formation: '4-4-2', general_notes: [''], pros: [''], cons: [''], images: [] });

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
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTab, setActiveUploadTab] = useState<string>('');

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
            images: t.images || [],
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

  const handleImageUpload = async (tabKey: string, file: File) => {
    setUploading(tabKey);
    const ext = file.name.split('.').pop();
    const path = `${id}/${tabKey}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('analysis-images').upload(path, file);
    if (error) {
      toast.error('Upload failed: ' + error.message);
      setUploading(null);
      return;
    }
    const { data: urlData } = supabase.storage.from('analysis-images').getPublicUrl(path);
    updateTab(tabKey, 'images', [...(tabs[tabKey].images || []), urlData.publicUrl]);
    setUploading(null);
    toast.success('Image uploaded');
  };

  const removeImage = (tabKey: string, idx: number) => {
    const newImages = tabs[tabKey].images.filter((_, i) => i !== idx);
    updateTab(tabKey, 'images', newImages);
  };

  const handleSave = async () => {
    setSaving(true);
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

  const renderImageSection = (key: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Images</label>
      <div className="flex flex-wrap gap-3">
        {(tabs[key].images || []).map((url, idx) => (
          <div key={idx} className="relative group w-24 h-24 rounded border border-border overflow-hidden">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(key, idx)}
              className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-destructive" />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={uploading === key}
        onClick={() => { setActiveUploadTab(key); fileInputRef.current?.click(); }}
      >
        <ImagePlus className="mr-2 h-4 w-4" />
        {uploading === key ? 'Uploading...' : 'Add Image'}
      </Button>
    </div>
  );

  const renderTabContent = (key: string, showFormation: boolean = true) => (
    <div className="space-y-6 pt-4">
      {showFormation && (
        <div className="max-w-xs">
          <label className="text-sm text-muted-foreground">Formation</label>
          <Select value={tabs[key].formation} onValueChange={(v) => updateTab(key, 'formation', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {formations.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <BulletInput label="General Notes" value={tabs[key].general_notes} onChange={(v) => updateTab(key, 'general_notes', v)} />
      <BulletInput label="Pros (Positive)" value={tabs[key].pros} onChange={(v) => updateTab(key, 'pros', v)} />
      <BulletInput label="Cons (Negative)" value={tabs[key].cons} onChange={(v) => updateTab(key, 'cons', v)} />
      {renderImageSection(key)}
    </div>
  );

  if (!analysis) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(activeUploadTab, file);
          e.target.value = '';
        }}
      />
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
              <TabsContent key={st} value={st}>{renderTabContent(st, false)}</TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisEdit;
