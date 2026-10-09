"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Trophy, Calendar, CheckCircle2, Flame, Award, Radio, Search, Activity, Sparkles } from "lucide-react";
import { formatLocalizedNumber } from "@/lib/i18n-utils";
import {
  type StandardStandingsTable,
  type SeasonProjection,
  type GoalTimingData,
  type NbaStandings,
  type NbaGame,
  type NbaLeadersData,
} from "@/lib/providers/types";
import { MatchCard, type MatchData } from "@/components/matches/match-card";
import { LeagueStandings } from "@/components/matches/league-standings";
import { NbaStandingsTable } from "@/components/nba/nba-standings";
import { NbaGameCard } from "@/components/nba/nba-game-card";
import { NbaPlayerLeaders } from "@/components/nba/nba-player-leaders";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLiveMatches } from "@/hooks/use-live-matches";

interface MultiSportViewProps {
  initialSport?: "football" | "nba";
  formattedMatches: MatchData[];
  liveMatches: MatchData[];
  upcomingMatches: MatchData[];
  finishedMatches: MatchData[];
  footballStandings: StandardStandingsTable;
  footballProjection: SeasonProjection | null;
  footballGoalTiming: GoalTimingData | null;
  nbaStandings: NbaStandings;
  nbaGames: NbaGame[];
  nbaLeaders: NbaLeadersData;
}

