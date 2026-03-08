import jsPDF from 'jspdf';

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

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Use multiple CDN sources for Turkish-compatible Noto Sans
const FONT_URLS = {
  regular: [
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-400-normal.ttf',
    'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNr5TRA.ttf',
  ],
  bold: [
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-700-normal.ttf',
    'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNjXhFVZNyB.ttf',
  ],
};

async function loadFontWithFallback(urls: string[]): Promise<string> {
  for (const url of urls) {
    try {
      return await loadFontBase64(url);
    } catch {
      console.warn(`Font load failed for ${url}, trying next...`);
    }
  }
  throw new Error('All font sources failed');
}

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
    console.error('Font setup failed, using fallback:', e);
    return false;
  }
}

function createPdfHelpers(doc: jsPDF, fontLoaded: boolean) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const setFont = (style: 'normal' | 'bold') => {
    if (fontLoaded) doc.setFont('NotoSans', style);
    else doc.setFont('helvetica', style);
  };

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  const getY = () => y;
  const setY = (val: number) => { y = val; };
  const addY = (val: number) => { y += val; };

  return { pageWidth, pageHeight, margin, contentWidth, setFont, checkPage, getY, setY, addY };
}

export async function exportAnalysisPdf(
  analysis: AnalysisData,
  tabsData: TabData[],
  labels: Record<string, string>,
  tTarget: string,
  tFormation: string,
  tGeneralNotes: string,
  tPros: string,
  tCons: string,
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true });
  const fontLoaded = await setupFonts(doc);
  const h = createPdfHelpers(doc, fontLoaded);

  // ── Title ──
  doc.setFontSize(18);
  h.setFont('bold');
  doc.text(`${analysis.home_team} vs ${analysis.away_team}`, h.margin, h.getY());
  h.addY(9);

  doc.setFontSize(10);
  h.setFont('normal');
  const targetName = analysis.target_team === 'home' ? analysis.home_team : analysis.away_team;
  doc.text(`${analysis.match_date}  |  ${tTarget}: ${targetName}`, h.margin, h.getY());
  h.addY(10);

  doc.setDrawColor(160);
  doc.setLineWidth(0.5);
  doc.line(h.margin, h.getY(), h.pageWidth - h.margin, h.getY());
  h.addY(10);

  // ── Sections ──
  for (const tab of tabsData) {
    h.checkPage(25);
    const label = labels[tab.sub_tab || ''] || labels[tab.tab_type] || `${tab.tab_type}/${tab.sub_tab}`;

    // Section heading with background highlight
    doc.setFillColor(34, 139, 34); // Grass Green
    doc.rect(h.margin, h.getY() - 5, h.contentWidth, 8, 'F');
    doc.setFontSize(12);
    h.setFont('bold');
    doc.setTextColor(255, 255, 255);
    doc.text(label, h.margin + 3, h.getY());
    doc.setTextColor(0, 0, 0);
    h.addY(8);

    // Formation
    if (tab.formation) {
      doc.setFontSize(9);
      h.setFont('bold');
      doc.text(`${tFormation}: `, h.margin, h.getY());
      h.setFont('normal');
      const fmtWidth = doc.getTextWidth(`${tFormation}: `);
      doc.text(tab.formation, h.margin + fmtWidth, h.getY());
      h.addY(7);
    }

    // ── Text bullet sections ──
    const renderBullets = (title: string, items: string[] | null) => {
      const cleaned = (items || []).filter(s => s.trim() !== '');
      if (cleaned.length === 0) return;

      h.checkPage(14);
      doc.setFontSize(10);
      h.setFont('bold');
      doc.text(`${title}:`, h.margin, h.getY());
      h.addY(6);

      doc.setFontSize(9);
      h.setFont('normal');
      for (const item of cleaned) {
        h.checkPage(12);
        const bulletText = `\u2022  ${item}`;
        const lines: string[] = doc.splitTextToSize(bulletText, h.contentWidth - 8);
        doc.text(lines, h.margin + 4, h.getY());
        h.addY(lines.length * 5);
      }
      h.addY(3);
    };

    // CRITICAL: Render ALL text before ANY images
    renderBullets(tGeneralNotes, tab.general_notes);
    renderBullets(tPros, tab.pros);
    renderBullets(tCons, tab.cons);

    // ── Images AFTER text ──
    const allImages = tab.images || [];
    for (const imgUrl of allImages) {
      const dataUrl = await loadImageAsBase64(imgUrl);
      if (!dataUrl) continue;

      // Calculate dimensions maintaining aspect ratio at 85% width
      const imgWidth = h.contentWidth * 0.85;
      const imgHeight = imgWidth * 0.6; // 5:3 default aspect
      h.checkPage(imgHeight + 10);

      try {
        doc.addImage(dataUrl, 'JPEG', h.margin, h.getY(), imgWidth, imgHeight);
        h.addY(imgHeight + 6);
      } catch {
        // skip broken images silently
      }
    }

    // Section divider
    h.addY(4);
    h.checkPage(5);
    doc.setDrawColor(210);
    doc.setLineWidth(0.3);
    doc.line(h.margin, h.getY(), h.pageWidth - h.margin, h.getY());
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
    if (fontLoaded) doc.setFont('NotoSans', style);
    else doc.setFont('helvetica', style);
  };

  // Title bar
  doc.setFillColor(34, 139, 34);
  doc.rect(margin, y - 7, pageWidth - margin * 2, 12, 'F');
  doc.setFontSize(16);
  setFont('bold');
  doc.setTextColor(255, 255, 255);
  doc.text(player.name, margin + 4, y);
  doc.setTextColor(0, 0, 0);
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
  if (player.transfermarkt_link) {
    addRow('Transfermarkt', player.transfermarkt_link);
  }

  doc.save(`${player.name}.pdf`);
}
