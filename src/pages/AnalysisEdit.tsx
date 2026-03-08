import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BulletInput } from '@/components/BulletInput';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Save, ImagePlus, X } from 'lucide-react';

// Master formation list
const allFormations = [
  '4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3',
  '3-2-5', '3-1-6', '3-1-5-1', '2-1-7', '2-1-6-1', '2-2-5-1', '2-2-6',
  '5-4-1', '6-3-1', '6-2-2', '5-3-2', '4-1-4-1', '4-5-1',
];

const setPieceSubTabs = ['corner', 'free_kick', 'throw_in'] as const;
const attackSubTabs = ['aut_baslangici', 'geriden_oyun_kurma'] as const;
const defenseSubTabs = ['aut_karsilama', 'on_alan_baskisi', 'orta_blok_karsilama', 'derin_blok_karsilama'] as const;

interface SectionData {
  notes: string[];
  notes_images: string[];
  pros: string[];
  pros_images: string[];
  cons: string[];
  cons_images: string[];
  formation: string;
}

const emptySection = (defaultFormation: string = '4-4-2'): SectionData => ({
  notes: [''], notes_images: [], pros: [''], pros_images: [], cons: [''], cons_images: [], formation: defaultFormation,
});

type TabKey = typeof attackSubTabs[number] | typeof defenseSubTabs[number] | typeof setPieceSubTabs[number];

const AnalysisEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<any>(null);
  const [tabs, setTabs] = useState<Record<string, SectionData>>(() => {
    const m: Record<string, SectionData> = {};
    attackSubTabs.forEach(k => m[k] = emptySection('3-2-5'));
    defenseSubTabs.forEach(k => m[k] = emptySection('5-4-1'));
    setPieceSubTabs.forEach(k => m[k] = emptySection());
    return m;
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTarget, setActiveUploadTarget] = useState<{ tab: string; field: string }>({ tab: '', field: '' });

  const navState = location.state as { nextAnalysisId?: string; step?: number } | null;
  const isBothFlow = !!navState?.nextAnalysisId;
  const currentStep = navState?.step || 1;

  useEffect(() => {
    const load = async () => {
      const { data: a } = await supabase.from('match_analyses').select('*').eq('id', id).single();
      if (a) setAnalysis(a);
      const { data: tabsData } = await supabase.from('analysis_tabs').select('*').eq('match_analysis_id', id);
      if (tabsData && tabsData.length > 0) {
        const map: Record<string, SectionData> = { ...tabs };
        tabsData.forEach((row: any) => {
          const key = row.sub_tab || row.tab_type;
          if (map[key] !== undefined) {
            map[key] = {
              formation: row.formation || map[key].formation,
              notes: row.general_notes?.length ? row.general_notes : [''],
              notes_images: [],
              pros: row.pros?.length ? row.pros : [''],
              pros_images: [],
              cons: row.cons?.length ? row.cons : [''],
              cons_images: [],
            };
            // Put all images under notes by default
            map[key].notes_images = row.images || [];
          }
        });
        setTabs(map);
      }
    };
    load();
  }, [id]);

  const updateTab = (key: string, field: keyof SectionData, value: any) => {
    setTabs((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleImageUpload = async (tabKey: string, field: string, file: File) => {
    setUploading(`${tabKey}-${field}`);
    const ext = file.name.split('.').pop();
    const path = `${id}/${tabKey}/${field}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('analysis-images').upload(path, file);
    if (error) {
      toast.error(t('uploadFailed') + error.message);
      setUploading(null);
      return;
    }
    const { data: urlData } = supabase.storage.from('analysis-images').getPublicUrl(path);
    const imgField = `${field}_images` as keyof SectionData;
    updateTab(tabKey, imgField, [...((tabs[tabKey] as any)[imgField] || []), urlData.publicUrl]);
    setUploading(null);
    toast.success(t('imageUploaded'));
  };

  const removeImage = (tabKey: string, field: string, idx: number) => {
    const imgField = `${field}_images` as keyof SectionData;
    const newImages = ((tabs[tabKey] as any)[imgField] || []).filter((_: string, i: number) => i !== idx);
    updateTab(tabKey, imgField, newImages);
  };

  // Clean empty bullets before saving
  const cleanBullets = (arr: string[]) => arr.filter(s => s.trim() !== '');

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('analysis_tabs').delete().eq('match_analysis_id', id!);

    const rows: any[] = [];
    attackSubTabs.forEach(st => {
      const sec = tabs[st];
      rows.push({
        match_analysis_id: id, tab_type: 'attack', sub_tab: st,
        formation: sec.formation,
        general_notes: cleanBullets(sec.notes),
        pros: cleanBullets(sec.pros),
        cons: cleanBullets(sec.cons),
        images: [...sec.notes_images, ...sec.pros_images, ...sec.cons_images],
      });
    });
    defenseSubTabs.forEach(st => {
      const sec = tabs[st];
      rows.push({
        match_analysis_id: id, tab_type: 'defense', sub_tab: st,
        formation: sec.formation,
        general_notes: cleanBullets(sec.notes),
        pros: cleanBullets(sec.pros),
        cons: cleanBullets(sec.cons),
        images: [...sec.notes_images, ...sec.pros_images, ...sec.cons_images],
      });
    });
    setPieceSubTabs.forEach(st => {
      const sec = tabs[st];
      rows.push({
        match_analysis_id: id, tab_type: 'set_pieces', sub_tab: st,
        general_notes: cleanBullets(sec.notes),
        pros: cleanBullets(sec.pros),
        cons: cleanBullets(sec.cons),
        images: [...sec.notes_images, ...sec.pros_images, ...sec.cons_images],
      });
    });

    const { error } = await supabase.from('analysis_tabs').insert(rows);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t('analysisSaved'));

    // If "both" flow, navigate to away analysis with clean state
    if (isBothFlow && currentStep === 1 && navState?.nextAnalysisId) {
      navigate(`/analyses/${navState.nextAnalysisId}/edit`, { state: { step: 2 }, replace: true });
    }
  };

  const renderImageRow = (tabKey: string, field: string) => {
    const imgField = `${field}_images` as keyof SectionData;
    const images = (tabs[tabKey] as any)[imgField] || [];
    const isUploading = uploading === `${tabKey}-${field}`;
    return (
      <div className="mt-2 space-y-2">
        <div className="flex flex-wrap gap-3">
          {images.map((url: string, idx: number) => (
            <div key={idx} className="relative group w-20 h-20 rounded border border-border overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(tabKey, field, idx)}
                className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
        <Button
          variant="outline" size="sm" disabled={isUploading}
          onClick={() => { setActiveUploadTarget({ tab: tabKey, field }); fileInputRef.current?.click(); }}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          {isUploading ? t('uploading') : t('addImage')}
        </Button>
      </div>
    );
  };

  const renderSection = (tabKey: string, showFormation: boolean = true) => (
    <div className="space-y-6 pt-4">
      {showFormation && (
        <div className="max-w-xs">
          <label className="text-sm text-muted-foreground">{t('formation')}</label>
          <Select value={tabs[tabKey].formation} onValueChange={(v) => updateTab(tabKey, 'formation', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {allFormations.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <BulletInput label={t('generalNotes')} value={tabs[tabKey].notes} onChange={(v) => updateTab(tabKey, 'notes', v)} />
        {renderImageRow(tabKey, 'notes')}
      </div>
      <div>
        <BulletInput label={t('pros')} value={tabs[tabKey].pros} onChange={(v) => updateTab(tabKey, 'pros', v)} />
        {renderImageRow(tabKey, 'pros')}
      </div>
      <div>
        <BulletInput label={t('cons')} value={tabs[tabKey].cons} onChange={(v) => updateTab(tabKey, 'cons', v)} />
        {renderImageRow(tabKey, 'cons')}
      </div>
    </div>
  );

  if (!analysis) return <div className="text-muted-foreground">{t('loading')}</div>;

  const targetName = analysis.target_team === 'home' ? analysis.home_team : analysis.away_team;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(activeUploadTarget.tab, activeUploadTarget.field, file);
          e.target.value = '';
        }}
      />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">{analysis.home_team} vs {analysis.away_team}</h1>
          <p className="text-sm text-muted-foreground">
            {analysis.match_date} · {t('target')}: {targetName}
            {isBothFlow && <span className="ml-2 text-primary font-medium">({currentStep === 1 ? t('step1of2') : t('step2of2')})</span>}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? t('saving') : isBothFlow && currentStep === 1 ? t('saveAndContinue') : t('save')}
        </Button>
      </div>

      <Tabs defaultValue="defense">
        <TabsList className="flex-wrap">
          <TabsTrigger value="defense">{t('defense')}</TabsTrigger>
          <TabsTrigger value="attack">{t('attack')}</TabsTrigger>
          <TabsTrigger value="set_pieces">{t('setPieces')}</TabsTrigger>
        </TabsList>

        <TabsContent value="defense">
          <Tabs defaultValue="aut_karsilama" className="mt-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="aut_karsilama">{t('autKarsilama')}</TabsTrigger>
              <TabsTrigger value="on_alan_baskisi">{t('onAlanBaskisi')}</TabsTrigger>
              <TabsTrigger value="orta_blok_karsilama">{t('ortaBlokKarsilama')}</TabsTrigger>
              <TabsTrigger value="derin_blok_karsilama">{t('derinBlokKarsilama')}</TabsTrigger>
            </TabsList>
            {defenseSubTabs.map((st) => (
              <TabsContent key={st} value={st}>{renderSection(st, true)}</TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="attack">
          <Tabs defaultValue="aut_baslangici" className="mt-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="aut_baslangici">{t('autBaslangici')}</TabsTrigger>
              <TabsTrigger value="geriden_oyun_kurma">{t('geridenOyunKurma')}</TabsTrigger>
            </TabsList>
            {attackSubTabs.map((st) => (
              <TabsContent key={st} value={st}>{renderSection(st, true)}</TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="set_pieces">
          <Tabs defaultValue="corner" className="mt-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="corner">{t('corner')}</TabsTrigger>
              <TabsTrigger value="free_kick">{t('freeKick')}</TabsTrigger>
              <TabsTrigger value="throw_in">{t('throwIn')}</TabsTrigger>
            </TabsList>
            {setPieceSubTabs.map((st) => (
              <TabsContent key={st} value={st}>{renderSection(st, false)}</TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisEdit;
