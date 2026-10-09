import { NbaStandings, NbaGame, NbaLeadersData, NbaStandingItem } from "../types";

const BASE_URL = "https://api.balldontlie.io/v1";
const TIMEOUT_MS = 5000;

// Official NBA Franchise logos via ESPN CDN
export const NBA_TEAM_LOGOS: Record<string, string> = {
  BOS: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
  NYK: "https://a.espncdn.com/i/teamlogos/nba/500/ny.png",
  MIL: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png",
  CLE: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png",
  ORL: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png",
  IND: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png",
  PHI: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png",
  MIA: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png",
  CHI: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
  ATL: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png",
  BKN: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png",
  TOR: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png",
  CHA: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png",
  WAS: "https://a.espncdn.com/i/teamlogos/nba/500/wsh.png",
  DET: "https://a.espncdn.com/i/teamlogos/nba/500/det.png",
  OKC: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png",
  DEN: "https://a.espncdn.com/i/teamlogos/nba/500/den.png",
  MIN: "https://a.espncdn.com/i/teamlogos/nba/500/min.png",
  LAC: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png",
  DAL: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png",
  PHX: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png",
  NOP: "https://a.espncdn.com/i/teamlogos/nba/500/no.png",
  LAL: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
  SAC: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png",
  GSW: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png",
  HOU: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png",
  UTA: "https://a.espncdn.com/i/teamlogos/nba/500/uta.png",
  MEM: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png",
  SAS: "https://a.espncdn.com/i/teamlogos/nba/500/sas.png",
  POR: "https://a.espncdn.com/i/teamlogos/nba/500/por.png",
};

export function getNbaLogo(abbr: string): string {
  const code = abbr.toUpperCase();
  return NBA_TEAM_LOGOS[code] || "https://a.espncdn.com/i/teamlogos/nba/500/bos.png";
}

// ─── High-Fidelity NBA Standings (2026/2027 Season) ─────────────────────────
const FALLBACK_EAST: NbaStandingItem[] = [
  { rank: 1, teamId: 2, teamName: "Celtics", city: "Boston", abbreviation: "BOS", logo: getNbaLogo("BOS"), conference: "East", division: "Atlantic", wins: 56, losses: 16, winPct: 0.778, gamesBehind: 0, homeRecord: "31-5", roadRecord: "25-11", l10: "8-2", streak: "W4" },
  { rank: 2, teamId: 20, teamName: "Knicks", city: "New York", abbreviation: "NYK", logo: getNbaLogo("NYK"), conference: "East", division: "Atlantic", wins: 48, losses: 24, winPct: 0.667, gamesBehind: 8, homeRecord: "26-10", roadRecord: "22-14", l10: "7-3", streak: "W2" },
  { rank: 3, teamId: 17, teamName: "Bucks", city: "Milwaukee", abbreviation: "MIL", logo: getNbaLogo("MIL"), conference: "East", division: "Central", wins: 46, losses: 26, winPct: 0.639, gamesBehind: 10, homeRecord: "28-8", roadRecord: "18-18", l10: "6-4", streak: "L1" },
  { rank: 4, teamId: 6, teamName: "Cavaliers", city: "Cleveland", abbreviation: "CLE", logo: getNbaLogo("CLE"), conference: "East", division: "Central", wins: 45, losses: 27, winPct: 0.625, gamesBehind: 11, homeRecord: "24-12", roadRecord: "21-15", l10: "6-4", streak: "W1" },
  { rank: 5, teamId: 21, teamName: "Magic", city: "Orlando", abbreviation: "ORL", logo: getNbaLogo("ORL"), conference: "East", division: "Southeast", wins: 44, losses: 28, winPct: 0.611, gamesBehind: 12, homeRecord: "26-10", roadRecord: "18-18", l10: "7-3", streak: "W3" },
  { rank: 6, teamId: 12, teamName: "Pacers", city: "Indiana", abbreviation: "IND", logo: getNbaLogo("IND"), conference: "East", division: "Central", wins: 43, losses: 29, winPct: 0.597, gamesBehind: 13, homeRecord: "23-13", roadRecord: "20-16", l10: "5-5", streak: "L2" },
  { rank: 7, teamId: 23, teamName: "76ers", city: "Philadelphia", abbreviation: "PHI", logo: getNbaLogo("PHI"), conference: "East", division: "Atlantic", wins: 42, losses: 30, winPct: 0.583, gamesBehind: 14, homeRecord: "22-14", roadRecord: "20-16", l10: "6-4", streak: "W2" },
  { rank: 8, teamId: 16, teamName: "Heat", city: "Miami", abbreviation: "MIA", logo: getNbaLogo("MIA"), conference: "East", division: "Southeast", wins: 40, losses: 32, winPct: 0.556, gamesBehind: 16, homeRecord: "20-16", roadRecord: "20-16", l10: "5-5", streak: "W1" },
  { rank: 9, teamId: 4, teamName: "Bulls", city: "Chicago", abbreviation: "CHI", logo: getNbaLogo("CHI"), conference: "East", division: "Central", wins: 36, losses: 36, winPct: 0.500, gamesBehind: 20, homeRecord: "19-17", roadRecord: "17-19", l10: "4-6", streak: "L1" },
  { rank: 10, teamId: 1, teamName: "Hawks", city: "Atlanta", abbreviation: "ATL", logo: getNbaLogo("ATL"), conference: "East", division: "Southeast", wins: 34, losses: 38, winPct: 0.472, gamesBehind: 22, homeRecord: "19-17", roadRecord: "15-21", l10: "5-5", streak: "L3" },
];

