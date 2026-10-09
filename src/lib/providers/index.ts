import { unstable_cache } from "next/cache";
import {
  StandardStandingsTable,
  StandardMatch,
  SeasonProjection,
  GoalTimingData,
  CircuitBreakerState,
  ProviderHealth,
  StandardStanding,
} from "./types";
import { fetchFootballDataOrgStandings, fetchFootballDataOrgMatches, LEAGUE_META, COMPETITION_CODE_MAP } from "./football/football-data-org";
import { fetchBzzoiroMatches, fetchBzzoiroStandings, getLiveMatches as fetchBzzoiroLiveMatches } from "./football/bzzoiro";
import { fetchFootballdataIoMatches } from "./football/footballdata-io";
import { getSeasonProjection as fetchFCProjection, getGoalTiming as fetchFCGoalTiming, getLeagueTable as fetchFCTable } from "./football/football-charts";

// ─── Circuit Breaker State & Policies ─────────────────────────────────────────
// Policy: 3 failures within 5 minutes (300,000ms) trips circuit OPEN for 10 minutes (600,000ms).
const FAILURE_THRESHOLD = 3;
const FAILURE_WINDOW_MS = 5 * 60 * 1000;
const OPEN_DURATION_MS = 10 * 60 * 1000;

const circuitStates: Record<string, CircuitBreakerState> = {
  "Bzzoiro Sports Data": { state: "CLOSED", failures: 0, lastFailureTime: 0, nextAttemptTime: 0 },
  "football-data.org": { state: "CLOSED", failures: 0, lastFailureTime: 0, nextAttemptTime: 0 },
  "footballdata.io": { state: "CLOSED", failures: 0, lastFailureTime: 0, nextAttemptTime: 0 },
  "football-charts.com": { state: "CLOSED", failures: 0, lastFailureTime: 0, nextAttemptTime: 0 },
  "TheSportsDB": { state: "CLOSED", failures: 0, lastFailureTime: 0, nextAttemptTime: 0 },
  "balldontlie.io": { state: "CLOSED", failures: 0, lastFailureTime: 0, nextAttemptTime: 0 },
};

function isCircuitAvailable(providerName: string): boolean {
  const cb = circuitStates[providerName];
  if (!cb) return true;

  const now = Date.now();
  if (cb.state === "OPEN") {
    if (now >= cb.nextAttemptTime) {
      cb.state = "HALF_OPEN";
      return true;
    }
    return false;
  }
  return true;
}

function recordSuccess(providerName: string) {
  const cb = circuitStates[providerName];
  if (cb) {
    cb.state = "CLOSED";
    cb.failures = 0;
  }
}

function recordFailure(providerName: string) {
  const cb = circuitStates[providerName];
  if (!cb) return;

  const now = Date.now();
  if (now - cb.lastFailureTime > FAILURE_WINDOW_MS) {
    cb.failures = 1;
  } else {
    cb.failures += 1;
  }
  cb.lastFailureTime = now;

  if (cb.failures >= FAILURE_THRESHOLD) {
    cb.state = "OPEN";
    cb.nextAttemptTime = now + OPEN_DURATION_MS;
    console.warn(`[Circuit Breaker] Tripped OPEN for ${providerName}. Skipping for 10 minutes.`);
  }
}

export function getProviderHealth(): ProviderHealth[] {
  return Object.entries(circuitStates).map(([name, cb]) => ({
    name,
    status: cb.state === "OPEN" ? "CIRCUIT_OPEN" : cb.failures > 0 ? "DEGRADED" : "ONLINE",
    failures: cb.failures,
    lastFailure: cb.lastFailureTime ? new Date(cb.lastFailureTime).toISOString() : undefined,
  }));
}

