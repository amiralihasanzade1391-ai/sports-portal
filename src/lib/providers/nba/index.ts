import { unstable_cache } from "next/cache";
import {
  getNbaStandings as fetchNbaStandings,
  getNbaTodayGames as fetchNbaGames,
  getNbaPlayerLeaders as fetchNbaLeaders,
} from "./balldontlie";
import { NbaStandings, NbaGame, NbaLeadersData } from "../types";

/**
 * NBA Standings with 1-hour cache
 */
export async function getNbaStandings(): Promise<NbaStandings> {
  const cachedFetch = unstable_cache(
    async () => {
      return fetchNbaStandings();
    },
    ["nba-standings-v1"],
    {
      revalidate: 3600,
      tags: ["nba-standings"],
    }
  );

  return cachedFetch();
}

/**
 * NBA Today Games with 60-second cache
 */
export async function getNbaTodayGames(): Promise<NbaGame[]> {
  const cachedFetch = unstable_cache(
    async () => {
      return fetchNbaGames();
    },
    ["nba-today-games-v1"],
    {
      revalidate: 60,
      tags: ["nba-games"],
    }
  );

  return cachedFetch();
}

/**
 * NBA Player Leaders with 6-hour cache
 */
export async function getNbaPlayerLeaders(): Promise<NbaLeadersData> {
  const cachedFetch = unstable_cache(
    async () => {
      return fetchNbaLeaders();
    },
    ["nba-player-leaders-v1"],
    {
      revalidate: 21600,
      tags: ["nba-leaders"],
    }
  );

  return cachedFetch();
}
