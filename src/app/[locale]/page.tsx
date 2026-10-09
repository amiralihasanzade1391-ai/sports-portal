import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { getLocalizedField } from "@/lib/i18n-utils";
import { getNbaTodayGames } from "@/lib/providers";
import { HeroSection } from "@/components/landing/hero-section";
import { LiveScoresTicker, type TickerMatch } from "@/components/landing/live-scores-ticker";
import { NewsSlider } from "@/components/landing/news-slider";
import { MatchHighlights } from "@/components/landing/match-highlights";
import { FeaturedPlayers } from "@/components/landing/featured-players";

export const revalidate = 60; // Next.js ISR: Revalidate every 60 seconds

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const tLanding = await getTranslations({ locale, namespace: "landing" });

  // Query real database records in parallel on the server alongside NBA live matchups
  const [articles, matches, players, nbaGames] = await Promise.all([
    prisma.article.findMany({
      where: {
        published: true,
        source: { not: "demo" },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.match.findMany({
      include: {
        homeTeam: { select: { shortName: true, name: true, nameFa: true, leagueFa: true, logo: true } },
        awayTeam: { select: { shortName: true, name: true, nameFa: true, leagueFa: true, logo: true } },
      },
      orderBy: { matchDate: "desc" },
      take: 6,
    }),
    prisma.player.findMany({
      include: {
        team: { select: { name: true, nameFa: true } },
      },
      orderBy: { goals: "desc" },
      take: 4,
    }),
    getNbaTodayGames().catch(() => []),
  ]);

  // Apply dual-language field resolution
  const localizedArticles = articles.map((a) => ({
    id: a.id,
    title: getLocalizedField(a, "title", locale),
    slug: a.slug,
    excerpt: getLocalizedField(a, "excerpt", locale),
    category: a.category,
    coverImage: a.coverImage,
    source: a.source,
    sourceUrl: a.sourceUrl,
    createdAt: a.createdAt,
  }));

  // Build unified multi-sport ticker: Football fixtures + NBA basketball matchups
  const footballTicker: TickerMatch[] = matches.map((m) => ({
    id: `fb-${m.id}`,
    sport: "football",
    sportIcon: "⚽",
    league: m.league?.slice(0, 8).toUpperCase() || "PL",
    homeTeam: getLocalizedField(m.homeTeam, "name", locale) || m.homeTeam.shortName,
    awayTeam: getLocalizedField(m.awayTeam, "name", locale) || m.awayTeam.shortName,
    homeLogo: m.homeTeam.logo,
    awayLogo: m.awayTeam.logo,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status:
      m.status === "FIRST_HALF" || m.status === "SECOND_HALF"
        ? "LIVE"
        : m.status === "HALF_TIME"
        ? "HT"
        : m.status === "FINISHED"
        ? "FT"
        : "UPCOMING",
    minute: m.minute,
    linkHref: "/matches?sport=football",
  }));

  const nbaTicker: TickerMatch[] = (nbaGames || []).map((g) => ({
    id: `nba-${g.id}`,
    sport: "nba",
    sportIcon: "🏀",
    league: "NBA",
    homeTeam: g.homeTeam.abbreviation || g.homeTeam.name,
    awayTeam: g.awayTeam.abbreviation || g.awayTeam.name,
    homeLogo: g.homeTeam.logo,
    awayLogo: g.awayTeam.logo,
    homeScore: g.homeTeam.score,
    awayScore: g.awayTeam.score,
    status: g.status === "LIVE" ? "LIVE" : g.status === "FINAL" ? "FT" : "UPCOMING",
    period: g.period ? `Q${g.period} ${g.time || ""}`.trim() : g.time || null,
    linkHref: "/matches?sport=nba",
  }));

  const tickerMatches: TickerMatch[] = [...footballTicker, ...nbaTicker];

  const featuredPlayers = players.map((p) => ({
    id: p.id,
    name: getLocalizedField(p, "name", locale),
    team: getLocalizedField(p.team, "name", locale) || "Professional Club",
    position: getLocalizedField(p, "position", locale),
    stats: `${p.goals} Goals • ${p.assists} Assists`,
    image: p.image,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <LiveScoresTicker initialMatches={tickerMatches} />
      <HeroSection />
      <NewsSlider articles={localizedArticles} />
      <MatchHighlights />
      <FeaturedPlayers players={featuredPlayers} />
    </div>
  );
}
