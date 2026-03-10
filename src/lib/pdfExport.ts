import jsPDF from 'jspdf';
import { localizePosition, localizePositionAbbr } from '@/lib/positionMap';

// ── Constants ──
const BRAND = 'COACHING ENGINEERING';
const GREEN: [number, number, number] = [34, 139, 34];
const TACTICAL_BLUE: [number, number, number] = [30, 64, 175];
const DARK_GRAY: [number, number, number] = [31, 41, 55];
const NEAR_BLACK: [number, number, number] = [26, 26, 26];
const RED_ACCENT: [number, number, number] = [180, 40, 40];
const LIGHT_GRAY: [number, number, number] = [107, 114, 128];

// Dark mode colors
const DARK_BG: [number, number, number] = [30, 30, 30];
const DARK_CARD: [number, number, number] = [42, 42, 42];
const DARK_TEXT: [number, number, number] = [230, 230, 230];
const DARK_MUTED: [number, number, number] = [160, 160, 160];

const SPC = ' ';

function cleanVal(v: string | null | undefined): string {
  if (!v) return '';
  return v.replace(/\\n/g, ' ').replace(/"/g, '').replace(/\n/g, ' ').trim();
}

const footLabelTR_pdf: Record<string, string> = { Right: 'Sağ', Left: 'Sol', Both: 'Her İki Ayak' };
function localizeFootPdf(foot: string | null | undefined, locale: string): string {
  if (!foot) return '';
  if (locale === 'tr') return footLabelTR_pdf[foot] || foot;
  return foot;
}

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

function formatDate(dateStr: string | null | undefined, _locale: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
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
  const checkPage = (needed: number, dark = false) => {
    if (y + needed > ph - 25) {
      doc.addPage();
      y = 25;
      if (dark) {
        doc.setFillColor(...DARK_BG);
        doc.rect(0, 0, pw, ph, 'F');
      }
      addPageHeader(doc, fontLoaded, pw, margin, dark);
    }
  };
  const getY = () => y;
  const setY = (v: number) => { y = v; };
  const addY = (v: number) => { y += v; };

  return { pw, ph, margin, cw, setFont, checkPage, getY, setY, addY };
}

function addPageHeader(doc: jsPDF, fontLoaded: boolean, pw: number, margin: number, dark = false) {
  const fn = fontLoaded ? 'NotoSans' : 'helvetica';
  if (dark) {
    doc.setFillColor(...DARK_BG);
    doc.rect(0, 0, pw, doc.internal.pageSize.getHeight(), 'F');
  }
  doc.setFont(fn, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...(dark ? DARK_MUTED : LIGHT_GRAY));
  doc.text(BRAND, margin, 12);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.line(margin, 15, pw - margin, 15);
  doc.setTextColor(...(dark ? DARK_TEXT : DARK_GRAY));
}

function addPageFooter(doc: jsPDF, fontLoaded: boolean, locale: string = 'tr', analystName?: string) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const fn = fontLoaded ? 'NotoSans' : 'helvetica';
  const totalPages = (doc as any).internal.getNumberOfPages();
  const pageLabel = locale === 'tr' ? 'Sayfa' : 'Page';
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont(fn, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...LIGHT_GRAY);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(15, ph - 14, pw - 15, ph - 14);

    // Centered analyst name
    if (analystName) {
      const prepLabel = `Hazırlayan: ${analystName}`;
      const prepW = doc.getTextWidth(prepLabel);
      doc.text(prepLabel, (pw - prepW) / 2, ph - 8);
    }

    doc.text(BRAND, 15, ph - 8);
    const rightText = `${pageLabel} ${i} / ${totalPages}`;
    doc.text(rightText, pw - 15, ph - 8, { align: 'right' });
  }
}

