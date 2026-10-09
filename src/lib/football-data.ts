/**
 * Football Data Service - Routed through Multi-Sport Provider Architecture
 */
export {
  getStandings,
  getMatches,
  getSeasonProjection,
  getGoalTiming,
  getProviderHealth,
} from "./providers";

export * from "./providers/types";
