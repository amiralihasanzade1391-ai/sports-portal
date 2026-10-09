"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TeamBadge } from "@/components/shared/team-badge";
import { formatLocalizedNumber, toPersianDigits } from "@/lib/i18n-utils";

export interface MatchData {
  id: string;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  homeScore: number | null;
  awayScore: number | null;
  status: "NOT_STARTED" | "FIRST_HALF" | "HALF_TIME" | "SECOND_HALF" | "FINISHED";
  minute: number | null;
  league: string;
  matchDate: string;
  venue: string;
}

export function MatchCard({ match }: { match: MatchData }) {
  const locale = useLocale();

  const isLive =
    match.status === "FIRST_HALF" ||
    match.status === "SECOND_HALF" ||
    match.status === "HALF_TIME";

  const homeScoreDisplay = formatLocalizedNumber(match.homeScore, locale);
  const awayScoreDisplay = formatLocalizedNumber(match.awayScore, locale);
  const minuteDisplay = match.minute ? toPersianDigits(match.minute) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      <Card
        className={`border bg-card/90 hover:shadow-lg transition-all overflow-hidden h-full flex flex-col justify-between ${
          isLive ? "border-red-500/40 shadow-red-500/5 dark:shadow-red-500/10" : ""
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/40 text-xs text-muted-foreground font-medium">
          <span className="font-semibold tracking-wide uppercase text-[11px]">{match.league}</span>
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <Badge variant="live" className="text-[10px] px-2 py-0 animate-pulse flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                {locale === "fa" ? "زنده" : "LIVE"}{" "}
                {minuteDisplay ? `• ${minuteDisplay}'` : ""}
              </Badge>
            ) : match.status === "FINISHED" ? (
              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                {locale === "fa" ? "پایان" : "FT"}
              </Badge>
            ) : (
              <span className="text-[11px] font-mono">{match.matchDate}</span>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TeamBadge name={match.homeTeam.name} logo={match.homeTeam.logo} size="md" />
                <span className="font-bold text-sm leading-tight">{match.homeTeam.name}</span>
              </div>
              <span className="text-xl font-black tracking-tight text-primary font-mono">
                {homeScoreDisplay}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TeamBadge name={match.awayTeam.name} logo={match.awayTeam.logo} size="md" />
                <span className="font-bold text-sm leading-tight">{match.awayTeam.name}</span>
              </div>
              <span className="text-xl font-black tracking-tight text-primary font-mono">
                {awayScoreDisplay}
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="line-clamp-1">{match.venue}</span>
            <span className="shrink-0 font-mono">{match.matchDate}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
