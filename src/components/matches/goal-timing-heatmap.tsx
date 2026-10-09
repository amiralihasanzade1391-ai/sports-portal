"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Flame, Clock, Activity, ExternalLink } from "lucide-react";
import { type GoalTimingData } from "@/lib/providers/types";
import { formatLocalizedNumber } from "@/lib/i18n-utils";
import { Badge } from "@/components/ui/badge";

interface GoalTimingHeatmapProps {
  data: GoalTimingData | null;
  limit?: number;
}

export function GoalTimingHeatmap({ data, limit = 8 }: GoalTimingHeatmapProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  if (!data || !data.teams || data.teams.length === 0) {
    return null;
  }

  const teams = data.teams.slice(0, limit);
  const timeBins = data.timeBins || ["0-15", "15-30", "30-45", "45+", "46-60", "60-75", "75-90", "90+"];

  // Calculate highest single bin count for relative heat intensity scale
  let maxBinVal = 1;
  teams.forEach((t) => {
    Object.values(t.bins).forEach((val) => {
      if (val > maxBinVal) maxBinVal = val;
    });
  });

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm space-y-5">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {isRtl ? "نقشه حرارتی دقایق گلزنی" : "Goal Timing Heatmap"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isRtl
                ? `توزیع زمان گل‌ها در طول ۹۰ دقیقه • فعال‌ترین بازه: دقیقه ${data.stats.mostActivePeriod}`
                : `Distribution of goals across 90 minutes • Peak period: ${data.stats.mostActivePeriod}'`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-estedad bg-muted/40">
            {formatLocalizedNumber(data.stats.totalGoals, locale)} {isRtl ? "گل کل" : "Total Goals"}
          </Badge>
          {data.sourceUrl && (
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>{isRtl ? "منبع" : "Source"}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* ─── Heatmap Table ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-start py-2 font-medium w-32">{isRtl ? "باشگاه" : "Club"}</th>
              {timeBins.map((bin) => (
                <th key={bin} className="text-center py-2 px-1 font-mono font-medium text-[11px]">
                  {bin}&apos;
                </th>
              ))}
              <th className="text-center py-2 px-1 font-medium font-estedad">{isRtl ? "مجموع" : "Total"}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {teams.map((item) => {
              const isSelected = selectedTeam === item.team;

              return (
                <tr
                  key={item.team}
                  onClick={() => setSelectedTeam(isSelected ? null : item.team)}
                  className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                    isSelected ? "bg-muted/60 font-semibold" : ""
                  }`}
                >
                  <td className="py-2.5 font-bold text-sm tracking-tight truncate max-w-[120px]">
                    {item.team}
                  </td>

                  {timeBins.map((bin) => {
                    const count = item.bins[bin] || 0;
                    const intensity = Math.min(count / maxBinVal, 1);
                    const isPeak = item.peakBins.includes(bin);

                    // Dynamic background color based on heat intensity
                    let cellBg = "bg-muted/10";
                    let textColor = "text-muted-foreground/60";

                    if (count > 0) {
                      textColor = "text-foreground font-bold";
                      if (intensity < 0.3) cellBg = "bg-orange-500/15";
                      else if (intensity < 0.6) cellBg = "bg-orange-500/35";
                      else cellBg = "bg-orange-500/70 text-white font-black";
                    }

                    return (
                      <td key={bin} className="py-2 px-1 text-center">
                        <div
                          className={`mx-auto w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-estedad text-xs transition-all ${cellBg} ${textColor} ${
                            isPeak ? "ring-2 ring-orange-500 shadow-xs" : ""
                          }`}
                          title={`${item.team}: ${count} goals in ${bin}'`}
                        >
                          {count > 0 ? formatLocalizedNumber(count, locale) : "·"}
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-2 px-1 text-center font-black font-estedad text-sm text-primary">
                    {formatLocalizedNumber(item.total, locale)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Heatmap Legend & Attribution ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-3">
          <span>{isRtl ? "شدت گلزنی:" : "Goal Density:"}</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-muted/20" />
            <span className="w-3.5 h-3.5 rounded bg-orange-500/20" />
            <span className="w-3.5 h-3.5 rounded bg-orange-500/50" />
            <span className="w-3.5 h-3.5 rounded bg-orange-500 text-white flex items-center justify-center text-[9px] font-bold">★</span>
          </div>
          <span className="text-[10px] italic">★ = {isRtl ? "دقیقه اوج گلزنی" : "Peak Minute Bin"}</span>
        </div>
        <span className="italic font-medium">Data by football-charts.com</span>
      </div>
    </div>
  );
}
