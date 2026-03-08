import jsPDF from 'jspdf';

// ── Font Loading ──

async function loadFontBase64(url: string): Promise<string> {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const FONT_URLS = {
  regular: [
    '/fonts/NotoSans-Regular.ttf',
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-400-normal.ttf',
  ],
  bold: [
    '/fonts/NotoSans-Bold.ttf',
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-700-normal.ttf',
  ],
};

async function loadFontWithFallback(urls: string[]): Promise<string> {
  for (const url of urls) {
    try { return await loadFontBase64(url); } catch { /* next */ }
  }
  throw new Error('All font sources failed');
}

async function setupFonts(doc: jsPDF): Promise<boolean> {
  try {
    const [regularB64, boldB64] = await Promise.all([
      loadFontWithFallback(FONT_URLS.regular),
      loadFontWithFallback(FONT_URLS.bold),
    ]);
    doc.addFileToVFS('NotoSans-Regular.ttf', regularB64);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.addFileToVFS('NotoSans-Bold.ttf', boldB64);
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
    doc.setFont('NotoSans', 'normal');
    return true;
  } catch (e) {
    console.error('Font setup failed:', e);
    return false;
  }
}

// ── Image Loading ──

async function loadImageAsset(url: string): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG'; width: number; height: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    if (!dataUrl) return null;
    const size = await new Promise<{ width: number; height: number } | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
    if (!size) return null;
    const format = blob.type.includes('png') || blob.type.includes('webp') ? 'PNG' as const : 'JPEG' as const;
    return { dataUrl, format, width: size.width, height: size.height };
  } catch { return null; }
}

// ── PDF Helpers ──

function createHelpers(doc: jsPDF, fontLoaded: boolean) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const cw = pw - margin * 2;
  let y = 20;

  const setFont = (style: 'normal' | 'bold') => {
    doc.setFont(fontLoaded ? 'NotoSans' : 'helvetica', style);
  };
  const checkPage = (needed: number) => {
    if (y + needed > ph - 20) { doc.addPage(); y = 20; }
  };
  const getY = () => y;
  const setY = (v: number) => { y = v; };
  const addY = (v: number) => { y += v; };

  return { pw, ph, margin, cw, setFont, checkPage, getY, setY, addY };
}

// ── Types ──

interface TabData {
  tab_type: string;
  sub_tab: string | null;
  formation: string | null;
  general_notes: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  images: string[] | null;
}

interface AnalysisData {
  home_team: string;
  away_team: string;
  match_date: string;
  target_team: string;
}

interface GroupLabels {
  defense: string;
  attack: string;
  setPieces: string;
}

// ── Main Export ──

const CATEGORY_ORDER: { key: string; subTabs: string[] }[] = [
  { key: 'defense', subTabs: ['aut_karsilama', 'on_alan_baskisi', 'orta_blok_karsilama', 'derin_blok_karsilama'] },
  { key: 'attack', subTabs: ['aut_baslangici', 'geriden_oyun_kurma'] },
  { key: 'set_pieces', subTabs: ['corner', 'free_kick', 'throw_in'] },
];