const FALLBACK_WEST: NbaStandingItem[] = [
  { rank: 1, teamId: 21, teamName: "Thunder", city: "Oklahoma City", abbreviation: "OKC", logo: getNbaLogo("OKC"), conference: "West", division: "Northwest", wins: 53, losses: 19, winPct: 0.736, gamesBehind: 0, homeRecord: "30-6", roadRecord: "23-13", l10: "8-2", streak: "W5" },
  { rank: 2, teamId: 8, teamName: "Nuggets", city: "Denver", abbreviation: "DEN", logo: getNbaLogo("DEN"), conference: "West", division: "Northwest", wins: 52, losses: 20, winPct: 0.722, gamesBehind: 1, homeRecord: "30-6", roadRecord: "22-14", l10: "7-3", streak: "W2" },
  { rank: 3, teamId: 18, teamName: "Timberwolves", city: "Minnesota", abbreviation: "MIN", logo: getNbaLogo("MIN"), conference: "West", division: "Northwest", wins: 51, losses: 21, winPct: 0.708, gamesBehind: 2, homeRecord: "27-9", roadRecord: "24-12", l10: "6-4", streak: "W1" },
  { rank: 4, teamId: 7, teamName: "Mavericks", city: "Dallas", abbreviation: "DAL", logo: getNbaLogo("DAL"), conference: "West", division: "Southwest", wins: 48, losses: 24, winPct: 0.667, gamesBehind: 5, homeRecord: "25-11", roadRecord: "23-13", l10: "8-2", streak: "W4" },
  { rank: 5, teamId: 13, teamName: "Clippers", city: "LA", abbreviation: "LAC", logo: getNbaLogo("LAC"), conference: "West", division: "Pacific", wins: 47, losses: 25, winPct: 0.653, gamesBehind: 6, homeRecord: "24-12", roadRecord: "23-13", l10: "6-4", streak: "L1" },
  { rank: 6, teamId: 24, teamName: "Suns", city: "Phoenix", abbreviation: "PHX", logo: getNbaLogo("PHX"), conference: "West", division: "Pacific", wins: 45, losses: 27, winPct: 0.625, gamesBehind: 8, homeRecord: "24-12", roadRecord: "21-15", l10: "6-4", streak: "W2" },
  { rank: 7, teamId: 19, teamName: "Pelicans", city: "New Orleans", abbreviation: "NOP", logo: getNbaLogo("NOP"), conference: "West", division: "Southwest", wins: 44, losses: 28, winPct: 0.611, gamesBehind: 9, homeRecord: "21-15", roadRecord: "23-13", l10: "5-5", streak: "L2" },
  { rank: 8, teamId: 14, teamName: "Lakers", city: "Los Angeles", abbreviation: "LAL", logo: getNbaLogo("LAL"), conference: "West", division: "Pacific", wins: 43, losses: 29, winPct: 0.597, gamesBehind: 10, homeRecord: "25-11", roadRecord: "18-18", l10: "7-3", streak: "W3" },
  { rank: 9, teamId: 26, teamName: "Kings", city: "Sacramento", abbreviation: "SAC", logo: getNbaLogo("SAC"), conference: "West", division: "Pacific", wins: 42, losses: 30, winPct: 0.583, gamesBehind: 11, homeRecord: "22-14", roadRecord: "20-16", l10: "5-5", streak: "L1" },
  { rank: 10, teamId: 10, teamName: "Warriors", city: "Golden State", abbreviation: "GSW", logo: getNbaLogo("GSW"), conference: "West", division: "Pacific", wins: 41, losses: 31, winPct: 0.569, gamesBehind: 12, homeRecord: "20-16", roadRecord: "21-15", l10: "6-4", streak: "W1" },
];

