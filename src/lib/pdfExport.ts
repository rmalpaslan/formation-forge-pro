import jsPDF from 'jspdf';

// Fetch a font file and convert to base64 for jsPDF embedding
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

// Load an image URL and return base64 data URL
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

const ROBOTO_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-ext-400-normal.ttf';
const ROBOTO_BOLD_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-ext-700-normal.ttf';

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
  
  // Load and register Roboto font for Turkish character support
  try {
    const [fontBase64, boldBase64] = await Promise.all([
      loadFontBase64(ROBOTO_URL),
      loadFontBase64(ROBOTO_BOLD_URL),
    ]);
    doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFileToVFS('Roboto-Bold.ttf', boldBase64);
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto');
  } catch {
    // Fallback to helvetica if font loading fails
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 280) { doc.addPage(); y = 20; }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('Roboto', 'bold');
  doc.text(`${analysis.home_team} vs ${analysis.away_team}`, margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('Roboto', 'normal');
  const targetName = analysis.target_team === 'home' ? analysis.home_team : analysis.away_team;
  doc.text(`${analysis.match_date}  |  ${tTarget}: ${targetName}`, margin, y);
  y += 14;

  // Draw a separator line
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  for (const tab of tabsData) {
    checkPage(30);
    const label = labels[tab.sub_tab || ''] || `${tab.tab_type}/${tab.sub_tab}`;
    
    // Section heading
    doc.setFontSize(14);
    doc.setFont('Roboto', 'bold');
    doc.text(label, margin, y);
    y += 8;

    if (tab.formation) {
      doc.setFontSize(10);
      doc.setFont('Roboto', 'normal');
      doc.text(`${tFormation}: ${tab.formation}`, margin, y);
      y += 7;
    }

    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');

    const addBullets = (title: string, items: string[] | null) => {
      const cleaned = (items || []).filter(s => s.trim() !== '');
      if (cleaned.length === 0) return;
      checkPage(12);
      doc.setFont('Roboto', 'bold');
      doc.text(`${title}:`, margin, y);
      y += 6;
      doc.setFont('Roboto', 'normal');
      cleaned.forEach(item => {
        checkPage(8);
        const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 5);
        doc.text(lines, margin + 5, y);
        y += lines.length * 5.5;
      });
      y += 3;
    };

    addBullets(tGeneralNotes, tab.general_notes);
    addBullets(tPros, tab.pros);
    addBullets(tCons, tab.cons);

    // Embed images
    if (tab.images && tab.images.length > 0) {
      for (const imgUrl of tab.images) {
        const dataUrl = await loadImageAsBase64(imgUrl);
        if (!dataUrl) continue;
        checkPage(60);
        try {
          doc.addImage(dataUrl, 'JPEG', margin, y, 50, 40);
          y += 45;
        } catch {
          // skip broken images
        }
      }
    }

    y += 5;
    // Thin separator between sections
    checkPage(5);
    doc.setDrawColor(230);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  doc.save(`${analysis.home_team}_vs_${analysis.away_team}.pdf`);
}
