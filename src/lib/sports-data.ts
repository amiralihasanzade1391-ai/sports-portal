/**
 * Sports Data Repository — Curated high-resolution crests & athlete portraits.
 * Uses official API-Sports and Football-Data CDN vectors.
 */

export interface ClubDirectoryEntry {
  id: string;
  name: string;
  nameFa: string;
  shortName: string;
  logo: string;
  league: string;
  leagueFa: string;
  country: string;
  stadium: string;
  founded: number;
}

export const TOP_20_CLUBS: ClubDirectoryEntry[] = [
  {
    id: "team-realmadrid",
    name: "Real Madrid CF",
    nameFa: "رئال مادرید",
    shortName: "RMA",
    logo: "https://media.api-sports.io/football/teams/541.png",
    league: "La Liga",
    leagueFa: "لالیگا اسپانیا",
    country: "Spain",
    stadium: "Santiago Bernabéu",
    founded: 1902,
  },
  {
    id: "team-barcelona",
    name: "FC Barcelona",
    nameFa: "بارسلونا",
    shortName: "BAR",
    logo: "https://media.api-sports.io/football/teams/529.png",
    league: "La Liga",
    leagueFa: "لالیگا اسپانیا",
    country: "Spain",
    stadium: "Spotify Camp Nou",
    founded: 1899,
  },
  {
    id: "team-mancity",
    name: "Manchester City",
    nameFa: "منچسترسیتی",
    shortName: "MCI",
    logo: "https://media.api-sports.io/football/teams/50.png",
    league: "Premier League",
    leagueFa: "لیگ برتر انگلیس",
    country: "England",
    stadium: "Etihad Stadium",
    founded: 1894,
  },
  {
    id: "team-arsenal",
    name: "Arsenal FC",
    nameFa: "آرسنال",
    shortName: "ARS",
    logo: "https://media.api-sports.io/football/teams/42.png",
    league: "Premier League",
    leagueFa: "لیگ برتر انگلیس",
    country: "England",
    stadium: "Emirates Stadium",
    founded: 1886,
  },
  {
    id: "team-liverpool",
    name: "Liverpool FC",
    nameFa: "لیورپول",
    shortName: "LIV",
    logo: "https://media.api-sports.io/football/teams/40.png",
    league: "Premier League",
    leagueFa: "لیگ برتر انگلیس",
    country: "England",
    stadium: "Anfield",
    founded: 1892,
  },
  {
    id: "team-manunited",
    name: "Manchester United",
    nameFa: "منچستریونایتد",
    shortName: "MUN",
    logo: "https://media.api-sports.io/football/teams/33.png",
    league: "Premier League",
    leagueFa: "لیگ برتر انگلیس",
    country: "England",
    stadium: "Old Trafford",
    founded: 1878,
  },
  {
    id: "team-bayern",
    name: "FC Bayern Munich",
    nameFa: "بایرن مونیخ",
    shortName: "BAY",
    logo: "https://media.api-sports.io/football/teams/157.png",
    league: "Bundesliga",
    leagueFa: "بوندس‌لیگا آلمان",
    country: "Germany",
    stadium: "Allianz Arena",
    founded: 1900,
  },
  {
    id: "team-psg",
    name: "Paris Saint-Germain",
    nameFa: "پاری سن ژرمن",
    shortName: "PSG",
    logo: "https://media.api-sports.io/football/teams/85.png",
    league: "Ligue 1",
    leagueFa: "لوشامپیونه فرانسه",
    country: "France",
    stadium: "Parc des Princes",
    founded: 1970,
  },
  {
    id: "team-inter",
    name: "Inter Milan",
    nameFa: "اینتر میلان",
    shortName: "INT",
    logo: "https://media.api-sports.io/football/teams/505.png",
    league: "Serie A",
    leagueFa: "سری آ ایتالیا",
    country: "Italy",
    stadium: "San Siro",
    founded: 1908,
  },
  {
    id: "team-milan",
    name: "AC Milan",
    nameFa: "آث میلان",
    shortName: "MIL",
    logo: "https://media.api-sports.io/football/teams/489.png",
    league: "Serie A",
    leagueFa: "سری آ ایتالیا",
    country: "Italy",
    stadium: "San Siro",
    founded: 1899,
  },
  {
    id: "team-juventus",
    name: "Juventus FC",
    nameFa: "یوونتوس",
    shortName: "JUV",
    logo: "https://media.api-sports.io/football/teams/496.png",
    league: "Serie A",
    leagueFa: "سری آ ایتالیا",
    country: "Italy",
    stadium: "Allianz Stadium",
    founded: 1897,
  },
  {
    id: "team-chelsea",
    name: "Chelsea FC",
    nameFa: "چلسی",
    shortName: "CHE",
    logo: "https://media.api-sports.io/football/teams/49.png",
    league: "Premier League",
    leagueFa: "لیگ برتر انگلیس",
    country: "England",
    stadium: "Stamford Bridge",
    founded: 1905,
  },
  {
    id: "team-atletico",
    name: "Atlético Madrid",
    nameFa: "اتلتیکو مادرید",
    shortName: "ATM",
    logo: "https://media.api-sports.io/football/teams/530.png",
    league: "La Liga",
    leagueFa: "لالیگا اسپانیا",
    country: "Spain",
    stadium: "Cívitas Metropolitano",
    founded: 1903,
  },
  {
    id: "team-bvb",
    name: "Borussia Dortmund",
    nameFa: "دورتموند",
    shortName: "BVB",
    logo: "https://media.api-sports.io/football/teams/165.png",
    league: "Bundesliga",
    leagueFa: "بوندس‌لیگا آلمان",
    country: "Germany",
    stadium: "Signal Iduna Park",
    founded: 1909,
  },
  {
    id: "team-tottenham",
    name: "Tottenham Hotspur",
    nameFa: "تاتنهام",
    shortName: "TOT",
    logo: "https://media.api-sports.io/football/teams/47.png",
    league: "Premier League",
    leagueFa: "لیگ برتر انگلیس",
    country: "England",
    stadium: "Tottenham Hotspur Stadium",
    founded: 1882,
  },
  {
    id: "team-leverkusen",
    name: "Bayer Leverkusen",
    nameFa: "بایر لورکوزن",
    shortName: "B04",
    logo: "https://media.api-sports.io/football/teams/168.png",
    league: "Bundesliga",
    leagueFa: "بوندس‌لیگا آلمان",
    country: "Germany",
    stadium: "BayArena",
    founded: 1904,
  },
];

/**
 * Searches curated team database for a match by name or code
 */
export function getTeamLogoUrl(identifier: string): string | null {
  if (!identifier) return null;
  const normalized = identifier.toLowerCase().trim();

  const found = TOP_20_CLUBS.find(
    (c) =>
      c.name.toLowerCase().includes(normalized) ||
      c.shortName.toLowerCase() === normalized ||
      c.id.toLowerCase().includes(normalized)
  );

  return found ? found.logo : null;
}
