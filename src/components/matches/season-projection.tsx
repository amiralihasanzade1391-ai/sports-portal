"use client";

import { useLocale } from "next-intl";
import { TrendingUp, Award, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";
import { type SeasonProjection } from "@/lib/providers/types";
import { formatLocalizedNumber } from "@/lib/i18n-utils";
import { Badge } from "@/components/ui/badge";

interface SeasonProjectionProps {
  data: SeasonProjection | null;
  limit?: number;
}

export function SeasonProjectionCard({ data, limit = 8 }: SeasonProjectionProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  if (!data || !data.teams || data.teams.length === 0) {
    return null;
  }

  const displayedTeams = data.teams.slice(0, limit);

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm space-y-5">
      {/* ─── Header & Monte Carlo Simulation Badge ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {isRtl ? "پیش‌بینی هوش مصنوعی و شبیه‌سازی فصل" : "AI Season Projections"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isRtl
                ? `بر اساس ۱۰,۰۰۰ شبیه‌سازی مونت‌کارلو • فصل ${data.season}`
                : `Based on 10,000 Monte Carlo simulations • Season ${data.season}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-estedad bg-muted/40">
            {formatLocalizedNumber(data.nSims, locale)} {isRtl ? "شبیه‌سازی" : "Simulations"}
          </Badge>
          {data.sourceUrl && (
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>{isRtl ? "منبع داده" : "Source"}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* ─── Teams Projections Table / Cards ──────────────────────────── */}
      <div className="space-y-3">
        {displayedTeams.map((item, index) => {
          const titlePct = Math.round(item.titleProb * 100);
          const top4Pct = Math.round(item.top4Prob * 100);
          const relPct = Math.round(item.relegationProb * 100);

          return (
            <div
              key={item.team}
              className="p-3 sm:p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-xs font-bold text-muted-foreground font-estedad">
                    {formatLocalizedNumber(index + 1, locale)}.
                  </span>
                  <span className="font-bold text-sm">{item.team}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-estedad text-muted-foreground">
                  <span>{isRtl ? "امتیاز پیش‌بینی شده:" : "Projected Pts:"}</span>
                  <span className="font-black text-foreground">{formatLocalizedNumber(Math.round(item.meanPts), locale)}</span>
                </div>
              </div>

              {/* Probability Bars */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                {/* Title Chance */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-amber-500" />
                      {isRtl ? "قهرمانی" : "Title"}
                    </span>
                    <span className="font-bold font-estedad text-foreground">
                      {formatLocalizedNumber(titlePct, locale)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(titlePct, 2)}%` }}
                    />
                  </div>
                </div>

                {/* Top 4 Chance */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      {isRtl ? "سهمیه UCL" : "Top 4"}
                    </span>
                    <span className="font-bold font-estedad text-foreground">
                      {formatLocalizedNumber(top4Pct, locale)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(top4Pct, 2)}%` }}
                    />
                  </div>
                </div>

                {/* Relegation Risk */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-rose-500" />
                      {isRtl ? "خطر سقوط" : "Relegation"}
                    </span>
                    <span className="font-bold font-estedad text-foreground">
                      {formatLocalizedNumber(relPct, locale)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(relPct, 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Attribution Footer ──────────────────────────────────────── */}
      <div className="text-[11px] text-muted-foreground/80 flex items-center justify-between pt-1">
        <span>{isRtl ? "به‌روزرسانی هفتگی بر اساس فرم تیم‌ها" : "Weekly Bayesian model calibration"}</span>
        <span className="italic font-medium">Data by football-charts.com</span>
      </div>
    </div>
  );
}
