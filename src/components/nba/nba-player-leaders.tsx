"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Flame, Activity, Compass, Award } from "lucide-react";
import { NbaLeadersData, NbaPlayerLeader } from "@/lib/providers/types";
import { formatLocalizedNumber } from "@/lib/i18n-utils";

interface NbaPlayerLeadersProps {
  initialData: NbaLeadersData;
}

export function NbaPlayerLeaders({ initialData }: NbaPlayerLeadersProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [category, setCategory] = useState<"points" | "rebounds" | "assists">("points");

  const currentLeaders: NbaPlayerLeader[] =
    category === "points"
      ? initialData.points
      : category === "rebounds"
      ? initialData.rebounds
      : initialData.assists;

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm space-y-5">
      {/* ─── Header & Category Switcher ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {isRtl ? "پیشتازان آماری لیگ NBA" : "NBA Individual Stat Leaders"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isRtl ? `آمار رسمی فصل ${initialData.season}` : `Official Season ${initialData.season} Leaders`}
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border self-start">
          <button
            onClick={() => setCategory("points")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === "points"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isRtl ? "امتیاز (PPG)" : "Points"}
          </button>
          <button
            onClick={() => setCategory("rebounds")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === "rebounds"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isRtl ? "ریباند (RPG)" : "Rebounds"}
          </button>
          <button
            onClick={() => setCategory("assists")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === "assists"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isRtl ? "پاس‌گل (APG)" : "Assists"}
          </button>
        </div>
      </div>

      {/* ─── Leaders List ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {currentLeaders.map((player, idx) => (
          <div
            key={player.id}
            className="p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center text-center space-y-2 relative"
          >
            {/* Rank badge */}
            <span
              className={`absolute top-2.5 start-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black font-estedad ${
                idx === 0
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {formatLocalizedNumber(idx + 1, locale)}
            </span>

            {/* Photo */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted/60 border border-primary/20 shrink-0">
              <Image
                src={player.photo}
                alt={player.name}
                fill
                sizes="64px"
                className="object-cover object-top"
                loading="lazy"
              />
            </div>

            {/* Name & Team */}
            <div className="space-y-0.5">
              <p className="font-bold text-sm leading-tight truncate max-w-[130px]">{player.name}</p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[130px]">{player.team}</p>
            </div>

            {/* Stat Value */}
            <div className="pt-1">
              <span className="text-xl font-black font-estedad text-primary">
                {formatLocalizedNumber(player.statValue, locale)}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground ml-1">
                {player.statLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
