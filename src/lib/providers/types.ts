/**
 * Multi-Sport Provider Service - Domain Types
 * Unified contract across Bzzoiro, football-data.org, footballdata.io,
 * Football-Charts, and TheSportsDB.
 */

export type Sport = "football" | "nba";

export interface StandardStanding {
  position: number;
  teamId: string | number;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  points: number;
  form: string; // e.g. "WWDLW"
  description?: string | null;
  status?: string;
}

export interface StandardStandingsTable {
  leagueId: number | string;
  leagueCode: string;
  leagueName: string;
  leagueNameFa?: string;
  country: string;
  countryFa?: string;
  logo: string;
  flag?: string;
  season: number | string;
  uclSpots: number;
  relegationSpots: number;
  standings: StandardStanding[];
  provider: string;
  updatedAt: string;
  isFallback?: boolean;
}

export type MatchStatus =
  | "NOT_STARTED"
  | "LIVE"
  | "FIRST_HALF"
  | "HALF_TIME"
  | "SECOND_HALF"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

export interface MatchPrediction {
  matchSlug?: string;
  homeTeam: string;
  awayTeam: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedScore?: string;
}

export interface StandardMatch {
  id: string | number;
  homeTeam: {
    id?: string | number;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id?: string | number;
    name: string;
    logo?: string;
  };
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute: number | null;
  matchDate: string;
  venue?: string;
  league: string;
  leagueLogo?: string;
  prediction?: MatchPrediction;
}

export interface TeamProjectionItem {
  team: string;
  titleProb: number; // 0..1
  top4Prob: number;  // 0..1
  relegationProb: number; // 0..1
  meanPts: number;
  played: number;
  ptsNow: number;
  gdNow: number;
}

export interface SeasonProjection {
  league: string;
  season: string;
  runDate: string;
  nSims: number;
  teams: TeamProjectionItem[];
  provider: string;
  sourceUrl?: string;
}

export interface TeamGoalTiming {
  team: string;
  total: number;
  bins: Record<string, number>;
  peakBins: string[];
  lateSharePct?: number;
}

export interface GoalTimingData {
  league: string;
  season: string;
  timeBins: string[];
  stats: {
    totalGoals: number;
    mostActivePeriod: string;
    lateGoals?: number;
  };
  teams: TeamGoalTiming[];
  provider: string;
  sourceUrl?: string;
}

export interface CircuitBreakerState {
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failures: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

export interface ProviderHealth {
  name: string;
  status: "ONLINE" | "DEGRADED" | "CIRCUIT_OPEN";
  failures: number;
  lastSuccess?: string;
  lastFailure?: string;
}

// ─── NBA Domain Types ─────────────────────────────────────────────────────────

export type NbaConference = "East" | "West";

export interface NbaStandingItem {
  rank: number;
  teamId: number | string;
  teamName: string;
  city: string;
  abbreviation: string;
  logo: string;
  conference: NbaConference;
  division: string;
  wins: number;
  losses: number;
  winPct: number;
  gamesBehind: number;
  homeRecord: string;
  roadRecord: string;
  l10: string;
  streak: string;
}

export interface NbaStandings {
  season: number | string;
  east: NbaStandingItem[];
  west: NbaStandingItem[];
  updatedAt: string;
  provider: string;
  isFallback?: boolean;
}

export interface NbaGame {
  id: number | string;
  homeTeam: {
    id: number | string;
    name: string;
    city: string;
    abbreviation: string;
    logo: string;
    score: number | null;
  };
  awayTeam: {
    id: number | string;
    name: string;
    city: string;
    abbreviation: string;
    logo: string;
    score: number | null;
  };
  status: "SCHEDULED" | "LIVE" | "FINAL" | "POSTPONED";
  period: number | null;
  time: string | null;
  date: string;
  arena?: string;
}

export interface NbaPlayerLeader {
  id: number | string;
  name: string;
  team: string;
  teamAbbr: string;
  photo: string;
  statValue: number;
  statLabel: string;
  category: "points" | "rebounds" | "assists";
}

export interface NbaLeadersData {
  season: string;
  points: NbaPlayerLeader[];
  rebounds: NbaPlayerLeader[];
  assists: NbaPlayerLeader[];
  updatedAt: string;
}

// ─── Unified Cross-Sport Item (for Live Ticker & Radar) ─────────────────────

export interface CrossSportLiveItem {
  id: string;
  sport: Sport;
  league: string;
  homeTeam: string;
  homeLogo?: string;
  awayTeam: string;
  awayLogo?: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "LIVE" | "FINAL" | "SCHEDULED";
  detail: string; // e.g. "72'", "Q3 4:12", "FT", "8:00 PM"
}