// ─── High-Fidelity Guaranteed Fallback Standings ──────────────────────────────
const FALLBACK_STANDINGS: Record<string, StandardStanding[]> = {
  PL: [
    { position: 1, teamId: 65, teamName: "Manchester City", teamLogo: "https://crests.football-data.org/65.png", played: 6, won: 5, drawn: 0, lost: 1, goalsFor: 15, goalsAgainst: 6, goalsDiff: 9, points: 15, form: "WWWLW", description: "Champions League" },
    { position: 2, teamId: 57, teamName: "Arsenal", teamLogo: "https://crests.football-data.org/57.png", played: 6, won: 4, drawn: 2, lost: 0, goalsFor: 14, goalsAgainst: 4, goalsDiff: 10, points: 14, form: "WDWDW", description: "Champions League" },
    { position: 3, teamId: 64, teamName: "Liverpool", teamLogo: "https://crests.football-data.org/64.png", played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 13, goalsAgainst: 5, goalsDiff: 8, points: 13, form: "WWLWW", description: "Champions League" },
    { position: 4, teamId: 61, teamName: "Chelsea", teamLogo: "https://crests.football-data.org/61.png", played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 14, goalsAgainst: 7, goalsDiff: 7, points: 13, form: "WWWLD", description: "Champions League" },
    { position: 5, teamId: 58, teamName: "Aston Villa", teamLogo: "https://crests.football-data.org/58.png", played: 6, won: 4, drawn: 0, lost: 2, goalsFor: 11, goalsAgainst: 8, goalsDiff: 3, points: 12, form: "LWWWW", description: "Europa League" },
    { position: 18, teamId: 341, teamName: "Ipswich Town", teamLogo: "https://crests.football-data.org/341.png", played: 6, won: 0, drawn: 3, lost: 3, goalsFor: 5, goalsAgainst: 12, goalsDiff: -7, points: 3, form: "DLDDL", description: "Relegation" },
    { position: 19, teamId: 338, teamName: "Leicester City", teamLogo: "https://crests.football-data.org/338.png", played: 6, won: 0, drawn: 3, lost: 3, goalsFor: 6, goalsAgainst: 14, goalsDiff: -8, points: 3, form: "DLDLL", description: "Relegation" },
    { position: 20, teamId: 340, teamName: "Southampton", teamLogo: "https://crests.football-data.org/340.png", played: 6, won: 0, drawn: 1, lost: 5, goalsFor: 3, goalsAgainst: 15, goalsDiff: -12, points: 1, form: "LLDLL", description: "Relegation" },
  ],
};

// ─── Standings Orchestrator with Fallback ────────────────────────────────────
export async function getStandings(leagueKey: number | string = 39): Promise<StandardStandingsTable> {
  const code = COMPETITION_CODE_MAP[leagueKey] || "PL";
  const meta = LEAGUE_META[code] || LEAGUE_META.PL;

  const cachedFetch = unstable_cache(
    async () => {
      const startTime = Date.now();

      // Provider 1: football-data.org (Active 2026/2027 live standings)
      if (isCircuitAvailable("football-data.org")) {
        try {
          const res = await fetchFootballDataOrgStandings(code);
          if (res && res.standings.length > 0) {
            recordSuccess("football-data.org");
            console.log(`[Provider Orchestrator] Standings served by football-data.org for ${code} in ${Date.now() - startTime}ms`);
            return res;
          }
        } catch {
          recordFailure("football-data.org");
        }
      }

      // Provider 2: Bzzoiro Sports Data
      if (isCircuitAvailable("Bzzoiro Sports Data")) {
        try {
          const res = await fetchBzzoiroStandings(leagueKey);
          if (res && res.standings.length > 0) {
            recordSuccess("Bzzoiro Sports Data");
            console.log(`[Provider Orchestrator] Standings served by Bzzoiro in ${Date.now() - startTime}ms`);
            return res;
          }
        } catch {
          recordFailure("Bzzoiro Sports Data");
        }
      }

      // Provider 3: Football-Charts.com Table
      if (isCircuitAvailable("football-charts.com")) {
        try {
          const res = await fetchFCTable(code);
          if (res && res.standings.length > 0) {
            recordSuccess("football-charts.com");
            console.log(`[Provider Orchestrator] Standings served by football-charts.com in ${Date.now() - startTime}ms`);
            return res;
          }
        } catch {
          recordFailure("football-charts.com");
        }
      }

      // Final Guaranteed Fallback
      console.warn(`[Provider Orchestrator] All remote standings providers unavailable for ${code}. Serving guaranteed fallback.`);
      return {
        leagueId: leagueKey,
        leagueCode: code,
        leagueName: meta.name,
        country: meta.country,
        logo: meta.logo,
        season: 2026,
        uclSpots: meta.uclSpots,
        relegationSpots: meta.relegationSpots,
        standings: FALLBACK_STANDINGS[code] || FALLBACK_STANDINGS.PL,
        provider: "Local High-Fidelity Cache",
        updatedAt: new Date().toISOString(),
        isFallback: true,
      };
    },
    [`multi-provider-standings-v3-${code}`],
    {
      revalidate: 3600, // 1 hour caching
      tags: [`standings-${code}`],
    }
  );

  return cachedFetch();
}

