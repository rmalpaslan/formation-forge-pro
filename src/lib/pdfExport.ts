import jsPDF from 'jspdf';

// ── Constants ──
const BRAND = 'COACHING ENGINEERING';
const GREEN: [number, number, number] = [34, 139, 34];
const TACTICAL_BLUE: [number, number, number] = [30, 64, 175];
const DARK_GRAY: [number, number, number] = [31, 41, 55];
const NEAR_BLACK: [number, number, number] = [26, 26, 26];
const RED_ACCENT: [number, number, number] = [180, 40, 40];
const LIGHT_GRAY: [number, number, number] = [107, 114, 128];

// ── Font Loading ──

async function loadFontBase64(url: string): Promise<string> {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

const FONT_URLS = {
  regular: ['/fonts/NotoSans-Regular.ttf', 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-400-normal.ttf'],
  bold: ['/fonts/NotoSans-Bold.ttf', 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-700-normal.ttf'],
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

// ── Date Formatting ──

function formatDate(dateStr: string | null | undefined, locale: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (locale === 'tr') {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    }
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return dateStr; }
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
    if (y + needed > ph - 25) {
      doc.addPage();
      y = 25;
      addPageHeader(doc, fontLoaded, pw, margin);
    }
  };
  const getY = () => y;
  const setY = (v: number) => { y = v; };
  const addY = (v: number) => { y += v; };

  return { pw, ph, margin, cw, setFont, checkPage, getY, setY, addY };
}

function addPageHeader(doc: jsPDF, fontLoaded: boolean, pw: number, margin: number) {
  const fn = fontLoaded ? 'NotoSans' : 'helvetica';
  doc.setFont(fn, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(BRAND, margin, 12);
  // thin green line
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.line(margin, 15, pw - margin, 15);
  // reset
  doc.setTextColor(...DARK_GRAY);
}

function addPageFooter(doc: jsPDF, fontLoaded: boolean) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const fn = fontLoaded ? 'NotoSans' : 'helvetica';
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont(fn, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...LIGHT_GRAY);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(15, ph - 14, pw - 15, ph - 14);
    doc.text(BRAND, 15, ph - 8);
    doc.text(`${i} / ${totalPages}`, pw - 15, ph - 8, { align: 'right' });
  }
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
  locale: string = 'tr',
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true });
  const fontLoaded = await setupFonts(doc);
  const h = createHelpers(doc, fontLoaded);

  const GROUP_NAMES: Record<string, string> = {
    defense: groupLabels?.defense || 'SAVUNMA',
    attack: groupLabels?.attack || 'HÜCUM',
    set_pieces: groupLabels?.setPieces || 'DURAN TOPLAR',
  };

  // ══════════════════════════════════════════
  // ── COVER PAGE ──
  // ══════════════════════════════════════════

  // Brand name at top
  h.setY(50);
  doc.setFontSize(14);
  h.setFont('bold');
  doc.setTextColor(...GREEN);
  const brandW = doc.getTextWidth(BRAND);
  doc.text(BRAND, (h.pw - brandW) / 2, h.getY());
  h.addY(6);

  // Decorative green line
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1.5);
  const lineW = 60;
  doc.line((h.pw - lineW) / 2, h.getY(), (h.pw + lineW) / 2, h.getY());
  h.addY(30);

  // Match title
  doc.setFontSize(28);
  h.setFont('bold');
  doc.setTextColor(...NEAR_BLACK);
  const titleText = `${analysis.home_team} vs ${analysis.away_team}`;
  const titleLines: string[] = doc.splitTextToSize(titleText, h.cw - 20);
  for (const line of titleLines) {
    const tw = doc.getTextWidth(line);
    doc.text(line, (h.pw - tw) / 2, h.getY());
    h.addY(14);
  }
  h.addY(10);

  // Target and date
  doc.setFontSize(12);
  h.setFont('normal');
  doc.setTextColor(...LIGHT_GRAY);
  const targetName = analysis.target_team === 'home' ? analysis.home_team : analysis.away_team;
  const dateFormatted = formatDate(analysis.match_date, locale);
  const metaLine1 = `${tTarget}: ${targetName}`;
  const metaLine2 = dateFormatted;
  let mw = doc.getTextWidth(metaLine1);
  doc.text(metaLine1, (h.pw - mw) / 2, h.getY());
  h.addY(8);
  mw = doc.getTextWidth(metaLine2);
  doc.text(metaLine2, (h.pw - mw) / 2, h.getY());
  h.addY(20);

  // Bottom green bar
  doc.setFillColor(...GREEN);
  doc.rect(h.margin, h.ph - 30, h.cw, 3, 'F');
  doc.setFontSize(8);
  h.setFont('normal');
  doc.setTextColor(...LIGHT_GRAY);
  const footerText = BRAND;
  const ftw = doc.getTextWidth(footerText);
  doc.text(footerText, (h.pw - ftw) / 2, h.ph - 18);

  // ── START CONTENT PAGES ──
  doc.addPage();
  h.setY(25);
  addPageHeader(doc, fontLoaded, h.pw, h.margin);

  // Build lookup
  const tabMap = new Map<string, TabData>();
  for (const td of tabsData) {
    const key = td.sub_tab || td.tab_type;
    tabMap.set(key, td);
  }

  const hasContent = (tab: TabData | undefined): boolean => {
    if (!tab) return false;
    const notes = (tab.general_notes || []).filter(s => s.trim());
    const pros = (tab.pros || []).filter(s => s.trim());
    const cons = (tab.cons || []).filter(s => s.trim());
    const imgs = (tab.images || []).filter(s => s.trim());
    return notes.length > 0 || pros.length > 0 || cons.length > 0 || imgs.length > 0;
  };

  // ── Render bullets ──
  const renderBullets = (title: string, items: string[] | null, bulletColor: [number, number, number]) => {
    const cleaned = (items || []).filter(s => s.trim() !== '');
    if (cleaned.length === 0) return;

    h.checkPage(18);
    doc.setFontSize(11);
    h.setFont('bold');
    doc.setTextColor(...NEAR_BLACK);
    doc.text(`${title}:`, h.margin + 4, h.getY());
    h.addY(8);

    doc.setFontSize(11);
    h.setFont('normal');
    const lineHeight = 6.5;
    for (const item of cleaned) {
      h.checkPage(16);
      doc.setFillColor(...bulletColor);
      doc.circle(h.margin + 8, h.getY() - 1.5, 1.2, 'F');
      doc.setTextColor(...DARK_GRAY);
      const lines: string[] = doc.splitTextToSize(item, h.cw - 18);
      doc.text(lines, h.margin + 14, h.getY());
      h.addY(lines.length * lineHeight);
    }
    h.addY(5);
  };

  // ── Render images ──
  const renderImages = async (images: string[] | null) => {
    const urls = (images || []).filter(s => s.trim());
    for (const imgUrl of urls) {
      const image = await loadImageAsset(imgUrl);
      if (!image) continue;

      let imgWidth = h.cw * 0.88;
      let imgHeight = (image.height / image.width) * imgWidth;
      const maxH = h.ph * 0.45;
      if (imgHeight > maxH) {
        imgWidth *= maxH / imgHeight;
        imgHeight = maxH;
      }

      const imgX = h.margin + (h.cw - imgWidth) / 2;
      h.checkPage(imgHeight + 16);

      try {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(imgX - 1, h.getY() - 1, imgWidth + 2, imgHeight + 2, 'S');
        doc.addImage(image.dataUrl, image.format, imgX, h.getY(), imgWidth, imgHeight, undefined, 'FAST');
        h.addY(imgHeight + 12);
      } catch { /* skip broken */ }
    }
  };

  // ── Iterate categories ──
  for (const category of CATEGORY_ORDER) {
    const categoryTabs = category.subTabs.map(st => tabMap.get(st)).filter(Boolean) as TabData[];
    if (!categoryTabs.some(hasContent)) continue;

    // Category Header: green background bar
    h.checkPage(32);
    doc.setFillColor(...GREEN);
    doc.rect(h.margin, h.getY() - 7, h.cw, 14, 'F');
    doc.setFontSize(20);
    h.setFont('bold');
    doc.setTextColor(255, 255, 255);
    doc.text(GROUP_NAMES[category.key] || category.key.toUpperCase(), h.margin + 6, h.getY() + 2);
    doc.setTextColor(...DARK_GRAY);
    h.addY(18);

    // Sub-tabs
    for (const subKey of category.subTabs) {
      const tab = tabMap.get(subKey);
      if (!tab || !hasContent(tab)) continue;

      // Sub-header
      h.checkPage(22);
      doc.setFontSize(16);
      h.setFont('bold');
      doc.setTextColor(...NEAR_BLACK);
      const subLabel = subTabLabels[subKey] || subKey;
      doc.text(subLabel, h.margin, h.getY());
      h.addY(3);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.6);
      doc.line(h.margin, h.getY(), h.margin + doc.getTextWidth(subLabel) * 1.05, h.getY());
      doc.setTextColor(...DARK_GRAY);
      h.addY(10);

      // Diziliş
      if (tab.formation) {
        doc.setFontSize(11);
        h.setFont('bold');
        const formLabel = `${tDizilis}: `;
        doc.text(formLabel, h.margin + 2, h.getY());
        h.setFont('normal');
        doc.text(tab.formation, h.margin + 2 + doc.getTextWidth(formLabel), h.getY());
        h.addY(10);
      }

      // Text sections: General with Tactical Blue, Pros green, Cons red
      renderBullets(tGeneralNotes, tab.general_notes, TACTICAL_BLUE);
      renderBullets(tPros, tab.pros, GREEN);
      renderBullets(tCons, tab.cons, RED_ACCENT);

      // Images after text
      await renderImages(tab.images);

      // Spacing between blocks (~25px)
      h.addY(9);
      h.checkPage(4);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.15);
      doc.line(h.margin + 10, h.getY(), h.pw - h.margin - 10, h.getY());
      h.addY(9);
    }

    h.addY(10);
  }

  // Add footers to all pages
  addPageFooter(doc, fontLoaded);

  doc.save(`${analysis.home_team}_vs_${analysis.away_team}.pdf`);
}