export function MultiSportView({
  initialSport = "football",
  formattedMatches,
  liveMatches,
  upcomingMatches,
  finishedMatches,
  footballStandings,
  footballProjection,
  footballGoalTiming,
  nbaStandings,
  nbaGames,
  nbaLeaders,
}: MultiSportViewProps) {
  const t = useTranslations("matches");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchFilter, setSearchFilter] = useState("");

  const activeSport = (searchParams.get("sport") as "football" | "nba") || initialSport;

  const handleSportChange = (sport: "football" | "nba") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sport", sport);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Real-time SWR polling for in-play football fixtures
  const { matches: polledLiveMatches } = useLiveMatches({ refreshInterval: 30000 });

  // Dynamically resolve live matches: use real-time polled items when available
  const activeLiveFootball: MatchData[] = useMemo(() => {
    if (polledLiveMatches && polledLiveMatches.length > 0) {
      return polledLiveMatches.map((m) => ({
        id: m.id,
        homeTeam: {
          name: m.homeTeam.name,
          logo: m.homeTeam.logo || "",
        },
        awayTeam: {
          name: m.awayTeam.name,
          logo: m.awayTeam.logo || "",
        },
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        status: m.status as any,
        minute: m.minute,
        league: m.league,
        matchDate: m.matchDate || "Live",
        venue: m.venue || "Stadium",
      }));
    }
    return liveMatches;
  }, [polledLiveMatches, liveMatches]);

  const liveNbaGames = nbaGames.filter((g) => g.status === "LIVE");
  const totalLiveWorldwide = activeLiveFootball.length + liveNbaGames.length;

  // Filter football matches based on cross-sport search
  const filteredFootballMatches = useMemo(() => {
    if (!searchFilter.trim()) return formattedMatches;
    const q = searchFilter.toLowerCase().trim();
    return formattedMatches.filter(
      (m) =>
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q)
    );
  }, [formattedMatches, searchFilter]);

  const filteredFootballLive = useMemo(() => {
    if (!searchFilter.trim()) return activeLiveFootball;
    const q = searchFilter.toLowerCase().trim();
    return activeLiveFootball.filter(
      (m) =>
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q)
    );
  }, [activeLiveFootball, searchFilter]);

  const filteredFootballUpcoming = filteredFootballMatches.filter((m) => m.status === "NOT_STARTED");
  const filteredFootballFinished = filteredFootballMatches.filter((m) => m.status === "FINISHED");

  // Filter NBA games based on cross-sport search
  const filteredNbaGames = useMemo(() => {
    if (!searchFilter.trim()) return nbaGames;
    const q = searchFilter.toLowerCase().trim();
    return nbaGames.filter(
      (g) =>
        g.homeTeam.name.toLowerCase().includes(q) ||
        g.homeTeam.city.toLowerCase().includes(q) ||
        g.homeTeam.abbreviation.toLowerCase().includes(q) ||
        g.awayTeam.name.toLowerCase().includes(q) ||
        g.awayTeam.city.toLowerCase().includes(q) ||
        g.awayTeam.abbreviation.toLowerCase().includes(q)
    );
  }, [nbaGames, searchFilter]);

  return (
    <div className="space-y-6">
      {/* ─── Senior Architect Enhancement 1: Live Radar Alert Bar ──────── */}
      {totalLiveWorldwide > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-500/20 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold font-estedad">
              <span className="text-foreground">
                {isRtl ? "مرکز مسابقات زنده (Live Radar):" : "Live Match Radar:"}
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                {formatLocalizedNumber(totalLiveWorldwide, locale)} {isRtl ? "رویداد در جریان است" : "Games Live Now"}
              </span>
              <span className="text-muted-foreground text-xs hidden sm:inline">
                ({liveMatches.length} ⚽ Football • {liveNbaGames.length} 🏀 NBA)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {liveMatches.length > 0 && activeSport !== "football" && (
              <button
                onClick={() => handleSportChange("football")}
                className="text-xs px-2.5 py-1 rounded-lg bg-background border hover:bg-muted font-bold transition-colors"
              >
                ⚽ {isRtl ? "مشاهده فوتبال" : "View Football"}
              </button>
            )}
            {liveNbaGames.length > 0 && activeSport !== "nba" && (
              <button
                onClick={() => handleSportChange("nba")}
                className="text-xs px-2.5 py-1 rounded-lg bg-background border hover:bg-muted font-bold transition-colors"
              >
                🏀 {isRtl ? "مشاهده NBA" : "View NBA"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Top-Level Sport Switcher & Cross-Sport Search ─────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-muted/60 rounded-2xl border self-start">
          <button
            onClick={() => handleSportChange("football")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeSport === "football"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base">⚽</span>
            <span>{isRtl ? "فوتبال" : "Football"}</span>
            <Badge variant="outline" className="text-[10px] ml-1 font-estedad">
              {formatLocalizedNumber(formattedMatches.length, locale)}
            </Badge>
          </button>

          <button
            onClick={() => handleSportChange("nba")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeSport === "nba"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base">🏀</span>
            <span>NBA</span>
            <Badge variant="outline" className="text-[10px] ml-1 font-estedad bg-primary/10 text-primary border-primary/20">
              {isRtl ? "فصل ۲۰۲۶/۲۷" : "2026/27"}
            </Badge>
          </button>
        </div>

        {/* Senior Architect Enhancement 2: Unified Cross-Sport Realtime Search */}
        <div className="relative w-full md:w-72">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={
              activeSport === "football"
                ? isRtl
                  ? "جستجوی تیم یا لیگ فوتبال..."
                  : "Filter football clubs, leagues..."
                : isRtl
                ? "جستجوی تیم بسکتبال NBA..."
                : "Filter NBA teams, cities..."
            }
            className={`h-10 text-xs sm:text-sm rounded-xl ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"}`}
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter("")}
              className={`absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground ${
                isRtl ? "left-3" : "right-3"
              }`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ─── FOOTBALL SPORT VIEW ──────────────────────────────────────── */}
      {activeSport === "football" && (
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
            <TabsList className="grid grid-cols-5 w-full sm:w-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm font-estedad">
                {t("all")} ({formatLocalizedNumber(filteredFootballMatches.length, locale)})
              </TabsTrigger>
              <TabsTrigger value="live" className="text-xs sm:text-sm gap-1.5 font-estedad">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {t("live")} ({formatLocalizedNumber(filteredFootballLive.length, locale)})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs sm:text-sm font-estedad">
                {t("upcoming")} ({formatLocalizedNumber(filteredFootballUpcoming.length, locale)})
              </TabsTrigger>
              <TabsTrigger value="finished" className="text-xs sm:text-sm gap-1 font-estedad">
                <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                {t("finished")} ({formatLocalizedNumber(filteredFootballFinished.length, locale)})
              </TabsTrigger>
              <TabsTrigger value="standings" className="text-xs sm:text-sm gap-1">
                <Trophy className="h-3.5 w-3.5" /> {t("standings")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-6 mt-0">
            {filteredFootballMatches.length === 0 ? (
              <EmptyState icon={Calendar} title={t("noMatches")} description="No match fixtures recorded matching filter." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFootballMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="live" className="space-y-6 mt-0">
            {filteredFootballLive.length === 0 ? (
              <EmptyState icon={Trophy} title={t("noLiveMatches")} description="There are currently no active games in play." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFootballLive.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6 mt-0">
            {filteredFootballUpcoming.length === 0 ? (
              <EmptyState icon={Calendar} title={t("noUpcoming")} description="All currently scheduled matches have concluded." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFootballUpcoming.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="finished" className="space-y-6 mt-0">
            {filteredFootballFinished.length === 0 ? (
              <EmptyState icon={CheckCircle2} title={t("noMatches")} description="No completed matches recorded." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFootballFinished.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="standings" className="space-y-6 mt-0">
            <LeagueStandings
              initialLeagueId={39}
              initialData={footballStandings}
              initialProjection={footballProjection}
              initialGoalTiming={footballGoalTiming}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* ─── NBA SPORT VIEW ───────────────────────────────────────────── */}
      {activeSport === "nba" && (
        <div className="space-y-8">
          {/* Today's NBA Games Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏀</span>
                <h3 className="text-lg font-black tracking-tight">
                  {isRtl ? "بازی‌های امروز NBA" : "Today's NBA Matchups"}
                </h3>
              </div>
              <Badge variant="outline" className="text-xs font-estedad">
                {formatLocalizedNumber(filteredNbaGames.length, locale)} {isRtl ? "دیدار" : "Games"}
              </Badge>
            </div>

            {filteredNbaGames.length === 0 ? (
              <EmptyState icon={Calendar} title="No NBA Games Found" description="Try clearing your search filter." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredNbaGames.map((game) => (
                  <NbaGameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>

          {/* NBA Conference Standings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black tracking-tight">
                  {isRtl ? "جدول رده‌بندی کنفرانس‌های NBA" : "NBA Conference Standings"}
                </h3>
              </div>
            </div>

            <NbaStandingsTable initialData={nbaStandings} />
          </div>

          {/* NBA Stat Leaders */}
          <NbaPlayerLeaders initialData={nbaLeaders} />
        </div>
      )}
    </div>
  );
}