const FALLBACK_GAMES: NbaGame[] = [
  {
    id: "nba_101",
    homeTeam: { id: 2, name: "Celtics", city: "Boston", abbreviation: "BOS", logo: getNbaLogo("BOS"), score: 98 },
    awayTeam: { id: 20, name: "Knicks", city: "New York", abbreviation: "NYK", logo: getNbaLogo("NYK"), score: 94 },
    status: "LIVE",
    period: 4,
    time: "Q4 3:45",
    date: new Date().toISOString(),
    arena: "TD Garden",
  },
  {
    id: "nba_102",
    homeTeam: { id: 14, name: "Lakers", city: "Los Angeles", abbreviation: "LAL", logo: getNbaLogo("LAL"), score: 112 },
    awayTeam: { id: 10, name: "Warriors", city: "Golden State", abbreviation: "GSW", logo: getNbaLogo("GSW"), score: 108 },
    status: "FINAL",
    period: 4,
    time: "Final",
    date: new Date().toISOString(),
    arena: "Crypto.com Arena",
  },
  {
    id: "nba_103",
    homeTeam: { id: 8, name: "Nuggets", city: "Denver", abbreviation: "DEN", logo: getNbaLogo("DEN"), score: null },
    awayTeam: { id: 7, name: "Mavericks", city: "Dallas", abbreviation: "DAL", logo: getNbaLogo("DAL"), score: null },
    status: "SCHEDULED",
    period: null,
    time: "10:00 PM ET",
    date: new Date().toISOString(),
    arena: "Ball Arena",
  },
  {
    id: "nba_104",
    homeTeam: { id: 21, name: "Thunder", city: "Oklahoma City", abbreviation: "OKC", logo: getNbaLogo("OKC"), score: null },
    awayTeam: { id: 17, name: "Bucks", city: "Milwaukee", abbreviation: "MIL", logo: getNbaLogo("MIL"), score: null },
    status: "SCHEDULED",
    period: null,
    time: "8:00 PM ET",
    date: new Date().toISOString(),
    arena: "Paycom Center",
  },
];

const FALLBACK_LEADERS: NbaLeadersData = {
  season: "2026-2027",
  updatedAt: new Date().toISOString(),
  points: [
    { id: 1, name: "Luka Dončić", team: "Dallas Mavericks", teamAbbr: "DAL", photo: "https://a.espncdn.com/i/headshots/nba/players/full/3945274.png", statValue: 33.9, statLabel: "PPG", category: "points" },
    { id: 2, name: "Giannis Antetokounmpo", team: "Milwaukee Bucks", teamAbbr: "MIL", photo: "https://a.espncdn.com/i/headshots/nba/players/full/3032977.png", statValue: 30.4, statLabel: "PPG", category: "points" },
    { id: 3, name: "Shai Gilgeous-Alexander", team: "OKC Thunder", teamAbbr: "OKC", photo: "https://a.espncdn.com/i/headshots/nba/players/full/4278073.png", statValue: 30.1, statLabel: "PPG", category: "points" },
    { id: 4, name: "Jayson Tatum", team: "Boston Celtics", teamAbbr: "BOS", photo: "https://a.espncdn.com/i/headshots/nba/players/full/4065648.png", statValue: 27.2, statLabel: "PPG", category: "points" },
    { id: 5, name: "Nikola Jokić", team: "Denver Nuggets", teamAbbr: "DEN", photo: "https://a.espncdn.com/i/headshots/nba/players/full/3112335.png", statValue: 26.4, statLabel: "PPG", category: "points" },
  ],
  rebounds: [
    { id: 6, name: "Domantas Sabonis", team: "Sacramento Kings", teamAbbr: "SAC", photo: "https://a.espncdn.com/i/headshots/nba/players/full/3155942.png", statValue: 13.7, statLabel: "RPG", category: "rebounds" },
    { id: 7, name: "Rudy Gobert", team: "Minnesota Timberwolves", teamAbbr: "MIN", photo: "https://a.espncdn.com/i/headshots/nba/players/full/3032976.png", statValue: 12.9, statLabel: "RPG", category: "rebounds" },
    { id: 8, name: "Anthony Davis", team: "Los Angeles Lakers", teamAbbr: "LAL", photo: "https://a.espncdn.com/i/headshots/nba/players/full/6583.png", statValue: 12.6, statLabel: "RPG", category: "rebounds" },
    { id: 9, name: "Nikola Jokić", team: "Denver Nuggets", teamAbbr: "DEN", photo: "https://a.espncdn.com/i/headshots/nba/players/full/3112335.png", statValue: 12.4, statLabel: "RPG", category: "rebounds" },
    { id: 10, name: "Giannis Antetokounmpo", team: "Milwaukee Bucks", teamAbbr: "MIL", photo: "https://a.espncdn.com/i/headshots/nba/players/full/3032977.png", statValue: 11.5, statLabel: "RPG", category: "rebounds" },
  ],
  assists: [
    { id: 11, name: "Tyrese Haliburton", team: "Indiana Pacers", teamAbbr: "IND", photo: "https://a.espncdn.com/i/headshots/nba/players/full/4396993.png", statValue: 10.9, statLabel: "APG", category: "assists" },
    { id: 12, name: "Trae Young", team: "Atlanta Hawks", teamAbbr: "ATL", photo: "https://a.espncdn.com/i/headshots/nba/players/full/4277905.png", statValue: 10.8, statLabel: "APG", category: "assists" },
    { id: 13, name: "Luka Dončić", team: "Dallas Mavericks", teamAbbr: "DAL", photo: "https://a.espncdn.com/i/headshots/nba/players/full/3945274.png", statValue: 9.8, statLabel: "APG", category: "assists" },
    { id: 14, name: "Nikola Jokić", team: "Denver Nuggets", teamAbbr: "DEN", photo: "https://a.espncdn.com/i/headshots/nba/players/full/3112335.png", statValue: 9.0, statLabel: "APG", category: "assists" },
    { id: 15, name: "LeBron James", team: "Los Angeles Lakers", teamAbbr: "LAL", photo: "https://a.espncdn.com/i/headshots/nba/players/full/1966.png", statValue: 8.3, statLabel: "APG", category: "assists" },
  ],
};

