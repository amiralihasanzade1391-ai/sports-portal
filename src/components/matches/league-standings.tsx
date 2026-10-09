"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import useSWR from "swr";
import { useLocale, useTranslations } from "next-intl";
import { Search, AlertCircle, Info, Sparkles, Flame, Trophy } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import {
  type StandardStandingsTable,
  type StandardStanding,
  type SeasonProjection,
  type GoalTimingData,
} from "@/lib/providers/types";
import { formatLocalizedNumber } from "@/lib/i18n-utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SeasonProjectionCard } from "@/components/matches/season-projection";
import { GoalTimingHeatmap } from "@/components/matches/goal-timing-heatmap";

export const COMPETITIONS_LIST = [
  { id: 39, code: "PL", name: "Premier League", nameFa: "لیگ برتر انگلیس", logo: "https://crests.football-data.org/PL.png" },
  { id: 140, code: "PD", name: "La Liga", nameFa: "لالیگا اسپانیا", logo: "https://crests.football-data.org/laliga.png" },
  { id: 135, code: "SA", name: "Serie A", nameFa: "سری آ ایتالیا", logo: "https://crests.football-data.org/SA.png" },
  { id: 78, code: "BL1", name: "Bundesliga", nameFa: "بوندسلیگا آلمان", logo: "https://crests.football-data.org/BL1.png" },
  { id: 61, code: "FL1", name: "Ligue 1", nameFa: "لوشامپیونا فرانسه", logo: "https://crests.football-data.org/FL1.png" },
  { id: 2, code: "CL", name: "Champions League", nameFa: "لیگ قهرمانان اروپا", logo: "https://crests.football-data.org/CL.png" },
];

interface LeagueStandingsProps {
  initialLeagueId?: number;
  initialData?: StandardStandingsTable;
  initialProjection?: SeasonProjection | null;
  initialGoalTiming?: GoalTimingData | null;
}

