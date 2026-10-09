import { StandardMatch, StandardStandingsTable } from "../types";
import { LEAGUE_META } from "./football-data-org";

const BASE_URL = "https://footballdata.io/api/v1";
const TIMEOUT_MS = 5000;

/**
 * Fetch matches from footballdata.io (Tertiary Provider)
 */
export async function fetchFootballdataIoMatches(
  leagueKey: number | string
): Promise<StandardMatch[]> {
  const token =
    process.env.FOOTBALLDATA_IO_KEY ||
    "fd_7493197ff678d02f64444362755bc87937363384ee3f6e30";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/matches?limit=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const matches = json.data || json.matches || [];
    const meta = LEAGUE_META["PL"];

    return matches.map((m: any) => ({
      id: `fdio_${m.id || Math.random()}`,
      homeTeam: {
        name: m.home_team || m.homeTeam?.name || "Home Team",
        logo: m.home_logo || m.homeTeam?.logo,
      },
      awayTeam: {
        name: m.away_team || m.awayTeam?.name || "Away Team",
        logo: m.away_logo || m.awayTeam?.logo,
      },
      homeScore: m.home_score ?? null,
      awayScore: m.away_score ?? null,
      status: m.status === "live" ? "LIVE" : m.status === "finished" ? "FINISHED" : "NOT_STARTED",
      minute: m.minute || null,
      matchDate: m.date || new Date().toISOString(),
      league: m.league_name || meta.name,
      leagueLogo: meta.logo,
    }));
  } catch (error: any) {
    console.warn(`[footballdata.io] Matches fetch failed:`, error?.message || error);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