async function renderCoverPage(
  doc: jsPDF, h: ReturnType<typeof createHelpers>, fontLoaded: boolean,
  title: string, subtitle: string, metaLines: string[], analystName?: string, dark = false,
) {
  if (dark) {
    doc.setFillColor(...DARK_BG);
    doc.rect(0, 0, h.pw, h.ph, 'F');
  }

  const logoImage = await loadImageAsset('/images/logo.png');
  if (logoImage) {
    const logoSize = 30;
    const logoX = (h.pw - logoSize) / 2;
    doc.addImage(logoImage.dataUrl, logoImage.format, logoX, 20, logoSize, logoSize, undefined, 'FAST');
    h.setY(58);
  } else {
    h.setY(50);
  }

  doc.setFontSize(14);
  h.setFont('bold');
  doc.setTextColor(...GREEN);
  const brandW = doc.getTextWidth(BRAND);
  doc.text(BRAND, (h.pw - brandW) / 2, h.getY());
  h.addY(6);

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1.5);
  const lineW = 60;
  doc.line((h.pw - lineW) / 2, h.getY(), (h.pw + lineW) / 2, h.getY());
  h.addY(20);

  doc.setFontSize(11);
  h.setFont('normal');
  doc.setTextColor(...(dark ? DARK_MUTED : LIGHT_GRAY));
  const stw = doc.getTextWidth(subtitle);
  doc.text(subtitle, (h.pw - stw) / 2, h.getY());
  h.addY(14);

  doc.setFontSize(28);
  h.setFont('bold');
  doc.setTextColor(...(dark ? DARK_TEXT : NEAR_BLACK));
  const titleLines: string[] = doc.splitTextToSize(title, h.cw - 20);
  for (const line of titleLines) {
    const tw = doc.getTextWidth(line);
    doc.text(line, (h.pw - tw) / 2, h.getY());
    h.addY(14);
  }
  h.addY(8);

  doc.setFontSize(12);
  h.setFont('normal');
  doc.setTextColor(...(dark ? DARK_MUTED : LIGHT_GRAY));
  for (const ml of metaLines) {
    const mw = doc.getTextWidth(ml);
    doc.text(ml, (h.pw - mw) / 2, h.getY());
    h.addY(8);
  }

  if (analystName) {
    h.addY(6);
    doc.setFontSize(10);
    h.setFont('normal');
    doc.setTextColor(...(dark ? DARK_MUTED : LIGHT_GRAY));
    const prepLabel = `Hazırlayan: ${analystName}`;
    const pw2 = doc.getTextWidth(prepLabel);
    doc.text(prepLabel, (h.pw - pw2) / 2, h.getY());
    h.addY(8);
  }

  doc.setFillColor(...GREEN);
  doc.rect(h.margin, h.ph - 30, h.cw, 3, 'F');
  doc.setFontSize(8);
  h.setFont('normal');
  doc.setTextColor(...(dark ? DARK_MUTED : LIGHT_GRAY));
  const ftw = doc.getTextWidth(BRAND);
  doc.text(BRAND, (h.pw - ftw) / 2, h.ph - 18);
}

// ── Radar Chart Drawing ──

