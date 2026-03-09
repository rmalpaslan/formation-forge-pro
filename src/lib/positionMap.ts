/** Maps English position abbreviations to full Turkish names */
export const positionMapTR: Record<string, string> = {
  GK: 'Kaleci',
  CB: 'Stoper',
  LB: 'Sol Bek',
  RB: 'Sağ Bek',
  LWB: 'Sol Kanat Bek',
  RWB: 'Sağ Kanat Bek',
  CDM: 'Defansif Orta Saha',
  CM: 'Merkez Orta Saha',
  CAM: 'Ofansif Orta Saha',
  LM: 'Sol Orta Saha',
  RM: 'Sağ Orta Saha',
  LW: 'Sol Kanat',
  RW: 'Sağ Kanat',
  CF: 'Santrafor',
  ST: 'Santrafor',
};

export function localizePosition(pos: string | null | undefined, lang: string): string {
  if (!pos) return '';
  if (lang === 'tr') return positionMapTR[pos] || pos;
  return pos;
}
