"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { TeamBadge } from "@/components/shared/team-badge";
import { useLiveMatches } from "@/hooks/use-live-matches";
import { Radio } from "lucide-react";

export interface TickerMatch {
  id: string;
  sport?: "football" | "nba";
  sportIcon?: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "LIVE" | "HT" | "FT" | "UPCOMING" | string;
  minute?: number | null;
  period?: string | null;
  linkHref?: string;
}

export function LiveScoresTicker({ initialMatches = [] }: { initialMatches?: TickerMatch[] }) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  // Real-time SWR polling hook with 30-second intervals and minute tick animations
  const { matches: liveFootball, isRecentRefresh, minuteChangedMap } = useLiveMatches({
    refreshInterval: 30000,
  });

  // Map real-time polled live football matches
  const polledLiveTicker: TickerMatch[] = (liveFootball || []).map((m) => ({
    id: `fb-live-${m.id}`,
    sport: "football",
    sportIcon: "⚽",
    league: m.league?.slice(0, 8).toUpperCase() || "LIVE",
    homeTeam: m.homeTeam?.shortName || m.homeTeam?.name?.slice(0, 3).toUpperCase(),
    awayTeam: m.awayTeam?.shortName || m.awayTeam?.name?.slice(0, 3).toUpperCase(),
    homeLogo: m.homeTeam?.logo,
    awayLogo: m.awayTeam?.logo,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: m.status === "HALF_TIME" ? "HT" : "LIVE",
    minute: m.minute,
    linkHref: "/matches?sport=football",
  }));

  // Preserve initial NBA games that are currently live or scheduled
  const nbaMatches = initialMatches.filter((m) => m.sport === "nba");

  // Combine real live fixtures with active NBA matchups
  const combinedMatches: TickerMatch[] = [
    ...polledLiveTicker,
    ...nbaMatches,
  ];

  // If there are truly no live matches in progress across football and NBA
  const hasMatches = combinedMatches.length > 0;

  return (
    <div className="w-full bg-card/90 border-b overflow-hidden py-2.5 shadow-xs">
      <div className="container flex items-center gap-4">
        {/* Pulsing Live Header */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 pe-3 border-e">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isRecentRefresh ? "bg-red-400 animate-ping" : "bg-red-300"
              }`}
            />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <span>{isRtl ? "پخش زنده نتایج" : "Multi-Sport Ticker"}</span>
            {isRecentRefresh && (
              <span className="text-[10px] text-red-500 font-mono tracking-tight font-bold">
                🔴 LIVE
              </span>
            )}
          </span>
        </div>

        {/* Scrollable Row or Empty State */}
        {!hasMatches ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-0.5">
            <Radio className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
            <span>
              {isRtl
                ? "در حال حاضر هیچ مسابقه‌ای به صورت زنده در جریان نیست."
                : "No live matches right now."}
            </span>
            <Link
              href="/matches"
              className="text-primary hover:underline ms-2 font-semibold text-xs"
            >
              {isRtl ? "مشاهده برنامه مسابقات →" : "View Full Fixtures →"}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-0.5">
            {combinedMatches.map((m) => {
              const isMinuteAnimated = minuteChangedMap[m.id.replace("fb-live-", "")];

              return (
                <Link
                  key={m.id}
                  href={m.linkHref || "/matches"}
                  className="flex items-center gap-2.5 rounded-lg border bg-background/60 hover:bg-muted/80 px-3 py-1.5 transition-colors shrink-0 text-xs shadow-2xs cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs select-none">{m.sportIcon || (m.sport === "nba" ? "🏀" : "⚽")}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {m.league}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <TeamBadge name={m.homeTeam} logo={m.homeLogo || m.homeTeam} size="xs" />
                    <span className="max-w-[70px] truncate">{m.homeTeam}</span>
                    <span className="text-primary font-black px-1">
                      {m.homeScore !== null && m.awayScore !== null ? `${m.homeScore} - ${m.awayScore}` : "vs"}
                    </span>
                    <span className="max-w-[70px] truncate">{m.awayTeam}</span>
                    <TeamBadge name={m.awayTeam} logo={m.awayLogo || m.awayTeam} size="xs" />
                  </div>
                  {m.status === "LIVE" ? (
                    <Badge
                      variant="live"
                      className={`text-[9px] px-1.5 py-0 h-4 font-mono transition-transform duration-300 ${
                        isMinuteAnimated ? "scale-125 bg-red-600 text-white shadow-sm ring-1 ring-red-400" : ""
                      }`}
                    >
                      {m.period || (m.minute ? `${m.minute}'` : "LIVE")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                      {m.status}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
