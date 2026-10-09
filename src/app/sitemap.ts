import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://sportsportal.com";
  const locales = ["en", "fa"];

  // Static core routes
  const staticPages = [
    { path: "", changeFrequency: "always" as const, priority: 1.0 },
    { path: "/news", changeFrequency: "hourly" as const, priority: 0.9 },
    { path: "/matches", changeFrequency: "hourly" as const, priority: 0.9 },
    { path: "/login", changeFrequency: "monthly" as const, priority: 0.4 },
    { path: "/signup", changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  // Fetch all published articles (with fallback so prerender never crashes)
  let articles: { id: string; slug: string; updatedAt: Date }[] = [];
  try {
    articles = await prisma.article.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });
  } catch (error) {
    console.warn("[sitemap] Could not fetch articles for sitemap prerender, falling back to static routes.");
  }

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate localized entries for static routes
  for (const page of staticPages) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            en: `${baseUrl}/en${page.path}`,
            fa: `${baseUrl}/fa${page.path}`,
          },
        },
      });
    }
  }

  // Generate localized entries for published news articles
  for (const article of articles) {
    const slugOrId = article.slug || article.id;
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/news/${slugOrId}`,
        lastModified: article.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            en: `${baseUrl}/en/news/${slugOrId}`,
            fa: `${baseUrl}/fa/news/${slugOrId}`,
          },
        },
      });
    }
  }

  return sitemapEntries;
}
