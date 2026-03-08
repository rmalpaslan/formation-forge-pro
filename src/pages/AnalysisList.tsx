import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Edit, Plus, Search, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { exportAnalysisPdf } from '@/lib/pdfExport';

const AnalysisList = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('match_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setAnalyses(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from('analysis_tabs').delete().eq('match_analysis_id', id);
    await supabase.from('match_analyses').delete().eq('id', id);
    toast.success(t('analysisDeleted'));
    load();
  };

  const handleExportPdf = async (analysis: any) => {
    const { data: tabsData } = await supabase.from('analysis_tabs').select('*').eq('match_analysis_id', analysis.id);
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text(`${analysis.home_team} vs ${analysis.away_team}`, 15, y);
    y += 10;
    doc.setFontSize(11);
    const targetName = analysis.target_team === 'home' ? analysis.home_team : analysis.away_team;
    doc.text(`${analysis.match_date} | ${t('target')}: ${targetName}`, 15, y);
    y += 12;

    if (tabsData) {
      const tabLabels: Record<string, string> = {
        aut_karsilama: t('autKarsilama'), on_alan_baskisi: t('onAlanBaskisi'),
        orta_blok_karsilama: t('ortaBlokKarsilama'), derin_blok_karsilama: t('derinBlokKarsilama'),
        aut_baslangici: t('autBaslangici'), geriden_oyun_kurma: t('geridenOyunKurma'),
        corner: t('corner'), free_kick: t('freeKick'), throw_in: t('throwIn'),
      };

      for (const tab of tabsData) {
        if (y > 260) { doc.addPage(); y = 20; }
        const label = tabLabels[tab.sub_tab || ''] || `${tab.tab_type}/${tab.sub_tab}`;
        doc.setFontSize(13);
        doc.text(label, 15, y);
        y += 7;
        if (tab.formation) { doc.setFontSize(10); doc.text(`${t('formation')}: ${tab.formation}`, 15, y); y += 6; }
        doc.setFontSize(10);
        const addBullets = (title: string, items: string[] | null) => {
          if (!items || items.length === 0) return;
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(`${title}:`, 15, y); y += 5;
          items.forEach(item => {
            if (y > 275) { doc.addPage(); y = 20; }
            const lines = doc.splitTextToSize(`• ${item}`, 175);
            doc.text(lines, 20, y);
            y += lines.length * 5;
          });
          y += 3;
        };
        addBullets(t('generalNotes'), tab.general_notes);
        addBullets(t('pros'), tab.pros);
        addBullets(t('cons'), tab.cons);
        y += 5;
      }
    }

    doc.save(`${analysis.home_team}_vs_${analysis.away_team}.pdf`);
  };

  const filtered = analyses.filter((a) =>
    `${a.home_team} ${a.away_team}`.toLowerCase().includes(search.toLowerCase())
  );

  const getTargetName = (a: any) => {
    if (a.target_team === 'home') return a.home_team;
    if (a.target_team === 'away') return a.away_team;
    return `${a.home_team} & ${a.away_team}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('analysisLibrary')}</h1>
        <Button onClick={() => navigate('/analyses/new')}><Plus className="mr-2 h-4 w-4" />{t('newAnalysis')}</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('searchAnalyses')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="space-y-3">
        {filtered.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{a.home_team} vs {a.away_team}</div>
                <div className="text-sm text-muted-foreground">{a.match_date} · {t('target')}: {getTargetName(a)}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleExportPdf(a)} title={t('exportPdf')}>
                  <FileDown className="h-4 w-4" />
                </Button>
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
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">{t('noAnalysesFound')}</p>}
      </div>
    </div>
  );
};

export default AnalysisList;