// ══════════════════════════════════════════
// ── Player PDF Export ──
// ══════════════════════════════════════════

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
  locale: string = 'tr',
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true });
  const fontLoaded = await setupFonts(doc);
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const cw = pw - margin * 2;

  const setFont = (style: 'normal' | 'bold') => {
    doc.setFont(fontLoaded ? 'NotoSans' : 'helvetica', style);
  };

  // ── COVER PAGE ──
  let y = 50;

  // Brand
  doc.setFontSize(14);
  setFont('bold');
  doc.setTextColor(...GREEN);
  const brandW = doc.getTextWidth(BRAND);
  doc.text(BRAND, (pw - brandW) / 2, y);
  y += 6;

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1.5);
  const lineW = 60;
  doc.line((pw - lineW) / 2, y, (pw + lineW) / 2, y);
  y += 25;

  // Scouting Report subtitle
  doc.setFontSize(11);
  setFont('normal');
  doc.setTextColor(...LIGHT_GRAY);
  const subtitle = locale === 'tr' ? 'OYUNCU İZLEME RAPORU' : 'SCOUTING REPORT';
  const stw = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pw - stw) / 2, y);
  y += 14;

  // Player name
  doc.setFontSize(28);
  setFont('bold');
  doc.setTextColor(...NEAR_BLACK);
  const nameW = doc.getTextWidth(player.name);
  doc.text(player.name, (pw - nameW) / 2, y);
  y += 14;

  // Team and position below name
  doc.setFontSize(12);
  setFont('normal');
  doc.setTextColor(...LIGHT_GRAY);
  const teamPos = [player.current_team, player.primary_position].filter(Boolean).join(' · ');
  if (teamPos) {
    const tpw = doc.getTextWidth(teamPos);
    doc.text(teamPos, (pw - tpw) / 2, y);
  }
  y += 20;

  // Bottom green bar on cover
  doc.setFillColor(...GREEN);
  doc.rect(margin, ph - 30, cw, 3, 'F');
  doc.setFontSize(8);
  setFont('normal');
  doc.setTextColor(...LIGHT_GRAY);
  const ftw = doc.getTextWidth(BRAND);
  doc.text(BRAND, (pw - ftw) / 2, ph - 18);

  // ── DATA PAGE ──
  doc.addPage();
  addPageHeader(doc, fontLoaded, pw, margin);
  y = 30;

  // Green header bar with player name
  doc.setFillColor(...GREEN);
  doc.rect(margin, y - 7, cw, 14, 'F');
  doc.setFontSize(18);
  setFont('bold');
  doc.setTextColor(255, 255, 255);
  doc.text(player.name, margin + 6, y + 1);
  doc.setTextColor(...DARK_GRAY);
  y += 18;

  // Thin divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pw - margin, y);
  y += 14;

  // Data rows with proper line height (no overlap)
  const rowHeight = 11; // ~1.6 line height at 11pt

  const addRow = (label: string, value: string | null | undefined) => {
    if (!value) return;
    if (y + rowHeight > ph - 25) {
      doc.addPage();
      addPageHeader(doc, fontLoaded, pw, margin);
      y = 30;
    }
    doc.setFontSize(11);
    setFont('bold');
    doc.setTextColor(...NEAR_BLACK);
    const labelText = `${label}: `;
    doc.text(labelText, margin, y);
    setFont('normal');
    doc.setTextColor(...DARK_GRAY);
    doc.text(value, margin + doc.getTextWidth(labelText), y);
    y += rowHeight;
  };

  addRow(labels.currentTeam, player.current_team);
  addRow(labels.league, player.league);
  addRow(labels.primaryPosition, player.primary_position);
  addRow(labels.secondaryPosition, player.secondary_position);
  addRow(labels.preferredFoot, player.preferred_foot);
  addRow(labels.birthDate, formatDate(player.birth_date, locale));
  if (player.transfermarkt_link) addRow('Transfermarkt', player.transfermarkt_link);

  // Add footers
  addPageFooter(doc, fontLoaded);

  doc.save(`${player.name}.pdf`);
}