function drawRadarChart(
  doc: jsPDF, h: ReturnType<typeof createHelpers>,
  data: { label: string; value: number }[],
  cx: number, cy: number, radius: number, dark = false,
) {
  const n = data.length;
  if (n < 3) return;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  // Draw grid circles
  for (let level = 1; level <= 5; level++) {
    const r = (level / 5) * radius;
    doc.setDrawColor(...(dark ? [70, 70, 70] as [number, number, number] : [220, 220, 220] as [number, number, number]));
    doc.setLineWidth(0.2);
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    for (let i = 0; i < pts.length; i++) {
      const next = (i + 1) % pts.length;
      doc.line(pts[i][0], pts[i][1], pts[next][0], pts[next][1]);
    }
  }

  // Draw axes
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const ex = cx + radius * Math.cos(angle);
    const ey = cy + radius * Math.sin(angle);
    doc.setDrawColor(...(dark ? [80, 80, 80] as [number, number, number] : [200, 200, 200] as [number, number, number]));
    doc.setLineWidth(0.2);
    doc.line(cx, cy, ex, ey);

    // Labels
    const labelR = radius + 8;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    doc.setFontSize(7);
    h.setFont('bold');
    doc.setTextColor(...(dark ? DARK_MUTED : LIGHT_GRAY));
    const align = Math.abs(Math.cos(angle)) < 0.1 ? 'center' : Math.cos(angle) > 0 ? 'left' : 'right';
    doc.text(data[i].label, lx, ly + 2, { align: align as any });
  }

  // Draw data polygon
  const dataPts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const r = (data[i].value / 5) * radius;
    dataPts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }

  // Fill
  doc.setFillColor(34, 139, 34);
  doc.setGState(new (doc as any).GState({ opacity: 0.2 }));
  const path = dataPts.map((p, i) => (i === 0 ? `${p[0]} ${p[1]} m` : `${p[0]} ${p[1]} l`)).join(' ') + ' h';
  // Use lines approach instead
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Outline
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.8);
  for (let i = 0; i < dataPts.length; i++) {
    const next = (i + 1) % dataPts.length;
    doc.line(dataPts[i][0], dataPts[i][1], dataPts[next][0], dataPts[next][1]);
  }

  // Points
  for (const pt of dataPts) {
    doc.setFillColor(...GREEN);
    doc.circle(pt[0], pt[1], 1.2, 'F');
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
  analystName?: string,
  darkMode: boolean = false,
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true });
  const fontLoaded = await setupFonts(doc);
  const h = createHelpers(doc, fontLoaded);

  const dark = darkMode;
  const textColor: [number, number, number] = dark ? DARK_TEXT : NEAR_BLACK;

  const GROUP_NAMES: Record<string, string> = {
    defense: groupLabels?.defense || 'SAVUNMA',
    attack: groupLabels?.attack || 'HÜCUM',
    set_pieces: groupLabels?.setPieces || 'DURAN TOPLAR',
  };

  const targetName = analysis.target_team === 'home' ? analysis.home_team : analysis.away_team;
  const dateFormatted = formatDate(analysis.match_date, locale);
  await renderCoverPage(doc, h, fontLoaded,
    `${analysis.home_team} vs ${analysis.away_team}`,
    locale === 'tr' ? 'MAÇ ANALİZ RAPORU' : 'MATCH ANALYSIS REPORT',
    [`Odak Takım: ${targetName}`, dateFormatted],
    analystName,
    dark,
  );

  doc.addPage();
  if (dark) {
    doc.setFillColor(...DARK_BG);
    doc.rect(0, 0, h.pw, h.ph, 'F');
  }
  h.setY(25);
  addPageHeader(doc, fontLoaded, h.pw, h.margin, dark);

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

  const renderBullets = (title: string, items: string[] | null, bulletColor: [number, number, number]) => {
    const cleaned = (items || []).filter(s => s.trim() !== '');
    if (cleaned.length === 0) return;

    h.checkPage(18, dark);
    doc.setFontSize(11);
    h.setFont('bold');
    doc.setTextColor(...textColor);
    doc.text(`${title}:`, h.margin + 4, h.getY());
    h.addY(9);

    doc.setFontSize(11);
    h.setFont('normal');
    const lineHeight = 7.5;
    for (const item of cleaned) {
      h.checkPage(16, dark);
      doc.setFillColor(...bulletColor);
      doc.circle(h.margin + 8, h.getY() - 1.5, 1.2, 'F');
      doc.setTextColor(...(dark ? DARK_MUTED : DARK_GRAY));
      const lines: string[] = doc.splitTextToSize(cleanVal(item), h.cw - 18);
      doc.text(lines, h.margin + 14, h.getY());
      h.addY(lines.length * lineHeight);
    }
    h.addY(6);
  };

  const renderImages = async (images: string[] | null) => {
    const urls = (images || []).filter(s => s.trim());
    for (const imgUrl of urls) {
      const image = await loadImageAsset(imgUrl);
      if (!image) continue;

      let imgWidth = h.cw * 0.90;
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
        const snapLabel = 'Tactical Snapshot';
        doc.setFontSize(7);
        h.setFont('normal');
        doc.setFillColor(0, 0, 0);
        doc.setGState(new (doc as any).GState({ opacity: 0.5 }));
        doc.roundedRect(imgX + 2, h.getY() + imgHeight - 8, doc.getTextWidth(snapLabel) + 6, 7, 1, 1, 'F');
        doc.setGState(new (doc as any).GState({ opacity: 1 }));
        doc.setTextColor(255, 255, 255);
        doc.text(snapLabel, imgX + 5, h.getY() + imgHeight - 3);
        doc.setTextColor(...DARK_GRAY);
        h.addY(imgHeight + 14);
      } catch { /* skip broken */ }
    }
  };

  for (const category of CATEGORY_ORDER) {
    const categoryTabs = category.subTabs.map(st => tabMap.get(st)).filter(Boolean) as TabData[];
    if (!categoryTabs.some(hasContent)) continue;

    h.checkPage(32, dark);
    doc.setFillColor(...GREEN);
    doc.rect(h.margin, h.getY() - 7, h.cw, 14, 'F');
    doc.setFontSize(20);
    h.setFont('bold');
    doc.setTextColor(255, 255, 255);
    doc.text(GROUP_NAMES[category.key] || category.key.toUpperCase(), h.margin + 6, h.getY() + 2);
    doc.setTextColor(...textColor);
    h.addY(20);

    for (const subKey of category.subTabs) {
      const tab = tabMap.get(subKey);
      if (!tab || !hasContent(tab)) continue;

      h.checkPage(22, dark);
      doc.setFontSize(16);
      h.setFont('bold');
      doc.setTextColor(...textColor);
      const subLabel = subTabLabels[subKey] || subKey;
      doc.text(subLabel, h.margin, h.getY());
      h.addY(3);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.6);
      doc.line(h.margin, h.getY(), h.margin + doc.getTextWidth(subLabel) * 1.05, h.getY());
      doc.setTextColor(...(dark ? DARK_MUTED : DARK_GRAY));
      h.addY(12);

      if (tab.formation) {
        doc.setFontSize(11);
        h.setFont('bold');
        doc.setTextColor(...textColor);
        doc.text(`${tDizilis}:${SPC}`, h.margin + 2, h.getY());
        const labelW = doc.getTextWidth(`${tDizilis}:${SPC}`);
        h.setFont('normal');
        doc.text(cleanVal(tab.formation), h.margin + 2 + labelW, h.getY());
        h.addY(12);
      }

      renderBullets(tGeneralNotes, tab.general_notes, TACTICAL_BLUE);
      renderBullets(tPros, tab.pros, GREEN);
      renderBullets(tCons, tab.cons, RED_ACCENT);
      await renderImages(tab.images);

      h.addY(9);
      h.checkPage(4, dark);
      doc.setDrawColor(...(dark ? [60, 60, 60] as [number, number, number] : [220, 220, 220] as [number, number, number]));
      doc.setLineWidth(0.15);
      doc.line(h.margin + 10, h.getY(), h.pw - h.margin - 10, h.getY());
      h.addY(9);
    }

    h.addY(12);
  }

  addPageFooter(doc, fontLoaded, locale, analystName);
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
  technical_rating?: number | null;
  tactical_rating?: number | null;
  physical_rating?: number | null;
  mental_rating?: number | null;
  tactical_iq_rating?: number | null;
  current_ability?: number | null;
  contract_status?: number | null;
  key_traits?: string[] | null;
  scout_note?: string | null;
  player_role?: string | null;
  squad_fit_notes?: string | null;
  squad_fit_percentage?: number | null;
  video_link?: string | null;
  market_value?: string | null;
  resale_potential?: number | null;
  injury_history?: string | null;
}

