"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { Clock, MapPin } from "lucide-react";
import { NbaGame } from "@/lib/providers/types";
import { formatLocalizedNumber } from "@/lib/i18n-utils";
import { Badge } from "@/components/ui/badge";

interface NbaGameCardProps {
  game: NbaGame;
}

export function NbaGameCard({ game }: NbaGameCardProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const isLive = game.status === "LIVE";
  const isFinal = game.status === "FINAL";
  const homeWinning = (game.homeTeam.score ?? 0) > (game.awayTeam.score ?? 0);
  const awayWinning = (game.awayTeam.score ?? 0) > (game.homeTeam.score ?? 0);

  return (
    <div
      className={`rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 ${
        isLive ? "ring-2 ring-rose-500/30 border-rose-500/50" : ""
      }`}
    >
      {/* ─── Status Ribbon Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs pb-2 border-b">
        <div className="flex items-center gap-1.5 font-estedad">
          {isLive ? (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{isRtl ? `در جریان • ${game.time}` : `LIVE • ${game.time}`}</span>
            </span>
          ) : isFinal ? (
            <Badge variant="secondary" className="text-[10px] bg-muted font-bold">
              {isRtl ? "پایان بازی" : "FINAL"}
            </Badge>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{game.time || "Scheduled"}</span>
            </span>
          )}
        </div>

        {game.arena && (
          <span className="text-[11px] text-muted-foreground truncate max-w-[140px] flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{game.arena}</span>
          </span>
        )}
      </div>

      {/* ─── Matchup Scoreboard ──────────────────────────────────────── */}
      <div className="space-y-2.5 py-1">
        {/* Away Team Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={game.awayTeam.logo}
                alt={game.awayTeam.name}
                fill
                sizes="32px"
                className="object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <p className={`font-bold text-sm tracking-tight ${isFinal && awayWinning ? "text-primary" : ""}`}>
                {game.awayTeam.city} {game.awayTeam.name}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">{game.awayTeam.abbreviation}</p>
            </div>
          </div>
          <div className="text-xl font-black font-estedad">
            {game.awayTeam.score != null ? formatLocalizedNumber(game.awayTeam.score, locale) : "—"}
          </div>
        </div>

        {/* Home Team Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={game.homeTeam.logo}
                alt={game.homeTeam.name}
                fill
                sizes="32px"
                className="object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <p className={`font-bold text-sm tracking-tight ${isFinal && homeWinning ? "text-primary" : ""}`}>
                {game.homeTeam.city} {game.homeTeam.name}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">{game.homeTeam.abbreviation}</p>
            </div>
          </div>
          <div className="text-xl font-black font-estedad">
            {game.homeTeam.score != null ? formatLocalizedNumber(game.homeTeam.score, locale) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
