"use client";

import { useLocale } from "next-intl";
import { formatLocalizedNumber } from "@/lib/i18n-utils";
import { type MatchPrediction } from "@/lib/providers/types";

interface PredictionBadgeProps {
  prediction?: MatchPrediction;
  homeTeamName?: string;
  awayTeamName?: string;
  compact?: boolean;
}

export function PredictionBadge({
  prediction,
  homeTeamName = "Home",
  awayTeamName = "Away",
  compact = false,
}: PredictionBadgeProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  if (!prediction) {
    return null;
  }

  const homeWinPct = Math.round(prediction.homeWinProb * 100);
  const drawPct = Math.round(prediction.drawProb * 100);
  const awayWinPct = Math.round(prediction.awayWinProb * 100);

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border text-[11px] font-estedad"
        title={`${homeTeamName}: ${homeWinPct}% | Draw: ${drawPct}% | ${awayTeamName}: ${awayWinPct}%`}
      >
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatLocalizedNumber(homeWinPct, locale)}%
        </span>
        <span className="text-muted-foreground/60">•</span>
        <span className="font-bold text-amber-600 dark:text-amber-400">
          {formatLocalizedNumber(drawPct, locale)}%
        </span>
        <span className="text-muted-foreground/60">•</span>
        <span className="font-bold text-sky-600 dark:text-sky-400">
          {formatLocalizedNumber(awayWinPct, locale)}%
        </span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border bg-muted/30 space-y-2 text-xs">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
        <span>{isRtl ? "احتمال پیروزی (مدل آماری):" : "Win Probability Forecast:"}</span>
        {prediction.predictedScore && (
          <span className="font-mono font-bold text-foreground">
            {isRtl ? "نتیجه محتمل:" : "Likely:"} {prediction.predictedScore}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center font-estedad">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
          <div className="text-[10px] text-muted-foreground truncate">{homeTeamName}</div>
          <div className="font-black text-sm">{formatLocalizedNumber(homeWinPct, locale)}%</div>
        </div>

        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
          <div className="text-[10px] text-muted-foreground">{isRtl ? "تساوی" : "Draw"}</div>
          <div className="font-black text-sm">{formatLocalizedNumber(drawPct, locale)}%</div>
        </div>

        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300">
          <div className="text-[10px] text-muted-foreground truncate">{awayTeamName}</div>
          <div className="font-black text-sm">{formatLocalizedNumber(awayWinPct, locale)}%</div>
        </div>
      </div>
    </div>
  );
}
