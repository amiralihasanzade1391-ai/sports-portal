"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Search, Trophy, Shield, Info } from "lucide-react";
import { NbaStandings, NbaStandingItem, NbaConference } from "@/lib/providers/types";
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

interface NbaStandingsProps {
  initialData: NbaStandings;
}

export function NbaStandingsTable({ initialData }: NbaStandingsProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [activeConference, setActiveConference] = useState<NbaConference>("East");
  const [searchQuery, setSearchQuery] = useState("");

  const currentList = activeConference === "East" ? initialData.east : initialData.west;

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.abbreviation.toLowerCase().includes(q)
    );
  }, [currentList, searchQuery]);

  return (
    <div className="space-y-5">
      {/* ─── Conference Selector & Search ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* East / West Conference Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border self-start">
          <button
            onClick={() => setActiveConference("East")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeConference === "East"
                ? "bg-background text-foreground shadow-xs font-bold ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{isRtl ? "کنفرانس شرق" : "Eastern Conference"}</span>
          </button>

          <button
            onClick={() => setActiveConference("West")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeConference === "West"
                ? "bg-background text-foreground shadow-xs font-bold ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{isRtl ? "کنفرانس غرب" : "Western Conference"}</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "جستجوی تیم NBA..." : "Search NBA franchise..."}
            className={`h-9 text-xs sm:text-sm ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"}`}
          />
        </div>
      </div>

      {/* ─── Standings Table ─────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12 text-center">{isRtl ? "رتبه" : "Rank"}</TableHead>
              <TableHead>{isRtl ? "فرنچایز" : "Team"}</TableHead>
              <TableHead className="text-center font-estedad">{isRtl ? "برد" : "W"}</TableHead>
              <TableHead className="text-center font-estedad">{isRtl ? "باخت" : "L"}</TableHead>
              <TableHead className="text-center font-estedad">{isRtl ? "درصد برد" : "PCT"}</TableHead>
              <TableHead className="text-center font-estedad hidden sm:table-cell">{isRtl ? "فاصله" : "GB"}</TableHead>
              <TableHead className="text-center font-estedad hidden md:table-cell">{isRtl ? "میزبان" : "Home"}</TableHead>
              <TableHead className="text-center font-estedad hidden md:table-cell">{isRtl ? "میهمان" : "Road"}</TableHead>
              <TableHead className="text-center font-estedad hidden sm:table-cell">{isRtl ? "۱۰ بازی آخر" : "L10"}</TableHead>
              <TableHead className="text-end font-estedad">{isRtl ? "روند" : "Strk"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => {
              const isPlayoff = team.rank <= 6;
              const isPlayIn = team.rank >= 7 && team.rank <= 10;

              return (
                <TableRow
                  key={team.teamId}
                  className={`hover:bg-muted/40 transition-colors ${
                    isPlayoff
                      ? isRtl
                        ? "border-r-4 border-r-emerald-500 bg-emerald-500/[0.02]"
                        : "border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]"
                      : isPlayIn
                      ? isRtl
                        ? "border-r-4 border-r-amber-500 bg-amber-500/[0.02]"
                        : "border-l-4 border-l-amber-500 bg-amber-500/[0.02]"
                      : ""
                  }`}
                >
                  {/* Rank */}
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-estedad ${
                        isPlayoff
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                          : isPlayIn
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatLocalizedNumber(team.rank, locale)}
                    </span>
                  </TableCell>

                  {/* Team Identity */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-7 h-7 flex-shrink-0">
                        <Image
                          src={team.logo}
                          alt={team.teamName}
                          fill
                          sizes="28px"
                          className="object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-sm tracking-tight">
                          {team.city} {team.teamName}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1.5 font-mono">
                          ({team.abbreviation})
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Wins */}
                  <TableCell className="text-center text-xs font-bold font-estedad text-foreground">
                    {formatLocalizedNumber(team.wins, locale)}
                  </TableCell>

                  {/* Losses */}
                  <TableCell className="text-center text-xs text-muted-foreground font-estedad font-medium">
                    {formatLocalizedNumber(team.losses, locale)}
                  </TableCell>

                  {/* Win Percentage */}
                  <TableCell className="text-center font-mono font-bold text-xs text-primary font-estedad">
                    {team.winPct.toFixed(3).replace(/^0/, "")}
                  </TableCell>

                  {/* Games Behind */}
                  <TableCell className="text-center text-xs text-muted-foreground font-estedad font-mono hidden sm:table-cell">
                    {team.gamesBehind === 0 ? "—" : formatLocalizedNumber(team.gamesBehind, locale)}
                  </TableCell>

                  {/* Home */}
                  <TableCell className="text-center text-xs text-muted-foreground font-estedad hidden md:table-cell">
                    {team.homeRecord}
                  </TableCell>

                  {/* Road */}
                  <TableCell className="text-center text-xs text-muted-foreground font-estedad hidden md:table-cell">
                    {team.roadRecord}
                  </TableCell>

                  {/* L10 */}
                  <TableCell className="text-center text-xs text-muted-foreground font-estedad hidden sm:table-cell">
                    {team.l10}
                  </TableCell>

                  {/* Streak */}
                  <TableCell className="text-end font-estedad">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        team.streak.startsWith("W")
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {team.streak}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* ─── NBA Standings Legend Footer ──────────────────────────── */}
        <div className="p-3.5 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{isRtl ? "رتبه‌های ۱ تا ۶: صعود مستقیم به پلی‌آف" : "Ranks 1–6: Guaranteed Playoff Berth"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>{isRtl ? "رتبه‌های ۷ تا ۱۰: مسابقات پلی‌این (Play-In)" : "Ranks 7–10: Play-In Tournament"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-estedad text-[11px]">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{isRtl ? "داده‌های رسمی فصل ۲۰۲۶/۲۷" : "Official 2026/27 NBA Standings"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