export async function exportPlayerPdf(
  player: PlayerData,
  labels: Record<string, string>,
  locale: string = 'tr',
  analystName?: string,
  darkMode: boolean = false,
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true });
  const fontLoaded = await setupFonts(doc);
  const h = createHelpers(doc, fontLoaded);

  const textColor: [number, number, number] = darkMode ? DARK_TEXT : NEAR_BLACK;
  const mutedColor: [number, number, number] = darkMode ? DARK_MUTED : LIGHT_GRAY;
  const bgAlt: [number, number, number] = darkMode ? DARK_CARD : [245, 245, 245];

  const posLocalized = localizePosition(player.primary_position, locale);
  const teamPos = [cleanVal(player.current_team), posLocalized].filter(Boolean).join(' · ');
  await renderCoverPage(doc, h, fontLoaded,
    cleanVal(player.name),
    locale === 'tr' ? 'OYUNCU İZLEME RAPORU' : 'SCOUTING REPORT',
    [teamPos, formatDate(new Date().toISOString(), locale)].filter(Boolean) as string[],
    analystName,
    darkMode,
  );

  // ── SCOUTING DASHBOARD PAGE ──
  doc.addPage();
  addPageHeader(doc, fontLoaded, h.pw, h.margin, darkMode);
  h.setY(30);

  if (darkMode) {
    doc.setFillColor(...DARK_BG);
    doc.rect(0, 0, h.pw, h.ph, 'F');
    addPageHeader(doc, fontLoaded, h.pw, h.margin, true);
  }

  // Green header bar
  doc.setFillColor(...GREEN);
  doc.rect(h.margin, h.getY() - 7, h.cw, 14, 'F');
  doc.setFontSize(18);
  h.setFont('bold');
  doc.setTextColor(255, 255, 255);
  doc.text(cleanVal(player.name), h.margin + 6, h.getY() + 1);
  doc.setTextColor(...textColor);
  h.addY(18);

  // ── Key Traits Badges ──
  const traits = (player.key_traits || []).filter(Boolean);
  if (traits.length > 0) {
    const traitLabels = traits.map(t => labels[t] || t);
    const badgeH = 8;
    const badgePad = 6;
    const badgeGap = 4;
    let bx = h.margin;
    doc.setFontSize(8);
    h.setFont('bold');
    for (const tl of traitLabels) {
      const tw = doc.getTextWidth(tl);
      const bw = tw + badgePad * 2;
      if (bx + bw > h.pw - h.margin) {
        h.addY(12);
        bx = h.margin;
      }
      doc.setFillColor(...GREEN);
      doc.roundedRect(bx, h.getY() - 5, bw, badgeH, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(tl, bx + badgePad, h.getY());
      bx += bw + badgeGap;
    }
    doc.setTextColor(...textColor);
    h.addY(14);
  }

  // Divider
  doc.setDrawColor(...(darkMode ? [60, 60, 60] as [number, number, number] : [200, 200, 200] as [number, number, number]));
  doc.setLineWidth(0.3);
  doc.line(h.margin, h.getY(), h.pw - h.margin, h.getY());
  h.addY(12);

  // ── 2-column grid for player attributes ──
  const attrs: { label: string; value: string }[] = [];
  if (player.current_team) attrs.push({ label: labels.currentTeam, value: cleanVal(player.current_team) });
  if (player.league) attrs.push({ label: labels.league, value: cleanVal(player.league) });
  if (player.primary_position) attrs.push({ label: labels.primaryPosition, value: localizePosition(player.primary_position, locale) });
  if (player.player_role) attrs.push({ label: labels.playerRole || (locale === 'tr' ? 'Oyuncu Rolü' : 'Player Role'), value: cleanVal(player.player_role) });
  if (player.secondary_position) attrs.push({ label: labels.secondaryPosition, value: localizePosition(player.secondary_position, locale) });
  if (player.preferred_foot) attrs.push({ label: labels.preferredFoot, value: localizeFootPdf(player.preferred_foot, locale) });
  if (player.birth_date) attrs.push({ label: labels.birthDate, value: formatDate(player.birth_date, locale) });
  if (player.market_value) attrs.push({ label: labels.marketValue || (locale === 'tr' ? 'Piyasa Değeri' : 'Market Value'), value: cleanVal(player.market_value) });

  const colW = (h.cw - 10) / 2;
  const labelColW = 55;
  const rowH = 16;

  for (let i = 0; i < attrs.length; i += 2) {
    h.checkPage(rowH + 4, darkMode);
    const rowIdx = Math.floor(i / 2);

    if (rowIdx % 2 === 0) {
      doc.setFillColor(...bgAlt);
      doc.rect(h.margin, h.getY() - 5, h.cw, rowH, 'F');
    }

    doc.setFontSize(9);
    h.setFont('bold');
    doc.setTextColor(...mutedColor);
    doc.text(attrs[i].label + ':', h.margin + 4, h.getY());
    h.setFont('normal');
    doc.setTextColor(...textColor);
    const leftVal = doc.splitTextToSize(attrs[i].value, colW - labelColW - 8);
    doc.text(leftVal, h.margin + labelColW, h.getY());

    if (i + 1 < attrs.length) {
      const rightX = h.margin + colW + 10;
      h.setFont('bold');
      doc.setTextColor(...mutedColor);
      doc.text(attrs[i + 1].label + ':', rightX, h.getY());
      h.setFont('normal');
      doc.setTextColor(...textColor);
      const rightVal = doc.splitTextToSize(attrs[i + 1].value, colW - labelColW - 8);
      doc.text(rightVal, rightX + labelColW, h.getY());
    }

    h.addY(rowH);
  }

  // ── Radar Chart ──
  const radarData = [
    { label: labels.technical || 'Teknik', value: player.technical_rating || 0 },
    { label: labels.tactical || 'Taktiksel', value: player.tactical_rating || 0 },
    { label: labels.physical || 'Fiziksel', value: player.physical_rating || 0 },
    { label: labels.mental || 'Zihinsel', value: player.mental_rating || 0 },
  ];
  if (radarData.some(d => d.value > 0)) {
    h.addY(8);
    h.checkPage(80, darkMode);
    doc.setDrawColor(...(darkMode ? [60, 60, 60] as [number, number, number] : [200, 200, 200] as [number, number, number]));
    doc.setLineWidth(0.3);
    doc.line(h.margin, h.getY(), h.pw - h.margin, h.getY());
    h.addY(10);

    doc.setFontSize(12);
    h.setFont('bold');
    doc.setTextColor(...textColor);
    doc.text(labels.radarChart || (locale === 'tr' ? 'Performans Radarı' : 'Performance Radar'), h.margin, h.getY());
    h.addY(8);

    const chartCx = h.pw / 2;
    const chartCy = h.getY() + 28;
    drawRadarChart(doc, h, radarData, chartCx, chartCy, 25, darkMode);
    h.addY(65);
  }

  // ── Skill Ratings (Progress Bars) ──
  const ratings = [
    { label: labels.technical || 'Teknik', value: player.technical_rating || 0 },
    { label: labels.tactical || 'Taktiksel', value: player.tactical_rating || 0 },
    { label: labels.physical || 'Fiziksel', value: player.physical_rating || 0 },
    { label: labels.mental || 'Zihinsel', value: player.mental_rating || 0 },
    { label: labels.tacticalIQ || 'Oyun Bilgisi', value: player.tactical_iq_rating || 0 },
    { label: labels.currentAbility || (locale === 'tr' ? 'Mevcut Yetenek' : 'Current Ability'), value: player.current_ability || 0 },
    { label: labels.potentialAbility || (locale === 'tr' ? 'Potansiyel Yetenek' : 'Potential Ability'), value: player.contract_status || 0 },
    { label: labels.resalePotential || (locale === 'tr' ? 'Yeniden Satış Potansiyeli' : 'Resale Potential'), value: player.resale_potential || 0 },
  ];
  const hasRatings = ratings.some(r => r.value > 0);

  if (hasRatings) {
    h.addY(8);
    h.checkPage(50, darkMode);
    doc.setDrawColor(...(darkMode ? [60, 60, 60] as [number, number, number] : [200, 200, 200] as [number, number, number]));
    doc.setLineWidth(0.3);
    doc.line(h.margin, h.getY(), h.pw - h.margin, h.getY());
    h.addY(10);

    doc.setFontSize(12);
    h.setFont('bold');
    doc.setTextColor(...textColor);
    doc.text(labels.skillRatings || (locale === 'tr' ? 'Yetenek Puanları' : 'Skill Ratings'), h.margin, h.getY());
    h.addY(12);

    const barW = h.cw - labelColW - 30;
    const barH = 5;

    for (const rating of ratings) {
      if (rating.value === 0) continue;
      h.checkPage(18, darkMode);
      doc.setFontSize(10);
      h.setFont('bold');
      doc.setTextColor(...mutedColor);
      doc.text(rating.label + ':', h.margin + 4, h.getY());

      h.setFont('bold');
      doc.setTextColor(...textColor);
      doc.text(`${rating.value}/5`, h.pw - h.margin - 10, h.getY());

      const barX = h.margin + labelColW + 10;
      const barY = h.getY() - 3.5;
      doc.setFillColor(...(darkMode ? [60, 60, 60] as [number, number, number] : [230, 230, 230] as [number, number, number]));
      doc.roundedRect(barX, barY, barW, barH, 1.5, 1.5, 'F');

      const fillW = (rating.value / 5) * barW;
      if (fillW > 0) {
        doc.setFillColor(...GREEN);
        doc.roundedRect(barX, barY, fillW, barH, 1.5, 1.5, 'F');
      }

      h.addY(14);
    }
  }

  // ── Squad Fit ──
  if ((player.squad_fit_percentage && player.squad_fit_percentage > 0) || player.squad_fit_notes) {
    h.addY(8);
    h.checkPage(40, darkMode);
    doc.setDrawColor(...(darkMode ? [60, 60, 60] as [number, number, number] : [200, 200, 200] as [number, number, number]));
    doc.setLineWidth(0.3);
    doc.line(h.margin, h.getY(), h.pw - h.margin, h.getY());
    h.addY(10);

    doc.setFontSize(12);
    h.setFont('bold');
    doc.setTextColor(...textColor);
    doc.text(labels.squadFit || (locale === 'tr' ? 'Kadro Uyumu' : 'Squad Fit'), h.margin, h.getY());
    h.addY(12);

    if (player.squad_fit_percentage && player.squad_fit_percentage > 0) {
      doc.setFontSize(10);
      h.setFont('bold');
      doc.setTextColor(...mutedColor);
      doc.text(`${labels.squadFitPercentage || 'Uyum'}:`, h.margin + 4, h.getY());

      doc.setTextColor(...textColor);
      doc.text(`%${player.squad_fit_percentage}`, h.margin + labelColW, h.getY());

      const barX = h.margin + labelColW + 20;
      const barW2 = h.cw - labelColW - 30;
      const barY = h.getY() - 3.5;
      doc.setFillColor(...(darkMode ? [60, 60, 60] as [number, number, number] : [230, 230, 230] as [number, number, number]));
      doc.roundedRect(barX, barY, barW2, 5, 1.5, 1.5, 'F');
      const fillW = (player.squad_fit_percentage / 100) * barW2;
      if (fillW > 0) {
        doc.setFillColor(...GREEN);
        doc.roundedRect(barX, barY, fillW, 5, 1.5, 1.5, 'F');
      }
      h.addY(12);
    }

    if (player.squad_fit_notes) {
      doc.setFontSize(10);
      h.setFont('normal');
      doc.setTextColor(...(darkMode ? DARK_MUTED : DARK_GRAY));
      const fitLines: string[] = doc.splitTextToSize(cleanVal(player.squad_fit_notes), h.cw - 8);
      for (const line of fitLines) {
        h.checkPage(8, darkMode);
  if (player.injury_history) {
    h.addY(8);
    h.checkPage(30, darkMode);
    doc.text(`⚠ ${labels.injuryHistory || (locale === 'tr' ? 'Sakatlık Geçmişi' : 'Injury History')}`, h.margin, h.getY());
    h.addY(10);

    doc.setFontSize(10);
    h.setFont('normal');
    doc.setTextColor(...(darkMode ? DARK_MUTED : DARK_GRAY));
    const injLines: string[] = doc.splitTextToSize(cleanVal(player.injury_history), h.cw - 8);
    for (const line of injLines) {
      h.checkPage(8, darkMode);
  if (player.scout_note) {
    h.addY(8);
    h.checkPage(30);
    doc.setDrawColor(...(darkMode ? [60, 60, 60] as [number, number, number] : [200, 200, 200] as [number, number, number]));
    doc.setLineWidth(0.3);
    doc.line(h.margin, h.getY(), h.pw - h.margin, h.getY());
    h.addY(10);

    doc.setFontSize(12);
    h.setFont('bold');
    doc.setTextColor(...textColor);
    doc.text(labels.scoutNote || (locale === 'tr' ? 'Scout Final Görüşü' : 'Scout Final Opinion'), h.margin, h.getY());
    h.addY(10);

    doc.setFontSize(10);
    h.setFont('normal');
    doc.setTextColor(...(darkMode ? DARK_MUTED : DARK_GRAY));
    const noteLines: string[] = doc.splitTextToSize(cleanVal(player.scout_note), h.cw - 8);
    for (const line of noteLines) {
      h.checkPage(8);
      doc.text(line, h.margin + 4, h.getY());
      h.addY(6);
    }
  }

  // ── Video Link ──
  if (player.video_link) {
    h.addY(8);
    h.checkPage(20);
    doc.setFillColor(...GREEN);
    const btnLabel = labels.watchVideo || (locale === 'tr' ? 'Videoyu İzle' : 'Watch Video');
    doc.setFontSize(10);
    h.setFont('bold');
    const btnW = doc.getTextWidth(btnLabel) + 20;
    const btnH = 10;
    const btnX = h.margin;
    doc.roundedRect(btnX, h.getY() - 6, btnW, btnH, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.textWithLink(btnLabel, btnX + 10, h.getY(), { url: player.video_link });
    h.addY(16);
  }

  // ── Transfermarkt link ──
  if (player.transfermarkt_link) {
    h.addY(4);
    h.checkPage(rowH + 4);
    doc.setFontSize(10);
    h.setFont('bold');
    doc.setTextColor(...mutedColor);
    doc.text('Transfermarkt:', h.margin + 4, h.getY());
    h.setFont('normal');
    doc.setTextColor(...TACTICAL_BLUE);
    const linkText = cleanVal(player.transfermarkt_link);
    const maxLinkW = h.cw - labelColW - 8;
    let displayLink = linkText;
    if (doc.getTextWidth(displayLink) > maxLinkW) {
      while (doc.getTextWidth(displayLink + '…') > maxLinkW && displayLink.length > 10) {
        displayLink = displayLink.slice(0, -1);
      }
      displayLink += '…';
    }
    doc.textWithLink(displayLink, h.margin + labelColW + 10, h.getY(), { url: linkText });
    h.addY(rowH);
  }

  addPageFooter(doc, fontLoaded, locale, analystName);
  doc.save(`${cleanVal(player.name)}.pdf`);
}

// ══════════════════════════════════════════
// ── Squad PDF Export ──
// ══════════════════════════════════════════

interface SquadExportData {
  name: string;
  formation: string;
  playerNames: Record<number, string>;
}

const FORMATION_POSITIONS: Record<string, { label: string; x: number; y: number }[]> = {
  '3-4-3': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'CB', x: 25, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 75, y: 72 },
    { label: 'LM', x: 15, y: 50 }, { label: 'CM', x: 37, y: 52 }, { label: 'CM', x: 63, y: 52 }, { label: 'RM', x: 85, y: 50 },
    { label: 'LW', x: 20, y: 25 }, { label: 'ST', x: 50, y: 18 }, { label: 'RW', x: 80, y: 25 },
  ],
  '3-5-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'CB', x: 25, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 75, y: 72 },
    { label: 'LWB', x: 10, y: 50 }, { label: 'CM', x: 35, y: 52 }, { label: 'CDM', x: 50, y: 56 }, { label: 'CM', x: 65, y: 52 }, { label: 'RWB', x: 90, y: 50 },
    { label: 'ST', x: 37, y: 22 }, { label: 'ST', x: 63, y: 22 },
  ],
  '3-4-1-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'CB', x: 25, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 75, y: 72 },
    { label: 'LM', x: 15, y: 52 }, { label: 'CM', x: 37, y: 52 }, { label: 'CM', x: 63, y: 52 }, { label: 'RM', x: 85, y: 52 },
    { label: 'CAM', x: 50, y: 35 },
    { label: 'ST', x: 37, y: 20 }, { label: 'ST', x: 63, y: 20 },
  ],
  '3-1-4-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'CB', x: 25, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 75, y: 72 },
    { label: 'CDM', x: 50, y: 58 },
    { label: 'LM', x: 15, y: 45 }, { label: 'CM', x: 37, y: 45 }, { label: 'CM', x: 63, y: 45 }, { label: 'RM', x: 85, y: 45 },
    { label: 'ST', x: 37, y: 22 }, { label: 'ST', x: 63, y: 22 },
  ],
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
  '4-2-3-1': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CDM', x: 37, y: 55 }, { label: 'CDM', x: 63, y: 55 },
    { label: 'LW', x: 20, y: 38 }, { label: 'CAM', x: 50, y: 35 }, { label: 'RW', x: 80, y: 38 },
    { label: 'ST', x: 50, y: 18 },
  ],
  '4-1-4-1': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CDM', x: 50, y: 56 },
    { label: 'LM', x: 15, y: 40 }, { label: 'CM', x: 37, y: 42 }, { label: 'CM', x: 63, y: 42 }, { label: 'RM', x: 85, y: 40 },
    { label: 'ST', x: 50, y: 18 },
  ],
  '4-3-1-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CM', x: 30, y: 52 }, { label: 'CM', x: 50, y: 50 }, { label: 'CM', x: 70, y: 52 },
    { label: 'CAM', x: 50, y: 35 },
    { label: 'ST', x: 37, y: 20 }, { label: 'ST', x: 63, y: 20 },
  ],
  '4-3-2-1': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LB', x: 15, y: 70 }, { label: 'CB', x: 37, y: 72 }, { label: 'CB', x: 63, y: 72 }, { label: 'RB', x: 85, y: 70 },
    { label: 'CM', x: 30, y: 52 }, { label: 'CM', x: 50, y: 50 }, { label: 'CM', x: 70, y: 52 },
    { label: 'LW', x: 30, y: 32 }, { label: 'RW', x: 70, y: 32 },
    { label: 'ST', x: 50, y: 18 },
  ],
  '5-3-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LWB', x: 10, y: 68 }, { label: 'CB', x: 30, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 70, y: 72 }, { label: 'RWB', x: 90, y: 68 },
    { label: 'CM', x: 30, y: 48 }, { label: 'CM', x: 50, y: 45 }, { label: 'CM', x: 70, y: 48 },
    { label: 'ST', x: 37, y: 22 }, { label: 'ST', x: 63, y: 22 },
  ],
  '5-4-1': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LWB', x: 10, y: 68 }, { label: 'CB', x: 30, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 70, y: 72 }, { label: 'RWB', x: 90, y: 68 },
    { label: 'LM', x: 15, y: 45 }, { label: 'CM', x: 37, y: 47 }, { label: 'CM', x: 63, y: 47 }, { label: 'RM', x: 85, y: 45 },
    { label: 'ST', x: 50, y: 20 },
  ],
  '5-2-1-2': [
    { label: 'GK', x: 50, y: 90 },
    { label: 'LWB', x: 10, y: 68 }, { label: 'CB', x: 30, y: 72 }, { label: 'CB', x: 50, y: 75 }, { label: 'CB', x: 70, y: 72 }, { label: 'RWB', x: 90, y: 68 },
    { label: 'CM', x: 37, y: 50 }, { label: 'CM', x: 63, y: 50 },
    { label: 'CAM', x: 50, y: 35 },
    { label: 'ST', x: 37, y: 20 }, { label: 'ST', x: 63, y: 20 },
  ],
};

