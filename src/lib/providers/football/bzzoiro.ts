import { StandardMatch, StandardStandingsTable, StandardStanding } from "../types";
import { LEAGUE_META } from "./football-data-org";

const BASE_URL = "https://sports.bzzoiro.com/api/v2";
const TIMEOUT_MS = 5000;

export const BZZOIRO_LEAGUE_MAP: Record<number | string, number> = {
  39: 1, // Premier League
  "PL": 1,
  140: 3, // La Liga
  "PD": 3,
  135: 4, // Serie A
  "SA": 4,
  78: 5, // Bundesliga
  "BL1": 5,
  61: 6, // Ligue 1
  "FL1": 6,
  2: 7, // Champions League
  "CL": 7,
};

const BZZOIRO_CODE_MAP: Record<number, string> = {
  1: "PL",
  3: "PD",
  4: "SA",
  5: "BL1",
  6: "FL1",
  7: "CL",
};

/**
 * Fetch matches/events from Bzzoiro (Primary Football Provider)
 */
export async function fetchBzzoiroMatches(
  leagueKey: number | string
): Promise<StandardMatch[]> {
  const apiKey = process.env.BZZOIRO_API_KEY || "fccc7814bede204c09b2dc587206059be059597e";
  const bzLeagueId = BZZOIRO_LEAGUE_MAP[leagueKey] || 1;
  const leagueCode = BZZOIRO_CODE_MAP[bzLeagueId] || "PL";
  const meta = LEAGUE_META[leagueCode] || LEAGUE_META.PL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/events/?league_id=${bzLeagueId}&limit=50`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[Bzzoiro] HTTP ${res.status} fetching events for league ${bzLeagueId}`);
      return [];
    }

    const data = await res.json();
    const events = data?.results || [];

    return events.map((ev: any) => {
      let status: StandardMatch["status"] = "NOT_STARTED";
      if (ev.status === "inprogress" || ev.status === "live") status = "LIVE";
      else if (ev.status === "finished") status = "FINISHED";
      else if (ev.status === "postponed") status = "POSTPONED";

      return {
        id: `bz_${ev.id}`,
        homeTeam: {
          id: ev.home_team_id,
          name: ev.home_team,
          logo: undefined,
        },
        awayTeam: {
          id: ev.away_team_id,
          name: ev.away_team,
          logo: undefined,
        },
        homeScore: ev.home_score,
        awayScore: ev.away_score,
        status,
        minute: ev.current_minute || null,
        matchDate: ev.event_date,
        venue: ev.venue_id ? `Venue #${ev.venue_id}` : undefined,
        league: meta.name,
        leagueLogo: meta.logo,
      };
    });
  } catch (error: any) {
    console.warn(`[Bzzoiro] Match fetch failed:`, error?.message || error);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch real-time live matches from Bzzoiro
 */
export async function getLiveMatches(): Promise<StandardMatch[]> {
  const apiKey = process.env.BZZOIRO_API_KEY || "fccc7814bede204c09b2dc587206059be059597e";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/events/?status=inprogress&limit=50`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const events = data?.results || [];

    return events.map((ev: any) => ({
      id: `bz_live_${ev.id}`,
      homeTeam: {
        id: ev.home_team_id,
        name: ev.home_team,
        logo: undefined,
      },
      awayTeam: {
        id: ev.away_team_id,
        name: ev.away_team,
        logo: undefined,
      },
      homeScore: ev.home_score,
      awayScore: ev.away_score,
      status: "LIVE" as const,
      minute: ev.current_minute || null,
      matchDate: ev.event_date,
      venue: ev.venue_id ? `Venue #${ev.venue_id}` : undefined,
      league: ev.round_label || "Live Match",
    }));
  } catch (error) {
    console.warn("[Bzzoiro] Live matches fetch failed:", error);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch standings representation from Bzzoiro
 * Since Bzzoiro's v2 focuses on events/teams/leagues, if a dedicated standings
 * endpoint is unavailable, it returns null to trigger fallback chain.
 */
export async function fetchBzzoiroStandings(
  leagueKey: number | string
): Promise<StandardStandingsTable | null> {
  const apiKey = process.env.BZZOIRO_API_KEY || "fccc7814bede204c09b2dc587206059be059597e";
  const bzLeagueId = BZZOIRO_LEAGUE_MAP[leagueKey] || 1;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/leagues/${bzLeagueId}/standings/`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data || !data.standings) return null;

    // Normalization if available
    const leagueCode = BZZOIRO_CODE_MAP[bzLeagueId] || "PL";
    const meta = LEAGUE_META[leagueCode] || LEAGUE_META.PL;

    const standings: StandardStanding[] = (data.standings || []).map((row: any) => ({
      position: row.rank || row.position,
      teamId: row.team_id,
      teamName: row.team_name || row.team,
      teamLogo: row.team_logo || `https://crests.football-data.org/${row.team_id}.png`,
      played: row.played ?? 0,
      won: row.won ?? 0,
      drawn: row.drawn ?? 0,
      lost: row.lost ?? 0,
      goalsFor: row.goals_for ?? 0,
      goalsAgainst: row.goals_against ?? 0,
      goalsDiff: row.goals_diff ?? 0,
      points: row.points ?? 0,
      form: row.form || "—",
    }));

    return {
      leagueId: leagueKey,
      leagueCode,
      leagueName: meta.name,
      country: meta.country,
      logo: meta.logo,
      season: 2026,
      uclSpots: meta.uclSpots,
      relegationSpots: meta.relegationSpots,
      standings,
      provider: "Bzzoiro Sports Data",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
