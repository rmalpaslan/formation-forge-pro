/** Complete football position data from the Futbol Rolleri Veritabanı */

/** Maps English position abbreviations to full Turkish names */
export const positionMapTR: Record<string, string> = {
  GK: 'Kaleci',
  CB: 'Stoper',
  LB: 'Sol Bek',
  RB: 'Sağ Bek',
  LWB: 'Sol Kanat Bek',
  RWB: 'Sağ Kanat Bek',
  DM: 'Defansif Orta Saha',
  CDM: 'Defansif Orta Saha',
  CM: 'Merkez Orta Saha',
  AM: 'Ofansif Orta Saha',
  CAM: 'Ofansif Orta Saha',
  LM: 'Sol Kanat',
  RM: 'Sağ Kanat',
  LW: 'Sol Kanat Forvet',
  RW: 'Sağ Kanat Forvet',
  CF: 'Santrfor',
  ST: 'Santrfor',
};

/** Maps English position abbreviations to full English names */
export const positionMapEN: Record<string, string> = {
  GK: 'Goalkeeper',
  CB: 'Centre-Back',
  LB: 'Left Full-Back',
  RB: 'Right Full-Back',
  LWB: 'Left Wing-Back',
  RWB: 'Right Wing-Back',
  DM: 'Defensive Midfielder',
  CDM: 'Defensive Midfielder',
  CM: 'Central Midfielder',
  AM: 'Attacking Midfielder',
  CAM: 'Attacking Midfielder',
  LM: 'Left Wide Midfielder',
  RM: 'Right Wide Midfielder',
  LW: 'Left Winger',
  RW: 'Right Winger',
  CF: 'Striker',
  ST: 'Striker',
};

/** Maps English abbreviations to Turkish abbreviations from CSV */
export const positionAbbrTR: Record<string, string> = {
  GK: 'KL',
  CB: 'STP',
  LB: 'SLB',
  RB: 'SĞB',
  LWB: 'SLKB',
  RWB: 'SĞKB',
  DM: 'DOS',
  CDM: 'DOS',
  CM: 'MOS',
  AM: 'OOS',
  CAM: 'OOS',
  LM: 'SLK',
  RM: 'SĞK',
  LW: 'SLKF',
  RW: 'SĞKF',
  CF: 'SNT',
  ST: 'SNT',
};

/** Returns full position name based on language */
export function localizePosition(pos: string | null | undefined, lang: string): string {
  if (!pos) return '';
  if (lang === 'tr') return positionMapTR[pos] || pos;
  return positionMapEN[pos] || pos;
}

/** Returns abbreviated position based on language (for pitch circles) */
export function localizePositionAbbr(pos: string | null | undefined, lang: string): string {
  if (!pos) return '';
  if (lang === 'tr') return positionAbbrTR[pos] || pos;
  return pos; // EN uses the global abbreviation (GK, CB, ST, etc.)
}
