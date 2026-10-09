import Parser from "rss-parser";
import crypto from "crypto";

export interface ParsedRssArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  source: string;
  sourceUrl: string;
  publishedAt: Date;
  category: "FOOTBALL" | "BASKETBALL" | "TENNIS" | "CRICKET" | "GENERAL";
}

interface FeedConfig {
  name: string;
  url: string;
  category: "FOOTBALL" | "BASKETBALL" | "TENNIS" | "CRICKET" | "GENERAL";
}

const RSS_FEEDS: FeedConfig[] = [
  {
    name: "BBC Sport Football",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    category: "FOOTBALL",
  },
  {
    name: "Sky Sports Football",
    url: "https://www.skysports.com/rss/12040",
    category: "FOOTBALL",
  },
  {
    name: "Sky Sports Premier League",
    url: "https://www.skysports.com/rss/11095",
    category: "FOOTBALL",
  },
  {
    name: "The Guardian Football",
    url: "https://www.theguardian.com/football/rss",
    category: "FOOTBALL",
  },
  {
    name: "ClutchPoints NBA",
    url: "https://clutchpoints.com/feed",
    category: "BASKETBALL",
  },
  {
    name: "BBC Sport F1",
    url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
    category: "GENERAL",
  },
];

// Fallback high-res cover images categorized by sport
const FALLBACK_COVERS: Record<string, string[]> = {
  FOOTBALL: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=80",
  ],
  BASKETBALL: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
  ],
  GENERAL: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
  ],
};

function stripHtml(input?: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function generateSlug(title: string, link: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const hash = crypto.createHash("md5").update(link || title).digest("hex").slice(0, 6);
  return `${base || "article"}-${hash}`;
}

export function safeDate(input: any): Date {
  if (!input) return new Date();
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? new Date() : input;
  }
  const d = new Date(input);
  return isNaN(d.getTime()) ? new Date() : d;
}

function extractCoverImage(item: any, category: string, index: number): string {
  if (item.enclosure?.url && typeof item.enclosure.url === "string") {
    return item.enclosure.url;
  }
  if (item.mediaThumbnail?.$?.url) {
    return item.mediaThumbnail.$.url;
  }
  if (item["media:thumbnail"]?.$?.url) {
    return item["media:thumbnail"].$.url;
  }
  if (item.mediaContent?.$?.url) {
    return item.mediaContent.$.url;
  }
  if (item["media:content"]?.$?.url) {
    return item["media:content"].$.url;
  }

  const htmlContent = item.content || item["content:encoded"] || "";
  const match = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }

  const list = FALLBACK_COVERS[category] || FALLBACK_COVERS.FOOTBALL;
  return list[index % list.length];
}

const parser = new Parser({
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["media:content", "mediaContent"],
      ["content:encoded", "contentEncoded"],
      ["enclosure", "enclosure"],
    ],
  },
});

export async function fetchAllRssNews(): Promise<ParsedRssArticle[]> {
  console.log(`[RSS] Starting fetch across ${RSS_FEEDS.length} sports news feeds...`);

  const feedPromises = RSS_FEEDS.map(async (feedCfg) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // Strict 10-second timeout

    try {
      console.log(`[RSS] ⏳ Fetching ${feedCfg.name}...`);
      const res = await fetch(feedCfg.url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsPortalNews/2.0",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const xml = await res.text();
      const parsed = await parser.parseString(xml);
      const items = (parsed.items || []).slice(0, 10); // Strictly max 10 items per feed

      console.log(`[RSS] ✓ ${feedCfg.name}: parsed ${items.length} items.`);

      return items.map((item, idx): ParsedRssArticle | null => {
        const rawTitle = item.title?.trim();
        const rawLink = item.link?.trim();
        if (!rawTitle || !rawLink) return null;

        const cleanTitle = stripHtml(rawTitle);
        const excerpt = stripHtml(item.contentSnippet || item.content || item.summary || "").slice(0, 260);
        const fullContent = stripHtml(item["content:encoded"] || item.content || excerpt);

        const publishedDate = safeDate(item.isoDate || item.pubDate);

        return {
          title: cleanTitle,
          slug: generateSlug(cleanTitle, rawLink),
          excerpt: excerpt || `${cleanTitle} — Latest breaking updates from ${feedCfg.name}.`,
          content: fullContent || excerpt,
          coverImage: extractCoverImage(item, feedCfg.category, idx),
          source: feedCfg.name,
          sourceUrl: rawLink,
          publishedAt: publishedDate,
          category: feedCfg.category,
        };
      });
    } catch (err: any) {
      console.warn(`[RSS] ✗ ${feedCfg.name}: failed (${err?.message || "timeout/error"})`);
      return [];
    } finally {
      clearTimeout(timeout);
    }
  });

  const settled = await Promise.all(feedPromises);
  const allArticles: ParsedRssArticle[] = settled
    .flat()
    .filter((a): a is ParsedRssArticle => a !== null);

  // Deduplicate by normalized title and source URL
  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();
  const uniqueArticles: ParsedRssArticle[] = [];

  for (const article of allArticles) {
    const normTitle = article.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seenTitles.has(normTitle) && !seenUrls.has(article.sourceUrl)) {
      seenTitles.add(normTitle);
      seenUrls.add(article.sourceUrl);
      uniqueArticles.push(article);
    }
  }

  // Sort newest first
  uniqueArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  console.log(`[RSS] Complete: Collected ${uniqueArticles.length} unique articles from online feeds.`);
  return uniqueArticles;
}
