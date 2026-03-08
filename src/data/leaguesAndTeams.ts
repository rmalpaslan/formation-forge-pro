export interface League {
  name: string;
  country: string;
  countryCode: string;
  favorite: boolean;
  teams: string[];
}

export const leagues: League[] = [
  {
    name: 'Süper Lig (TR)', country: 'Türkiye', countryCode: 'TR', favorite: true,
    teams: [
      'Adana Demirspor', 'Alanyaspor', 'Antalyaspor', 'Başakşehir', 'Beşiktaş',
      'Bodrum FK', 'Çaykur Rizespor', 'Eyüpspor', 'Fenerbahçe', 'Galatasaray',
      'Gaziantep FK', 'Göztepe', 'Hatayspor', 'Kasımpaşa', 'Kayserispor',
      'Konyaspor', 'Samsunspor', 'Sivasspor', 'Trabzonspor',
    ],
  },
  {
    name: '1. Lig (TR)', country: 'Türkiye', countryCode: 'TR', favorite: true,
    teams: [
      'Adanaspor', 'Altay', 'Ankaragücü', 'Boluspor', 'Bursaspor', 'Çorum FK',
      'Erzurumspor', 'Gençlerbirliği', 'İstanbulspor', 'Keçiörengücü',
      'Manisa FK', 'Pendikspor', 'Sakaryaspor', 'Şanlıurfaspor', 'Tuzlaspor',
      'Ümraniyespor', 'Yeni Malatyaspor',
    ],
  },
  {
    name: 'Premier League (ENG)', country: 'England', countryCode: 'ENG', favorite: true,
    teams: [
      'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
      'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town',
      'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
      'Newcastle United', 'Nottingham Forest', 'Southampton', 'Tottenham Hotspur',
      'West Ham United', 'Wolverhampton',
    ],
  },
  {
    name: 'La Liga (ESP)', country: 'Spain', countryCode: 'ESP', favorite: true,
    teams: [
      'Athletic Bilbao', 'Atlético Madrid', 'Barcelona', 'Betis', 'Celta Vigo',
      'Espanyol', 'Getafe', 'Girona', 'Las Palmas', 'Leganés', 'Mallorca',
      'Osasuna', 'Rayo Vallecano', 'Real Madrid', 'Real Sociedad', 'Sevilla',
      'Valencia', 'Valladolid', 'Villarreal',
    ],
  },
  {
    name: 'Bundesliga (GER)', country: 'Germany', countryCode: 'GER', favorite: true,
    teams: [
      'Augsburg', 'Bayern München', 'Bayer Leverkusen', 'Borussia Dortmund',
      'Borussia Mönchengladbach', 'Eintracht Frankfurt', 'Freiburg', 'Heidenheim',
      'Hoffenheim', 'Holstein Kiel', 'Mainz 05', 'RB Leipzig', 'St. Pauli',
      'Stuttgart', 'Union Berlin', 'Werder Bremen', 'Wolfsburg',
    ],
  },
  {
    name: 'Serie A (ITA)', country: 'Italy', countryCode: 'ITA', favorite: true,
    teams: [
      'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Empoli', 'Fiorentina',
      'Genoa', 'Inter Milan', 'Juventus', 'Lazio', 'Lecce', 'AC Milan',
      'Monza', 'Napoli', 'Parma', 'Roma', 'Torino', 'Udinese', 'Venezia', 'Verona',
    ],
  },
  {
    name: 'Ligue 1 (FRA)', country: 'France', countryCode: 'FRA', favorite: true,
    teams: [
      'Angers', 'Auxerre', 'Brest', 'Le Havre', 'Lens', 'Lille', 'Lyon',
      'Marseille', 'Monaco', 'Montpellier', 'Nantes', 'Nice', 'PSG',
      'Reims', 'Rennes', 'Saint-Étienne', 'Strasbourg', 'Toulouse',
    ],
  },
];

export function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function getAllTeams(): string[] {
  const teams = new Set<string>();
  leagues.forEach(l => l.teams.forEach(t => teams.add(t)));
  return Array.from(teams).sort();
}

export function getCountryCodes(): string[] {
  return [...new Set(leagues.map(l => l.countryCode))];
}
