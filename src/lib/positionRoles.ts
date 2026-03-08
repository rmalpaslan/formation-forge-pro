/** Maps position abbreviations to available player roles in Turkish */
export const positionRolesMap: Record<string, { tr: string; en: string }[]> = {
  GK: [
    { tr: 'Libero Kaleci', en: 'Sweeper Keeper' },
    { tr: 'Standart Kaleci', en: 'Standard GK' },
  ],
  CB: [
    { tr: 'Stoper (Defansif)', en: 'Ball-Playing CB' },
    { tr: 'Agresif Stoper', en: 'Aggressive CB' },
    { tr: 'Libero', en: 'Libero' },
  ],
  LB: [
    { tr: 'Kanat Bek', en: 'Wing Back' },
    { tr: 'Ters Bek', en: 'Inverted Full-Back' },
    { tr: 'Standart Bek', en: 'Standard Full-Back' },
  ],
  RB: [
    { tr: 'Kanat Bek', en: 'Wing Back' },
    { tr: 'Ters Bek', en: 'Inverted Full-Back' },
    { tr: 'Standart Bek', en: 'Standard Full-Back' },
  ],
  LWB: [
    { tr: 'Hücumcu Kanat Bek', en: 'Attacking Wing Back' },
    { tr: 'Defansif Kanat Bek', en: 'Defensive Wing Back' },
  ],
  RWB: [
    { tr: 'Hücumcu Kanat Bek', en: 'Attacking Wing Back' },
    { tr: 'Defansif Kanat Bek', en: 'Defensive Wing Back' },
  ],
  CDM: [
    { tr: 'Kırıcı', en: 'Destroyer' },
    { tr: 'Derin Oyun Kurucu', en: 'Deep-Lying Playmaker' },
    { tr: 'Regista', en: 'Regista' },
  ],
  CM: [
    { tr: 'Box-to-Box', en: 'Box-to-Box' },
    { tr: 'Mezzala', en: 'Mezzala' },
    { tr: 'Oyun Kurucu', en: 'Playmaker' },
  ],
  CAM: [
    { tr: 'Klasik 10 Numara', en: 'Classic No.10' },
    { tr: 'Gölge Forvet', en: 'Shadow Striker' },
    { tr: 'Serbest Rol', en: 'Free Role' },
  ],
  LM: [
    { tr: 'Kanat Oyuncusu', en: 'Wide Midfielder' },
    { tr: 'İçe Kesen Kanat', en: 'Inside Forward' },
  ],
  RM: [
    { tr: 'Kanat Oyuncusu', en: 'Wide Midfielder' },
    { tr: 'İçe Kesen Kanat', en: 'Inside Forward' },
  ],
  LW: [
    { tr: 'İçe Kesen Kanat', en: 'Inverted Winger' },
    { tr: 'Klasik Kanat', en: 'Traditional Winger' },
    { tr: 'İç Forvet', en: 'Inside Forward' },
  ],
  RW: [
    { tr: 'İçe Kesen Kanat', en: 'Inverted Winger' },
    { tr: 'Klasik Kanat', en: 'Traditional Winger' },
    { tr: 'İç Forvet', en: 'Inside Forward' },
  ],
  CF: [
    { tr: 'Sahte 9', en: 'False 9' },
    { tr: 'Fırsatçı Golcü', en: 'Poacher' },
    { tr: 'Hedef Adam', en: 'Target Man' },
  ],
  ST: [
    { tr: 'Pivot Santrfor', en: 'Target Man' },
    { tr: 'Sahte 9', en: 'False 9' },
    { tr: 'Fırsatçı Golcü', en: 'Poacher' },
    { tr: 'Geri Düşen Forvet', en: 'Deep-Lying Forward' },
  ],
};

export function getRolesForPosition(pos: string, lang: string): string[] {
  const roles = positionRolesMap[pos];
  if (!roles) return [];
  return roles.map(r => lang === 'tr' ? r.tr : r.en);
}
