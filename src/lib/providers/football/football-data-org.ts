import { StandardStandingsTable, StandardStanding, StandardMatch } from "../types";

const BASE_URL = "https://api.football-data.org/v4";
const TIMEOUT_MS = 5000;

export const COMPETITION_CODE_MAP: Record<number | string, string> = {
  39: "PL",
  "PL": "PL",
  140: "PD",
  "PD": "PD",
  135: "SA",
  "SA": "SA",
  78: "BL1",
  "BL1": "BL1",
  61: "FL1",
  "FL1": "FL1",
  2: "CL",
  "CL": "CL",
};

export const LEAGUE_META: Record<string, {
  name: string;
  nameFa: string;
  country: string;
  countryFa: string;
  uclSpots: number;
  relegationSpots: number;
  logo: string;
}> = {
  PL: {
    name: "Premier League",
    nameFa: "لیگ برتر انگلیس",
    country: "England",
    countryFa: "انگلستان",
    uclSpots: 4,
    relegationSpots: 3,
    logo: "https://crests.football-data.org/PL.png",
  },
  PD: {
    name: "La Liga",
    nameFa: "لالیگا اسپانیا",
    country: "Spain",
    countryFa: "اسپانیا",
    uclSpots: 4,
    relegationSpots: 3,
    logo: "https://crests.football-data.org/laliga.png",
  },
  SA: {
    name: "Serie A",
    nameFa: "سری آ ایتالیا",
    country: "Italy",
    countryFa: "ایتالیا",
    uclSpots: 4,
    relegationSpots: 3,
    logo: "https://crests.football-data.org/SA.png",
  },
  BL1: {
    name: "Bundesliga",
    nameFa: "بوندسلیگا آلمان",
    country: "Germany",
    countryFa: "آلمان",
    uclSpots: 4,
    relegationSpots: 3,
    logo: "https://crests.football-data.org/BL1.png",
  },
  FL1: {
    name: "Ligue 1",
    nameFa: "لوشامپیونا فرانسه",
    country: "France",
    countryFa: "فرانسه",
    uclSpots: 3,
    relegationSpots: 2,
    logo: "https://crests.football-data.org/FL1.png",
  },
  CL: {
    name: "UEFA Champions League",
    nameFa: "لیگ قهرمانان اروپا",
    country: "Europe",
    countryFa: "اروپا",
    uclSpots: 8,
    relegationSpots: 0,
    logo: "https://crests.football-data.org/CL.png",
  },
};

/**
 * Fetch standings table from football-data.org (Secondary Provider)
 */
export async function fetchFootballDataOrgStandings(
  leagueKey: number | string
): Promise<StandardStandingsTable | null> {
  const token = process.env.FOOTBALL_DATA_TOKEN || "29cd232822934065962a8d76e547b83b";
  const code = COMPETITION_CODE_MAP[leagueKey] || "PL";
  const meta = LEAGUE_META[code] || LEAGUE_META.PL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/competitions/${code}/standings`, {
      headers: {
        "X-Auth-Token": token,
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`[football-data.org] HTTP ${res.status} for competition ${code}`);
      return null;
    }

    const data = await res.json();
    const rawTable = data?.standings?.[0]?.table || [];

    if (!Array.isArray(rawTable) || rawTable.length === 0) {
      return null;
    }

    const standings: StandardStanding[] = rawTable.map((row: any) => ({
      position: row.position,
      teamId: row.team?.id,
      teamName: row.team?.shortName || row.team?.name || "Unknown",
      teamLogo: row.team?.crest || `https://crests.football-data.org/${row.team?.id}.png`,
      played: row.playedGames ?? 0,
      won: row.won ?? 0,
      drawn: row.draw ?? 0,
      lost: row.lost ?? 0,
      goalsFor: row.goalsFor ?? 0,
      goalsAgainst: row.goalsAgainst ?? 0,
      goalsDiff: row.goalDifference ?? 0,
      points: row.points ?? 0,
      form: row.form ? row.form.replace(/,/g, "") : "—",
      description: row.description || null,
    }));

    const seasonYear = data.season?.startDate
      ? new Date(data.season.startDate).getFullYear()
      : 2026;

    return {
      leagueId: leagueKey,
      leagueCode: code,
      leagueName: meta.name,
      leagueNameFa: meta.nameFa,
      country: meta.country,
      countryFa: meta.countryFa,
      logo: meta.logo,
      season: seasonYear,
      uclSpots: meta.uclSpots,
      relegationSpots: meta.relegationSpots,
      standings,
      provider: "football-data.org",
      updatedAt: new Date().toISOString(),
      isFallback: false,
    };
  } catch (error: any) {
    console.warn(`[football-data.org] Standings fetch failed:`, error?.message || error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch matches / fixtures from football-data.org
 */
export async function fetchFootballDataOrgMatches(
  leagueKey: number | string
): Promise<StandardMatch[]> {
  const token = process.env.FOOTBALL_DATA_TOKEN || "29cd232822934065962a8d76e547b83b";
  const code = COMPETITION_CODE_MAP[leagueKey] || "PL";
  const meta = LEAGUE_META[code] || LEAGUE_META.PL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/competitions/${code}/matches?status=IN_PLAY,PAUSED,TIMED,FINISHED`, {
      headers: {
        "X-Auth-Token": token,
      },
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const rawMatches = data?.matches || [];

    return rawMatches.map((m: any) => {
      let status: StandardMatch["status"] = "NOT_STARTED";
      if (m.status === "IN_PLAY") status = "LIVE";
      else if (m.status === "PAUSED") status = "HALF_TIME";
      else if (m.status === "FINISHED") status = "FINISHED";
      else if (m.status === "POSTPONED") status = "POSTPONED";

      return {
        id: m.id,
        homeTeam: {
          id: m.homeTeam?.id,
          name: m.homeTeam?.shortName || m.homeTeam?.name,
          logo: m.homeTeam?.crest,
        },
        awayTeam: {
          id: m.awayTeam?.id,
          name: m.awayTeam?.shortName || m.awayTeam?.name,
          logo: m.awayTeam?.crest,
        },
        homeScore: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
        awayScore: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
        status,
        minute: m.minute || null,
        matchDate: m.utcDate,
        venue: m.venue || "Stadium",
        league: meta.name,
        leagueLogo: meta.logo,
      };
    });
  } catch (error: any) {
    console.warn(`[football-data.org] Matches fetch failed:`, error?.message || error);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
