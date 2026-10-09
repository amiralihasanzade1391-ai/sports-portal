import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getLocalizedField, formatLocalizedDate } from "@/lib/i18n-utils";
import {
  getStandings,
  getSeasonProjection,
  getGoalTiming,
  getNbaStandings,
  getNbaTodayGames,
  getNbaPlayerLeaders,
} from "@/lib/providers";
import { PageHeader } from "@/components/shared/page-header";
import { type MatchData } from "@/components/matches/match-card";
import { MultiSportView } from "@/components/matches/multi-sport-view";

interface MatchesPageProps {
  params: { locale: string };
  searchParams?: { sport?: string };
}

export async function generateMetadata({
  params: { locale },
}: MatchesPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "matches" });
  return {
    title: `${t("fixturesTitle")} | Sports Portal`,
    description: t("fixturesDescription"),
  };
}

export default async function MatchesPage({
  params: { locale },
  searchParams,
}: MatchesPageProps) {
  const t = await getTranslations({ locale, namespace: "matches" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const initialSport = searchParams?.sport === "nba" ? "nba" : "football";

  // Prefetch database football fixtures + external league data & NBA multi-sport data
  const [
    dbMatches,
    initialStandings,
    initialProjection,
    initialGoalTiming,
    nbaStandings,
    nbaGames,
    nbaLeaders,
  ] = await Promise.all([
    prisma.match.findMany({
      include: {
        homeTeam: {
          select: { id: true, name: true, nameFa: true, shortName: true, logo: true },
        },
        awayTeam: {
          select: { id: true, name: true, nameFa: true, shortName: true, logo: true },
        },
      },
      orderBy: { matchDate: "desc" },
    }),
    getStandings("PL"),
    getSeasonProjection("premier"),
    getGoalTiming("premier"),
    getNbaStandings(),
    getNbaTodayGames(),
    getNbaPlayerLeaders(),
  ]);

  // Map to MatchData interface with dual-language resolution
  const formattedMatches: MatchData[] = dbMatches.map((m) => ({
    id: m.id,
    homeTeam: {
      name: getLocalizedField(m.homeTeam, "name", locale) || m.homeTeam.name,
      logo: m.homeTeam.logo,
    },
    awayTeam: {
      name: getLocalizedField(m.awayTeam, "name", locale) || m.awayTeam.name,
      logo: m.awayTeam.logo,
    },
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: m.status as any,
    minute: m.minute,
    league: getLocalizedField(m, "league", locale) || m.league,
    matchDate: formatLocalizedDate(m.matchDate, locale),
    venue: getLocalizedField(m, "venue", locale) || m.venue || "Official Stadium",
  }));

  const liveMatches = formattedMatches.filter(
    (m) =>
      m.status === "FIRST_HALF" ||
      m.status === "SECOND_HALF" ||
      m.status === "HALF_TIME"
  );

  const upcomingMatches = formattedMatches.filter(
    (m) => m.status === "NOT_STARTED"
  );

  const finishedMatches = formattedMatches.filter(
    (m) => m.status === "FINISHED"
  );

  return (
    <div className="container py-8 space-y-6">
      <PageHeader
        title={t("fixturesTitle")}
        description={t("fixturesDescription")}
        breadcrumbs={[{ label: tNav("matches") }]}
      />

      <MultiSportView
        initialSport={initialSport}
        formattedMatches={formattedMatches}
        liveMatches={liveMatches}
        upcomingMatches={upcomingMatches}
        finishedMatches={finishedMatches}
        footballStandings={initialStandings}
        footballProjection={initialProjection}
        footballGoalTiming={initialGoalTiming}
        nbaStandings={nbaStandings}
        nbaGames={nbaGames}
        nbaLeaders={nbaLeaders}
      />
    </div>
  );
}