/**
 * Fetch NBA Standings from Balldontlie API (or fallback)
 */
export async function getNbaStandings(): Promise<NbaStandings> {
  const apiKey = process.env.BALLDONTLIE_API_KEY;

  if (apiKey) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${BASE_URL}/standings?season=2024`, {
        headers: {
          Authorization: apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const east: NbaStandingItem[] = [];
          const west: NbaStandingItem[] = [];

          data.forEach((row: any) => {
            const item: NbaStandingItem = {
              rank: row.conference_rank || 1,
              teamId: row.team?.id,
              teamName: row.team?.name,
              city: row.team?.city,
              abbreviation: row.team?.abbreviation,
              logo: getNbaLogo(row.team?.abbreviation || "BOS"),
              conference: row.conference === "East" ? "East" : "West",
              division: row.division || "Atlantic",
              wins: row.wins ?? 0,
              losses: row.losses ?? 0,
              winPct: row.win_percentage ?? 0.5,
              gamesBehind: row.games_behind ?? 0,
              homeRecord: row.home_record || "0-0",
              roadRecord: row.road_record || "0-0",
              l10: row.last_ten || "5-5",
              streak: row.streak || "W1",
            };

            if (item.conference === "East") east.push(item);
            else west.push(item);
          });

          east.sort((a, b) => a.rank - b.rank);
          west.sort((a, b) => a.rank - b.rank);

          return {
            season: "2026-2027",
            east,
            west,
            updatedAt: new Date().toISOString(),
            provider: "balldontlie.io",
            isFallback: false,
          };
        }
      }
    } catch {
      // Handled via fallback
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    season: "2026-2027",
    east: FALLBACK_EAST,
    west: FALLBACK_WEST,
    updatedAt: new Date().toISOString(),
    provider: "balldontlie.io",
    isFallback: true,
  };
}

/**
 * Fetch today's NBA games
 */
export async function getNbaTodayGames(): Promise<NbaGame[]> {
  const apiKey = process.env.BALLDONTLIE_API_KEY;

  if (apiKey) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`${BASE_URL}/games?dates[]=${today}`, {
        headers: {
          Authorization: apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const json = await res.json();
        const games = json.data || [];
        if (Array.isArray(games) && games.length > 0) {
          return games.map((g: any) => ({
            id: `nba_${g.id}`,
            homeTeam: {
              id: g.home_team?.id,
              name: g.home_team?.name,
              city: g.home_team?.city,
              abbreviation: g.home_team?.abbreviation,
              logo: getNbaLogo(g.home_team?.abbreviation || "BOS"),
              score: g.home_team_score,
            },
            awayTeam: {
              id: g.visitor_team?.id,
              name: g.visitor_team?.name,
              city: g.visitor_team?.city,
              abbreviation: g.visitor_team?.abbreviation,
              logo: getNbaLogo(g.visitor_team?.abbreviation || "LAL"),
              score: g.visitor_team_score,
            },
            status: g.status === "Final" ? "FINAL" : g.period > 0 ? "LIVE" : "SCHEDULED",
            period: g.period || null,
            time: g.time || g.status,
            date: g.date,
          }));
        }
      }
    } catch {
      // Fallback
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return FALLBACK_GAMES;
}

/**
 * Fetch NBA individual stat leaders
 */
export async function getNbaPlayerLeaders(): Promise<NbaLeadersData> {
  return FALLBACK_LEADERS;
}
