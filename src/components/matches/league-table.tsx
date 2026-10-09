"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TeamBadge } from "@/components/shared/team-badge";
import { formatLocalizedNumber } from "@/lib/i18n-utils";

export interface LeagueStanding {
  rank: number;
  team: string;
  teamFa?: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

const standingsData: LeagueStanding[] = [
  { rank: 1, team: "Arsenal", teamFa: "آرسنال", logo: "🔴", played: 28, won: 20, drawn: 5, lost: 3, gf: 68, ga: 22, gd: 46, points: 65, form: ["W", "W", "W", "D", "W"] },
  { rank: 2, team: "Manchester City", teamFa: "منچسترسیتی", logo: "🔵", played: 28, won: 19, drawn: 6, lost: 3, gf: 65, ga: 26, gd: 39, points: 63, form: ["W", "W", "D", "W", "W"] },
  { rank: 3, team: "Liverpool", teamFa: "لیورپول", logo: "🔴", played: 28, won: 19, drawn: 5, lost: 4, gf: 63, ga: 28, gd: 35, points: 62, form: ["L", "W", "W", "W", "D"] },
  { rank: 4, team: "Aston Villa", teamFa: "استون ویلا", logo: "🟣", played: 28, won: 17, drawn: 4, lost: 7, gf: 56, ga: 39, gd: 17, points: 55, form: ["W", "L", "W", "D", "W"] },
  { rank: 5, team: "Tottenham", teamFa: "تاتنهام", logo: "⚪", played: 28, won: 16, drawn: 5, lost: 7, gf: 55, ga: 40, gd: 15, points: 53, form: ["W", "W", "L", "W", "L"] },
  { rank: 6, team: "Manchester United", teamFa: "منچستریونایتد", logo: "🔴", played: 28, won: 14, drawn: 5, lost: 9, gf: 44, ga: 39, gd: 5, points: 47, form: ["L", "D", "W", "W", "L"] },
  { rank: 7, team: "Chelsea", teamFa: "چلسی", logo: "🔵", played: 28, won: 12, drawn: 7, lost: 9, gf: 48, ga: 43, gd: 5, points: 43, form: ["D", "W", "D", "W", "W"] },
  { rank: 8, team: "Newcastle", teamFa: "نیوکاسل", logo: "⚫", played: 28, won: 12, drawn: 5, lost: 11, gf: 51, ga: 45, gd: 6, points: 41, form: ["W", "L", "D", "L", "W"] },
];

export function LeagueTable() {
  const t = useTranslations("matches");
  const locale = useLocale();

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base">{t("premierLeagueStandings")}</h3>
          <p className="text-xs text-muted-foreground">{t("seasonMatchday")}</p>
        </div>
        <Badge variant="outline">{t("officialTable")}</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20">
            <TableHead className="w-12 text-center">{t("rank")}</TableHead>
            <TableHead>{t("club")}</TableHead>
            <TableHead className="text-center">{t("mp")}</TableHead>
            <TableHead className="text-center">{t("w")}</TableHead>
            <TableHead className="text-center">{t("d")}</TableHead>
            <TableHead className="text-center">{t("l")}</TableHead>
            <TableHead className="text-center hidden sm:table-cell">{t("gd")}</TableHead>
            <TableHead className="text-center font-bold">{t("pts")}</TableHead>
            <TableHead className="text-end hidden md:table-cell">{t("form")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standingsData.map((row) => {
            const teamName = locale === "fa" && row.teamFa ? row.teamFa : row.team;

            return (
              <TableRow key={row.rank} className="hover:bg-muted/50 transition-colors">
                <TableCell className="text-center font-mono font-medium text-xs">
                  {formatLocalizedNumber(row.rank, locale)}
                </TableCell>
                <TableCell className="font-semibold text-sm">
                  <div className="flex items-center gap-2.5">
                    <TeamBadge name={row.team} logo={row.logo} size="sm" />
                    <span>{teamName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground font-mono">
                  {formatLocalizedNumber(row.played, locale)}
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground font-mono">
                  {formatLocalizedNumber(row.won, locale)}
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground font-mono">
                  {formatLocalizedNumber(row.drawn, locale)}
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground font-mono">
                  {formatLocalizedNumber(row.lost, locale)}
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground font-mono hidden sm:table-cell">
                  {row.gd > 0 ? `+${formatLocalizedNumber(row.gd, locale)}` : formatLocalizedNumber(row.gd, locale)}
                </TableCell>
                <TableCell className="text-center font-black text-sm text-primary font-mono">
                  {formatLocalizedNumber(row.points, locale)}
                </TableCell>
                <TableCell className="text-end hidden md:table-cell">
                  <div className="flex items-center justify-end gap-1">
                    {row.form.map((res, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white ${
                          res === "W"
                            ? "bg-emerald-500"
                            : res === "D"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
