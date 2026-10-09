import {
  SeasonProjection,
  GoalTimingData,
  StandardStandingsTable,
  StandardStanding,
  MatchPrediction,
} from "../types";
import { LEAGUE_META } from "./football-data-org";

const BASE_URL = "https://footballcharts-backend.onrender.com/api/v1";
const TIMEOUT_MS = 6000;

export const FC_LEAGUE_MAP: Record<number | string, string> = {
  39: "premier",
  "PL": "premier",
  "premier": "premier",
  140: "spain1",
  "PD": "spain1",
  "spain1": "spain1",
  135: "italy1",
  "SA": "italy1",
  "italy1": "italy1",
  78: "germany1",
  "BL1": "germany1",
  "germany1": "germany1",
  61: "france1",
  "FL1": "france1",
  "france1": "france1",
};

/**
 * Fetch 10,000 Monte Carlo simulation season projections from Football-Charts.com
 */
export async function getSeasonProjection(
  leagueKey: number | string = "premier"
): Promise<SeasonProjection | null> {
  const apiKey =
    process.env.FOOTBALL_CHARTS_API_KEY || "fc_NJ4AHohUbGRuMgbwv_3zEnIzNcQxvCNS";
  const slug = FC_LEAGUE_MAP[leagueKey] || "premier";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/leagues/${slug}/projection/`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!res.ok) {
      console.warn(`[Football-Charts] HTTP ${res.status} for projection ${slug}`);
      return null;
    }

    const json = await res.json();
    const proj = json.projection;
    if (!proj || !proj.teams) return null;

    const teamEntries = Object.entries(proj.teams).map(([teamName, raw]: [string, any]) => ({
      team: teamName,
      titleProb: Number(raw.title || 0),
      top4Prob: Number(raw.top4 || 0),
      relegationProb: Number(raw.bottom3 || raw.relegation || 0),
      meanPts: Number(raw.mean_pts || 0),
      played: Number(raw.played || 0),
      ptsNow: Number(raw.pts_now || 0),
      gdNow: Number(raw.gd_now || 0),
    }));

    // Sort teams by title probability descending, then points
    teamEntries.sort((a, b) => b.titleProb - a.titleProb || b.ptsNow - a.ptsNow);

    return {
      league: proj.league || slug,
      season: proj.season || "2026-2027",
      runDate: proj.run_date || new Date().toISOString().split("T")[0],
      nSims: proj.n_sims || 10000,
      teams: teamEntries,
      provider: "football-charts.com",
      sourceUrl: json.source_url || `https://www.football-charts.com/leagues/england/${slug}?ref=api`,
    };
  } catch (error: any) {
    console.warn(`[Football-Charts] Projection fetch failed:`, error?.message || error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch goal-timing minute distribution from Football-Charts.com
 */
export async function getGoalTiming(
  leagueKey: number | string = "premier"
): Promise<GoalTimingData | null> {
  const apiKey =
    process.env.FOOTBALL_CHARTS_API_KEY || "fc_NJ4AHohUbGRuMgbwv_3zEnIzNcQxvCNS";
  const slug = FC_LEAGUE_MAP[leagueKey] || "premier";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/leagues/${slug}/goal-timing/`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 21600 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (!json.time_bins || !json.data) return null;

    return {
      league: json.league || slug,
      season: json.season || "2026-2027",
      timeBins: json.time_bins || ["0-15", "15-30", "30-45", "45+", "46-60", "60-75", "75-90", "90+"],
      stats: {
        totalGoals: json.stats?.total_goals || 0,
        mostActivePeriod: json.stats?.most_active_period || "46-60",
        lateGoals: json.stats?.late_goals || 0,
      },
      teams: (json.data || []).map((t: any) => ({
        team: t.team,
        total: t.total || 0,
        bins: t.bins || {},
        peakBins: t.peak_bins || [],
        lateSharePct: t.late_share_pct || 0,
      })),
      provider: "football-charts.com",
      sourceUrl: json.source_url,
    };
  } catch (error: any) {
    console.warn(`[Football-Charts] Goal timing fetch failed:`, error?.message || error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch classic/advanced league table from Football-Charts.com
 */
export async function getLeagueTable(
  leagueKey: number | string = "premier",
  view: "classic" | "luck" | "goals" = "classic"
): Promise<StandardStandingsTable | null> {
  const apiKey =
    process.env.FOOTBALL_CHARTS_API_KEY || "fc_NJ4AHohUbGRuMgbwv_3zEnIzNcQxvCNS";
  const slug = FC_LEAGUE_MAP[leagueKey] || "premier";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/leagues/${slug}/table/?view=${view}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const rows = json.table || json.data || [];
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const meta = LEAGUE_META["PL"];

    const standings: StandardStanding[] = rows.map((row: any, i: number) => ({
      position: row.rank || i + 1,
      teamId: row.team,
      teamName: row.team,
      teamLogo: `https://crests.football-data.org/${row.team}.png`,
      played: row.played ?? 0,
      won: row.won ?? 0,
      drawn: row.drawn ?? 0,
      lost: row.lost ?? 0,
      goalsFor: row.gf ?? row.goals_for ?? 0,
      goalsAgainst: row.ga ?? row.goals_against ?? 0,
      goalsDiff: row.gd ?? row.goals_diff ?? 0,
      points: row.pts ?? row.points ?? 0,
      form: row.form || "—",
    }));

    return {
      leagueId: leagueKey,
      leagueCode: slug,
      leagueName: meta.name,
      country: meta.country,
      logo: meta.logo,
      season: json.season || "2026-2027",
      uclSpots: meta.uclSpots,
      relegationSpots: meta.relegationSpots,
      standings,
      provider: "football-charts.com",
      updatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.warn(`[Football-Charts] Table fetch failed:`, error?.message || error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch upcoming fixtures with win/draw/loss probabilities
 */
export async function getMatchPredictions(
  leagueKey: number | string = "premier"
): Promise<MatchPrediction[]> {
  const apiKey =
    process.env.FOOTBALL_CHARTS_API_KEY || "fc_NJ4AHohUbGRuMgbwv_3zEnIzNcQxvCNS";
  const slug = FC_LEAGUE_MAP[leagueKey] || "premier";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/leagues/${slug}/fixtures/`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 21600 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const fixtures = json.fixtures || json.data || [];

    return fixtures.map((f: any) => ({
      matchSlug: f.slug,
      homeTeam: f.home_team || f.home,
      awayTeam: f.away_team || f.away,
      homeWinProb: Number(f.home_win_prob || f.p_home || 0.45),
      drawProb: Number(f.draw_prob || f.p_draw || 0.25),
      awayWinProb: Number(f.away_win_prob || f.p_away || 0.3),
      predictedScore: f.predicted_score || undefined,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
