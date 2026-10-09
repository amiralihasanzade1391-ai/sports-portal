"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Trophy, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamBadge } from "@/components/shared/team-badge";
import { formatLocalizedNumber } from "@/lib/i18n-utils";

export function HeroSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden py-12 md:py-24 border-b bg-gradient-to-b from-card/60 via-background to-background">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Content with Staggered Entrance */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 font-medium border-primary/40 bg-primary/5 text-primary">
                <Flame className="h-3.5 w-3.5 fill-primary text-primary" />
                {t("heroTag")}
              </Badge>
              <Badge variant="secondary">{t("seasonTag")}</Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]"
            >
              {t("heroTitle1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {t("heroTitle2")}
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed"
            >
              {t("heroSubtitle")}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" asChild className="gap-2 font-semibold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
                <Link href="/matches">
                  <Trophy className="h-4 w-4" />
                  {t("exploreScores")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 hover:scale-105 active:scale-95 transition-transform">
                <Link href="/news">
                  {t("readArticles")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
            </motion.div>

            {/* Quick metrics with Localized Digits */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60 max-w-lg"
            >
              <div>
                <p className="text-2xl font-black text-foreground font-mono">
                  {formatLocalizedNumber(30, locale)}+
                </p>
                <p className="text-xs text-muted-foreground">{t("leaguesCovered")}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground font-mono">
                  {formatLocalizedNumber(500, locale)}+
                </p>
                <p className="text-xs text-muted-foreground">{t("liveMatches")}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground font-mono">
                  {formatLocalizedNumber(99.9, locale)}%
                </p>
                <p className="text-xs text-muted-foreground">{t("scoreAccuracy")}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Highlight Card with Real Club Logos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-2xl border bg-card/80 backdrop-blur-sm p-6 shadow-2xl overflow-hidden group">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                    {t("liveNow")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">La Liga • Bernabéu</span>
              </div>

              {/* Match Scoreboard with Authentic Crests */}
              <div className="py-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <TeamBadge name="Real Madrid" logo="https://media.api-sports.io/football/teams/541.png" size="lg" />
                    <span className="font-bold text-sm text-center">Real Madrid</span>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-primary font-mono">
                      {formatLocalizedNumber(2, locale)} - {formatLocalizedNumber(1, locale)}
                    </span>
                    <Badge variant="live" className="text-[10px] mt-1 px-2 font-mono">
                      {formatLocalizedNumber(74, locale)}&apos;
                    </Badge>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1">
                    <TeamBadge name="FC Barcelona" logo="https://media.api-sports.io/football/teams/529.png" size="lg" />
                    <span className="font-bold text-sm text-center">Barcelona</span>
                  </div>
                </div>
              </div>

              {/* Match CTA */}
              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  Tactical Stream Available
                </span>
                <Button size="sm" variant="ghost" asChild className="gap-1 text-xs font-semibold">
                  <Link href="/matches">
                    {t("exploreScores")} <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
