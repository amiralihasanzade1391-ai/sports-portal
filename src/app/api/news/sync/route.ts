import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchAllRssNews, safeDate } from "@/lib/news/rss-fetcher";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for batch processing

const CRON_SECRET = process.env.CRON_SECRET || "sports_portal_sync_token_2026";

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const token = req.nextUrl.searchParams.get("token");
  if (token && token === CRON_SECRET) {
    return true;
  }

  // Also check Bearer authorization header for Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.replace("Bearer ", "") === CRON_SECRET) {
    return true;
  }

  // Check admin session
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role === "ADMIN") {
      return true;
    }
  } catch {
    // Session check fallback
  }

  return false;
}

async function handleNewsSync(req: NextRequest) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Pass ?token=YOUR_SECRET or sign in as admin." },
      { status: 401 }
    );
  }

  try {
    console.log("[News Sync] Initiating RSS news sync across feeds...");
    const rawArticles = await fetchAllRssNews();

    if (rawArticles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No articles found from RSS feeds.",
        imported: 0,
        total: 0,
      });
    }

    // Ensure dedicated Editorial Desk user exists for attribution
    let author = await prisma.user.findFirst({
      where: { email: "editorial@sportsportal.com" },
    });

    if (!author) {
      author = await prisma.user.create({
        data: {
          email: "editorial@sportsportal.com",
          name: "Global Sports Desk",
          role: "ADMIN",
        },
      });
    }

    // Single batch query to filter existing articles (SQLite compatible)
    const existingArticles = await prisma.article.findMany({
      where: {
        OR: [
          { slug: { in: rawArticles.map((a) => a.slug) } },
          { sourceUrl: { in: rawArticles.map((a) => a.sourceUrl) } },
        ],
      },
      select: { slug: true, sourceUrl: true },
    });

    const existingSlugs = new Set(existingArticles.map((a) => a.slug));
    const existingUrls = new Set(existingArticles.map((a) => a.sourceUrl).filter(Boolean));

    const freshArticles = rawArticles.filter(
      (a) => !existingSlugs.has(a.slug) && !existingUrls.has(a.sourceUrl)
    );

    let insertedCount = 0;

    if (freshArticles.length > 0) {
      const createData = freshArticles.map((item) => ({
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        coverImage: item.coverImage,
        category: item.category,
        source: item.source,
        sourceUrl: item.sourceUrl,
        published: true,
        authorId: author.id,
        createdAt: safeDate(item.publishedAt),
      }));

      const result = await prisma.article.createMany({
        data: createData,
      });

      insertedCount = result.count;
    }

    console.log(`[News Sync] Successfully batch-imported ${insertedCount} new articles.`);

    return NextResponse.json({
      success: true,
      imported: insertedCount,
      skipped: rawArticles.length - freshArticles.length,
      total: rawArticles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[News Sync] Failed to execute RSS news sync:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error during news sync" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleNewsSync(req);
}

export async function POST(req: NextRequest) {
  return handleNewsSync(req);
}