export async function exportSquadPdf(
  squad: SquadExportData,
  locale: string = 'tr',
  analystName?: string,
  darkMode: boolean = false,
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true });
  const fontLoaded = await setupFonts(doc);
  const h = createHelpers(doc, fontLoaded);

  const dark = darkMode;

  await renderCoverPage(doc, h, fontLoaded,
    squad.name,
    locale === 'tr' ? 'KADRO RAPORU' : 'SQUAD REPORT',
    [`${locale === 'tr' ? 'Diziliş' : 'Formation'}:${SPC}${squad.formation}`, formatDate(new Date().toISOString(), locale)],
    analystName,
    dark,
  );

  doc.addPage();
  addPageHeader(doc, fontLoaded, h.pw, h.margin, dark);
  h.setY(25);

  if (dark) {
    doc.setFillColor(...DARK_BG);
    doc.rect(0, 0, h.pw, h.ph, 'F');
    addPageHeader(doc, fontLoaded, h.pw, h.margin, true);
  }

  doc.setFontSize(18);
  h.setFont('bold');
  doc.setTextColor(...(dark ? DARK_TEXT : NEAR_BLACK));
  doc.text(`${squad.name} — ${squad.formation}`, h.margin, h.getY());
  h.addY(12);

  const pitchW = h.cw - 10;
  const pitchH = pitchW * (105 / 68);
  const maxPitchH = h.ph - h.getY() - 30;
  const finalPitchH = Math.min(pitchH, maxPitchH);
  const finalPitchW = finalPitchH * (68 / 105);
  const pX = h.margin + (h.cw - finalPitchW) / 2;
  const pY = h.getY();

  doc.setFillColor(34, 120, 34);
  doc.roundedRect(pX, pY, finalPitchW, finalPitchH, 3, 3, 'F');

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.rect(pX + 2, pY + 2, finalPitchW - 4, finalPitchH - 4, 'S');
  doc.line(pX + 2, pY + finalPitchH / 2, pX + finalPitchW - 2, pY + finalPitchH / 2);
  doc.circle(pX + finalPitchW / 2, pY + finalPitchH / 2, finalPitchW * 0.12, 'S');

  const penW = finalPitchW * 0.44;
  const penH = finalPitchH * 0.17;
  doc.rect(pX + (finalPitchW - penW) / 2, pY + 2, penW, penH, 'S');
  doc.rect(pX + (finalPitchW - penW) / 2, pY + finalPitchH - penH - 2, penW, penH, 'S');

  const positions = FORMATION_POSITIONS[squad.formation] || FORMATION_POSITIONS['4-3-3'];
  for (let idx = 0; idx < positions.length; idx++) {
    const pos = positions[idx];
    const cx = pX + (pos.x / 100) * finalPitchW;
    const cy = pY + (pos.y / 100) * finalPitchH;

    doc.setFillColor(255, 255, 255);
    doc.circle(cx, cy, 5, 'F');
    doc.setFillColor(...GREEN);
    doc.circle(cx, cy, 4.5, 'F');

    doc.setFontSize(7);
    h.setFont('bold');
    doc.setTextColor(255, 255, 255);
    const lbl = localizePositionAbbr(pos.label, locale);
    const lblW = doc.getTextWidth(lbl);
    doc.text(lbl, cx - lblW / 2, cy + 2.5);

    const name = squad.playerNames[idx];
    if (name) {
      doc.setFontSize(7);
      h.setFont('bold');
      doc.setTextColor(255, 255, 255);
      const nameW = doc.getTextWidth(name);
      doc.setFillColor(0, 0, 0);
      doc.setGState(new (doc as any).GState({ opacity: 0.5 }));
      doc.roundedRect(cx - nameW / 2 - 2, cy + 5, nameW + 4, 6, 1, 1, 'F');
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
      doc.text(name, cx - nameW / 2, cy + 9.5);
    }
  }

  addPageFooter(doc, fontLoaded, locale, analystName);
  doc.save(`${squad.name}.pdf`);
}
