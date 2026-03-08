import jsPDF from 'jspdf';

async function loadFontBase64(url: string): Promise<string> {
  const res = await fetch(url);
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

const NOTO_REGULAR = 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-400-normal.ttf';
const NOTO_BOLD = 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-700-normal.ttf';

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
      loadFontBase64(NOTO_REGULAR),
      loadFontBase64(NOTO_BOLD),
    ]);
    doc.addFileToVFS('NotoSans-Regular.ttf', regularB64);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.addFileToVFS('NotoSans-Bold.ttf', boldB64);
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
    doc.setFont('NotoSans', 'normal');
    return true;
  } catch {
    return false;
  }
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
  const doc = new jsPDF();
  const fontLoaded = await setupFonts(doc);

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

  // Title
  doc.setFontSize(18);
  setFont('bold');
  doc.text(`${analysis.home_team} vs ${analysis.away_team}`, margin, y);
  y += 9;

  doc.setFontSize(10);
  setFont('normal');
  const targetName = analysis.target_team === 'home' ? analysis.home_team : analysis.away_team;
  doc.text(`${analysis.match_date}  |  ${tTarget}: ${targetName}`, margin, y);
  y += 10;

  doc.setDrawColor(160);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  for (const tab of tabsData) {
    checkPage(25);
    const label = labels[tab.sub_tab || ''] || `${tab.tab_type}/${tab.sub_tab}`;

    // Section heading
    doc.setFontSize(13);
    setFont('bold');
    doc.text(label, margin, y);
    y += 8;

    if (tab.formation) {
      doc.setFontSize(9);
      setFont('normal');
      doc.text(`${tFormation}: ${tab.formation}`, margin, y);
      y += 7;
    }

    // Render text sections FIRST, then images
    const renderBullets = (title: string, items: string[] | null) => {
      const cleaned = (items || []).filter(s => s.trim() !== '');
      if (cleaned.length === 0) return;

      checkPage(14);
      doc.setFontSize(10);
      setFont('bold');
      doc.text(`${title}:`, margin, y);
      y += 6;

      doc.setFontSize(9);
      setFont('normal');
      for (const item of cleaned) {
        checkPage(10);
        const lines = doc.splitTextToSize(`\u2022  ${item}`, contentWidth - 8);
        doc.text(lines, margin + 4, y);
        y += lines.length * 5.5;
      }
      y += 3;
    };

    renderBullets(tGeneralNotes, tab.general_notes);
    renderBullets(tPros, tab.pros);
    renderBullets(tCons, tab.cons);

    // Render images AFTER all text for this section
    const allImages = tab.images || [];
    if (allImages.length > 0) {
      for (const imgUrl of allImages) {
        const dataUrl = await loadImageAsBase64(imgUrl);
        if (!dataUrl) continue;
        const imgWidth = contentWidth * 0.85;
        const imgHeight = imgWidth * 0.6;
        checkPage(imgHeight + 8);
        try {
          doc.addImage(dataUrl, 'JPEG', margin, y, imgWidth, imgHeight);
          y += imgHeight + 6;
        } catch {
          // skip broken images
        }
      }
    }

    y += 4;
    checkPage(5);
    doc.setDrawColor(210);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  doc.save(`${analysis.home_team}_vs_${analysis.away_team}.pdf`);
}

// Player PDF export
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
  const doc = new jsPDF();
  const fontLoaded = await setupFonts(doc);

  const margin = 15;
  let y = 25;

  const setFont = (style: 'normal' | 'bold') => {
    if (fontLoaded) doc.setFont('NotoSans', style);
    else doc.setFont('helvetica', style);
  };

  // Title
  doc.setFontSize(20);
  setFont('bold');
  doc.text(player.name, margin, y);
  y += 12;

  doc.setDrawColor(160);
  doc.setLineWidth(0.5);
  doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
  y += 10;

  const addRow = (label: string, value: string | null | undefined) => {
    if (!value) return;
    doc.setFontSize(10);
    setFont('bold');
    doc.text(`${label}:`, margin, y);
    setFont('normal');
    doc.text(value, margin + 55, y);
    y += 7;
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