// ─── Matches Orchestrator with Fallback ──────────────────────────────────────
export async function getMatches(leagueKey: number | string = 39): Promise<StandardMatch[]> {
  const code = COMPETITION_CODE_MAP[leagueKey] || "PL";

  const cachedFetch = unstable_cache(
    async () => {
      const startTime = Date.now();

      // Priority 1: Bzzoiro Sports Data (Primary for Match Events)
      if (isCircuitAvailable("Bzzoiro Sports Data")) {
        try {
          const res = await fetchBzzoiroMatches(leagueKey);
          if (res && res.length > 0) {
            recordSuccess("Bzzoiro Sports Data");
            console.log(`[Provider Orchestrator] Matches served by Bzzoiro for ${code} in ${Date.now() - startTime}ms`);
            return res;
          }
        } catch {
          recordFailure("Bzzoiro Sports Data");
        }
      }

      // Priority 2: football-data.org (Secondary)
      if (isCircuitAvailable("football-data.org")) {
        try {
          const res = await fetchFootballDataOrgMatches(code);
          if (res && res.length > 0) {
            recordSuccess("football-data.org");
            console.log(`[Provider Orchestrator] Matches served by football-data.org in ${Date.now() - startTime}ms`);
            return res;
          }
        } catch {
          recordFailure("football-data.org");
        }
      }

      // Priority 3: footballdata.io (Tertiary)
      if (isCircuitAvailable("footballdata.io")) {
        try {
          const res = await fetchFootballdataIoMatches(leagueKey);
          if (res && res.length > 0) {
            recordSuccess("footballdata.io");
            console.log(`[Provider Orchestrator] Matches served by footballdata.io in ${Date.now() - startTime}ms`);
            return res;
          }
        } catch {
          recordFailure("footballdata.io");
        }
      }

      return [];
    },
    [`multi-provider-matches-v3-${code}`],
    {
      revalidate: 60, // 1 minute caching for live fixtures
      tags: [`matches-${code}`],
    }
  );

  return cachedFetch();
}

// ─── Season Projections (Specialist: Football-Charts.com) ───────────────────
export async function getSeasonProjection(leagueKey: number | string = "premier"): Promise<SeasonProjection | null> {
  const cachedFetch = unstable_cache(
    async () => {
      try {
        return await fetchFCProjection(leagueKey);
      } catch (err) {
        console.warn("[Provider Orchestrator] Season projection failed:", err);
        return null;
      }
    },
    [`fc-projection-v1-${leagueKey}`],
    {
      revalidate: 21600, // 6 hours
      tags: [`projection-${leagueKey}`],
    }
  );

  return cachedFetch();
}

// ─── Goal Timing Heatmap (Specialist: Football-Charts.com) ───────────────────
export async function getGoalTiming(leagueKey: number | string = "premier"): Promise<GoalTimingData | null> {
  const cachedFetch = unstable_cache(
    async () => {
      try {
        return await fetchFCGoalTiming(leagueKey);
      } catch (err) {
        console.warn("[Provider Orchestrator] Goal timing failed:", err);
        return null;
      }
    },
    [`fc-goal-timing-v1-${leagueKey}`],
    {
      revalidate: 21600, // 6 hours
      tags: [`goal-timing-${leagueKey}`],
    }
  );

  return cachedFetch();
}

// ─── Realtime Live Matches Orchestrator ─────────────────────────────────────
export async function getLiveMatches(): Promise<StandardMatch[]> {
  const cachedFetch = unstable_cache(
    async () => {
      // 1. Try Primary: Bzzoiro Live
      if (isCircuitAvailable("Bzzoiro Sports Data")) {
        try {
          const live = await fetchBzzoiroLiveMatches();
          if (live && live.length > 0) {
            recordSuccess("Bzzoiro Sports Data");
            return live;
          }
        } catch {
          recordFailure("Bzzoiro Sports Data");
        }
      }

      // 2. Try Secondary: football-data.org live matches
      if (isCircuitAvailable("football-data.org")) {
        try {
          const live = await fetchFootballDataOrgMatches("PL");
          const inPlay = live.filter((m) => m.status === "LIVE" || m.status === "HALF_TIME");
          if (inPlay.length > 0) {
            recordSuccess("football-data.org");
            return inPlay;
          }
        } catch {
          recordFailure("football-data.org");
        }
      }

      return [];
    },
    ["live-matches-worldwide-v1"],
    {
      revalidate: 20, // 20s cache for ultra-responsive live matches
      tags: ["live-matches"],
    }
  );

  return cachedFetch();
}

// ─── NBA Domain Re-Exports ──────────────────────────────────────────────────
export { getNbaStandings, getNbaTodayGames, getNbaPlayerLeaders } from "./nba";
export * from "./types";