export async function exportAnalysisPdf(
  analysis: AnalysisData,
  tabsData: TabData[],
  subTabLabels: Record<string, string>,
  tTarget: string,
  tDizilis: string,
  tGeneralNotes: string,
  tPros: string,
  tCons: string,
  groupLabels?: GroupLabels,
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true });
  const fontLoaded = await setupFonts(doc);
  const h = createHelpers(doc, fontLoaded);

  const GROUP_NAMES: Record<string, string> = {
    defense: groupLabels?.defense || 'SAVUNMA',
    attack: groupLabels?.attack || 'HÜCUM',
    set_pieces: groupLabels?.setPieces || 'DURAN TOPLAR',
  };

  // ── Cover / Title ──
  doc.setFontSize(22);
  h.setFont('bold');
  doc.setTextColor(31, 41, 55); // #1F2937
  doc.text(`${analysis.home_team} vs ${analysis.away_team}`, h.margin, h.getY());
  h.addY(10);

  doc.setFontSize(11);
  h.setFont('normal');
  doc.setTextColor(107, 114, 128);
  const targetName = analysis.target_team === 'home' ? analysis.home_team : analysis.away_team;
  doc.text(`${analysis.match_date}  ·  ${tTarget}: ${targetName}`, h.margin, h.getY());
  h.addY(8);

  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.8);
  doc.line(h.margin, h.getY(), h.pw - h.margin, h.getY());
  h.addY(14);

  // Build a lookup: sub_tab -> TabData
  const tabMap = new Map<string, TabData>();
  for (const td of tabsData) {
    const key = td.sub_tab || td.tab_type;
    tabMap.set(key, td);
  }

  // Helper: check if a tab has any content
  const hasContent = (tab: TabData | undefined): boolean => {
    if (!tab) return false;
    const notes = (tab.general_notes || []).filter(s => s.trim());
    const pros = (tab.pros || []).filter(s => s.trim());
    const cons = (tab.cons || []).filter(s => s.trim());
    const imgs = (tab.images || []).filter(s => s.trim());
    return notes.length > 0 || pros.length > 0 || cons.length > 0 || imgs.length > 0;
  };

  // ── Render bullets ──
  const renderBullets = (title: string, items: string[] | null) => {
    const cleaned = (items || []).filter(s => s.trim() !== '');
    if (cleaned.length === 0) return;

    h.checkPage(16);
    doc.setFontSize(11);
    h.setFont('bold');
    doc.setTextColor(31, 41, 55);
    doc.text(`${title}:`, h.margin + 4, h.getY());
    h.addY(7);

    doc.setFontSize(10);
    h.setFont('normal');
    for (const item of cleaned) {
      h.checkPage(14);
      // Green bullet
      doc.setTextColor(34, 139, 34);
      doc.text('\u2022', h.margin + 6, h.getY());
      doc.setTextColor(31, 41, 55);
      const lines: string[] = doc.splitTextToSize(item, h.cw - 16);
      doc.text(lines, h.margin + 12, h.getY());
      h.addY(lines.length * 5.5);
    }
    h.addY(4);
  };

  // ── Render images ──
  const renderImages = async (images: string[] | null) => {
    const urls = (images || []).filter(s => s.trim());
    for (const imgUrl of urls) {
      const image = await loadImageAsset(imgUrl);
      if (!image) continue;

      let imgWidth = h.cw * 0.85;
      let imgHeight = (image.height / image.width) * imgWidth;
      const maxH = h.ph * 0.42;
      if (imgHeight > maxH) {
        imgWidth *= maxH / imgHeight;
        imgHeight = maxH;
      }

      const imgX = h.margin + (h.cw - imgWidth) / 2;
      h.checkPage(imgHeight + 14);

      try {
        doc.addImage(image.dataUrl, image.format, imgX, h.getY(), imgWidth, imgHeight, undefined, 'FAST');
        h.addY(imgHeight + 10);
      } catch { /* skip broken */ }
    }
  };

  // ── Iterate categories ──
  for (const category of CATEGORY_ORDER) {
    // Check if any sub-tab in this category has content
    const categoryTabs = category.subTabs.map(st => tabMap.get(st)).filter(Boolean) as TabData[];
    const categoryHasContent = categoryTabs.some(hasContent);
    if (!categoryHasContent) continue;

    // ── Category Header (large, green) ──
    h.checkPage(30);
    doc.setFillColor(34, 139, 34);
    doc.rect(h.margin, h.getY() - 6, h.cw, 12, 'F');
    doc.setFontSize(18);
    h.setFont('bold');
    doc.setTextColor(255, 255, 255);
    doc.text(GROUP_NAMES[category.key] || category.key.toUpperCase(), h.margin + 5, h.getY() + 1);
    doc.setTextColor(31, 41, 55);
    h.addY(16);

    // ── Sub-tabs ──
    for (const subKey of category.subTabs) {
      const tab = tabMap.get(subKey);
      if (!tab || !hasContent(tab)) continue;

      // Sub-header
      h.checkPage(20);
      doc.setFontSize(14);
      h.setFont('bold');
      doc.setTextColor(34, 139, 34);
      const subLabel = subTabLabels[subKey] || subKey;
      doc.text(subLabel, h.margin, h.getY());
      doc.setTextColor(31, 41, 55);
      h.addY(8);

      // Diziliş (formation)
      if (tab.formation) {
        doc.setFontSize(10);
        h.setFont('bold');
        doc.text(`${tDizilis}: `, h.margin + 2, h.getY());
        h.setFont('normal');
        const fw = doc.getTextWidth(`${tDizilis}: `);
        doc.text(tab.formation, h.margin + 2 + fw, h.getY());
        h.addY(8);
      }

      // Text sections FIRST
      renderBullets(tGeneralNotes, tab.general_notes);
      renderBullets(tPros, tab.pros);
      renderBullets(tCons, tab.cons);

      // Images AFTER text
      await renderImages(tab.images);

      // Sub-section divider
      h.addY(6);
      h.checkPage(4);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(h.margin + 10, h.getY(), h.pw - h.margin - 10, h.getY());
      h.addY(10);
    }

    // Extra space between categories
    h.addY(8);
  }

  doc.save(`${analysis.home_team}_vs_${analysis.away_team}.pdf`);
}

// ── Player PDF Export ──

interface PlayerData {
  name: string;
  current_team?: string | null;
  league?: string | null;
  birth_date?: string | null;
  preferred_foot?: string | null;
  primary_position?: string | null;
  secondary_position?: string | null;
  transfermarkt_link?: string | null;
}

export async function exportPlayerPdf(
  player: PlayerData,
  labels: Record<string, string>,
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true });
  const fontLoaded = await setupFonts(doc);
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 25;

  const setFont = (style: 'normal' | 'bold') => {
    doc.setFont(fontLoaded ? 'NotoSans' : 'helvetica', style);
  };

  doc.setFillColor(34, 139, 34);
  doc.rect(margin, y - 7, pageWidth - margin * 2, 12, 'F');
  doc.setFontSize(16);
  setFont('bold');
  doc.setTextColor(255, 255, 255);
  doc.text(player.name, margin + 4, y);
  doc.setTextColor(31, 41, 55);
  y += 14;

  doc.setDrawColor(160);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const addRow = (label: string, value: string | null | undefined) => {
    if (!value) return;
    doc.setFontSize(10);
    setFont('bold');
    doc.text(`${label}:`, margin, y);
    setFont('normal');
    doc.text(value, margin + 55, y);
    y += 8;
  };

  addRow(labels.currentTeam, player.current_team);
  addRow(labels.league, player.league);
  addRow(labels.primaryPosition, player.primary_position);
  addRow(labels.secondaryPosition, player.secondary_position);
  addRow(labels.preferredFoot, player.preferred_foot);
  addRow(labels.birthDate, player.birth_date);
  if (player.transfermarkt_link) addRow('Transfermarkt', player.transfermarkt_link);

  doc.save(`${player.name}.pdf`);
}