export function LeagueStandings({
  initialLeagueId = 39,
  initialData,
  initialProjection,
  initialGoalTiming,
}: LeagueStandingsProps) {
  const t = useTranslations("matches");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [selectedLeagueId, setSelectedLeagueId] = useState<number>(initialLeagueId);
  const [activeSubTab, setActiveSubTab] = useState<"table" | "projection" | "heatmap">("table");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentCompetition =
    COMPETITIONS_LIST.find((c) => c.id === selectedLeagueId) || COMPETITIONS_LIST[0];

  // SWR query for standings
  const { data: response, error, isLoading } = useSWR<{
    success: boolean;
    data: StandardStandingsTable;
  }>(
    `/api/standings?league=${selectedLeagueId}`,
    fetcher,
    {
      fallbackData:
        initialData && initialData.leagueId === selectedLeagueId
          ? { success: true, data: initialData }
          : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  const standingsData = response?.data;

  // Filter rows by query
  const filteredRows = useMemo(() => {
    if (!standingsData?.standings) return [];
    if (!searchQuery.trim()) return standingsData.standings;

    const q = searchQuery.toLowerCase().trim();
    return standingsData.standings.filter((row) =>
      row.teamName.toLowerCase().includes(q)
    );
  }, [standingsData?.standings, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ─── League Selector Pills / Tabs ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/50 rounded-2xl border">
        {COMPETITIONS_LIST.map((league) => {
          const isSelected = league.id === selectedLeagueId;
          const leagueDisplayName = isRtl ? league.nameFa : league.name;

          return (
            <button
              key={league.id}
              onClick={() => {
                setSelectedLeagueId(league.id);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isSelected
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image
                  src={league.logo}
                  alt={leagueDisplayName}
                  fill
                  sizes="20px"
                  className="object-contain"
                  loading="lazy"
                />
              </div>
              <span>{leagueDisplayName}</span>
            </button>
          );
        })}
      </div>

      {/* ─── League Header Card & Mode Switcher ──────────────────────── */}
      <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 p-2 bg-muted/60 rounded-xl border flex-shrink-0 flex items-center justify-center">
            <Image
              src={standingsData?.logo || currentCompetition.logo}
              alt={standingsData?.leagueName || currentCompetition.name}
              fill
              sizes="56px"
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black tracking-tight">
                {isRtl ? currentCompetition.nameFa : standingsData?.leagueName || currentCompetition.name}
              </h2>
              <Badge variant="outline" className="text-[11px] font-estedad">
                {formatLocalizedNumber(2026, locale)}/{formatLocalizedNumber(2027, locale)}
              </Badge>
              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                {standingsData?.provider || "football-data.org"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <span>{isRtl ? standingsData?.countryFa || "بین‌المللی" : standingsData?.country || "International"}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("updatedJustNow")}
              </span>
            </p>
          </div>
        </div>

        {/* View Mode Toggle (Table / AI Projections / Goal Timing) */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab("table")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === "table"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>{isRtl ? "جدول رده‌بندی" : "Standings"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("projection")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === "projection"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{isRtl ? "شبیه‌سازی قهرمانی" : "Projections"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("heatmap")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === "heatmap"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>{isRtl ? "دقایق گلزنی" : "Goal Timing"}</span>
          </button>
        </div>
      </div>

      {/* ─── Sub-Tab Content: AI Projections ─────────────────────────── */}
      {activeSubTab === "projection" && (
        <SeasonProjectionCard data={initialProjection || null} limit={10} />
      )}

      {/* ─── Sub-Tab Content: Goal Timing Heatmap ─────────────────────── */}
      {activeSubTab === "heatmap" && (
        <GoalTimingHeatmap data={initialGoalTiming || null} limit={10} />
      )}

      {/* ─── Sub-Tab Content: Standings Table ────────────────────────── */}
      {activeSubTab === "table" && (
        <div className="space-y-4">
          {/* Quick Team Search Filter */}
          <div className="relative w-full max-w-xs">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "جستجوی باشگاه در جدول..." : "Search club in table..."}
              className={`h-9 text-xs sm:text-sm ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"}`}
            />
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
            {isLoading && !standingsData ? (
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-2">
                    <Skeleton className="h-6 w-8 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-36 flex-1" />
                    <Skeleton className="h-4 w-12 hidden sm:block" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                <p className="text-sm font-semibold">{isRtl ? "خطا در دریافت جدول رده‌بندی" : "Failed to load standings table"}</p>
                <p className="text-xs text-muted-foreground">{error.message}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-12 text-center">{t("rank")}</TableHead>
                    <TableHead>{t("club")}</TableHead>
                    <TableHead className="text-center font-estedad">{t("mp")}</TableHead>
                    <TableHead className="text-center font-estedad">{t("w")}</TableHead>
                    <TableHead className="text-center font-estedad">{t("d")}</TableHead>
                    <TableHead className="text-center font-estedad">{t("l")}</TableHead>
                    <TableHead className="text-center font-estedad hidden sm:table-cell">{t("gd")}</TableHead>
                    <TableHead className="text-center font-black font-estedad">{t("pts")}</TableHead>
                    <TableHead className="text-end hidden md:table-cell">{t("form")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => {
                    const uclSpots = standingsData?.uclSpots || 4;
                    const totalTeams = standingsData?.standings.length || 20;
                    const relSpots = standingsData?.relegationSpots || 3;
                    const isUCL = row.position <= uclSpots;
                    const isRelegation = relSpots > 0 && row.position > totalTeams - relSpots;

                    const formArray = (row.form || "")
                      .split("")
                      .filter((c) => ["W", "D", "L"].includes(c.toUpperCase()))
                      .slice(-5);

                    return (
                      <TableRow
                        key={`${row.teamId}-${row.position}`}
                        className={`hover:bg-muted/40 transition-colors ${
                          isUCL
                            ? isRtl
                              ? "border-r-4 border-r-emerald-500 bg-emerald-500/[0.02]"
                              : "border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]"
                            : isRelegation
                            ? isRtl
                              ? "border-r-4 border-r-rose-500 bg-rose-500/[0.02]"
                              : "border-l-4 border-l-rose-500 bg-rose-500/[0.02]"
                            : ""
                        }`}
                      >
                        {/* Position */}
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-estedad ${
                              isUCL
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                                : isRelegation
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatLocalizedNumber(row.position, locale)}
                          </span>
                        </TableCell>

                        {/* Team Info */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-6 h-6 flex-shrink-0">
                              <Image
                                src={row.teamLogo}
                                alt={row.teamName}
                                fill
                                sizes="24px"
                                className="object-contain"
                                loading="lazy"
                              />
                            </div>
                            <span className="font-semibold text-sm tracking-tight truncate max-w-[150px] sm:max-w-[240px]">
                              {row.teamName}
                            </span>
                          </div>
                        </TableCell>

                        {/* Matches Played */}
                        <TableCell className="text-center text-xs text-muted-foreground font-estedad font-medium">
                          {formatLocalizedNumber(row.played, locale)}
                        </TableCell>

                        {/* Won */}
                        <TableCell className="text-center text-xs text-muted-foreground font-estedad font-medium">
                          {formatLocalizedNumber(row.won, locale)}
                        </TableCell>

                        {/* Drawn */}
                        <TableCell className="text-center text-xs text-muted-foreground font-estedad font-medium">
                          {formatLocalizedNumber(row.drawn, locale)}
                        </TableCell>

                        {/* Lost */}
                        <TableCell className="text-center text-xs text-muted-foreground font-estedad font-medium">
                          {formatLocalizedNumber(row.lost, locale)}
                        </TableCell>

                        {/* Goal Difference */}
                        <TableCell className="text-center text-xs font-estedad font-medium hidden sm:table-cell">
                          <span
                            className={
                              row.goalsDiff > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : row.goalsDiff < 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-muted-foreground"
                            }
                          >
                            {row.goalsDiff > 0
                              ? `+${formatLocalizedNumber(row.goalsDiff, locale)}`
                              : formatLocalizedNumber(row.goalsDiff, locale)}
                          </span>
                        </TableCell>

                        {/* Points */}
                        <TableCell className="text-center font-black text-sm text-primary font-estedad">
                          {formatLocalizedNumber(row.points, locale)}
                        </TableCell>

                        {/* Form Guide Pills */}
                        <TableCell className="text-end hidden md:table-cell">
                          <div className="flex items-center justify-end gap-1">
                            {formArray.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              formArray.map((res, i) => {
                                const isWin = res === "W";
                                const isDraw = res === "D";
                                return (
                                  <span
                                    key={i}
                                    title={isWin ? "Win" : isDraw ? "Draw" : "Loss"}
                                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold font-estedad text-white shadow-xs ${
                                      isWin
                                        ? "bg-emerald-500"
                                        : isDraw
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                  >
                                    {res}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* ─── Legend Footer ────────────────────────────────────── */}
            <div className="p-3.5 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>
                    {selectedLeagueId === 2
                      ? (isRtl ? "صعود مستقیم به یک‌هشتم" : "Round of 16 Qualification")
                      : t("championsLeagueSpot")}
                  </span>
                </div>
                {currentCompetition.id !== 2 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>{t("relegationZone")}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 font-estedad text-[11px]">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{isRtl ? "منبع داده:" : "Active Source:"} {standingsData?.provider || "football-data.org"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
