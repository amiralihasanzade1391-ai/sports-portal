const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";
const TIMEOUT_MS = 5000;

// Local fast-path logo cache for immediate rendering without network latency
const KNOWN_TEAM_BADGES: Record<string, string> = {
  "arsenal": "https://crests.football-data.org/57.png",
  "manchester city": "https://crests.football-data.org/65.png",
  "liverpool": "https://crests.football-data.org/64.png",
  "chelsea": "https://crests.football-data.org/61.png",
  "manchester united": "https://crests.football-data.org/66.png",
  "tottenham": "https://crests.football-data.org/73.png",
  "aston villa": "https://crests.football-data.org/58.png",
  "newcastle": "https://crests.football-data.org/67.png",
  "real madrid": "https://crests.football-data.org/86.png",
  "barcelona": "https://crests.football-data.org/81.png",
  "atletico madrid": "https://crests.football-data.org/78.png",
  "bayern munich": "https://crests.football-data.org/5.png",
  "bayer leverkusen": "https://crests.football-data.org/3.png",
  "inter milan": "https://crests.football-data.org/108.png",
  "juventus": "https://crests.football-data.org/109.png",
  "ac milan": "https://crests.football-data.org/98.png",
  "paris saint-germain": "https://crests.football-data.org/524.png",
  "psg": "https://crests.football-data.org/524.png",
};

/**
 * Lookup high-resolution team crest badge from TheSportsDB
 */
export async function searchTeamBadge(teamName: string): Promise<string | null> {
  if (!teamName) return null;
  const normalized = teamName.toLowerCase().trim();

  // 1. Fast cache
  if (KNOWN_TEAM_BADGES[normalized]) {
    return KNOWN_TEAM_BADGES[normalized];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `${BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`,
      {
        signal: controller.signal,
        next: { revalidate: 86400 }, // 24 hours
      }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const team = json?.teams?.[0];

    if (team?.strBadge) {
      return team.strBadge;
    }
    return null;
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
