import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";
import { fetchAllRssNews, safeDate } from "../src/lib/news/rss-fetcher";
import fs from "fs";
import path from "path";

// Auto-load .env if not loaded
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2]?.trim() || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const dbUrl = process.env.DATABASE_URL || "";
const isNeon = dbUrl.includes("neon.tech");

async function main() {
  console.log("=================================================");
  console.log(`📡 Sports Portal — RSS News Sync Tool (${isNeon ? "Neon HTTPS" : "Prisma"})`);
  console.log("=================================================");

  const startTime = Date.now();

  try {
    // 1. Fetch from live RSS feeds
    const articles = await fetchAllRssNews();

    if (articles.length === 0) {
      console.warn("⚠️ No articles collected from feeds.");
      return;
    }

    console.log(`\n📥 Processing ${articles.length} collected articles for database insertion...`);

    let insertedCount = 0;
    let freshCount = 0;

    if (isNeon) {
      const sql = neon(dbUrl);
      const now = new Date().toISOString();

      // Ensure editorial author exists
      const authorRes = await sql.query(
        `INSERT INTO "users" ("id", "name", "email", "role", "createdAt", "updatedAt")
         VALUES ('user-editorial-desk', 'Global Sports Desk', 'editorial@sportsportal.com', 'ADMIN', $1, $1)
         ON CONFLICT ("email") DO UPDATE SET "role" = 'ADMIN'
         RETURNING "id"`,
        [now]
      );
      const authorId = authorRes[0].id;

      // Check existing articles
      const existingRows = await sql.query(`SELECT "slug", "sourceUrl" FROM "articles"`);
      const existingSlugs = new Set(existingRows.map((r: any) => r.slug));
      const existingUrls = new Set(existingRows.map((r: any) => r.sourceUrl).filter(Boolean));

      const freshArticles = articles.filter(
        (a) => !existingSlugs.has(a.slug) && !existingUrls.has(a.sourceUrl)
      );
      freshCount = freshArticles.length;

      for (const item of freshArticles) {
        const artId = `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await sql.query(
          `INSERT INTO "articles" ("id", "title", "slug", "excerpt", "content", "coverImage", "category", "source", "sourceUrl", "published", "authorId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11, $12)
           ON CONFLICT ("slug") DO NOTHING`,
          [
            artId,
            item.title,
            item.slug,
            item.excerpt,
            item.content,
            item.coverImage,
            item.category,
            item.source,
            item.sourceUrl,
            authorId,
            safeDate(item.publishedAt).toISOString(),
            now,
          ]
        );
        insertedCount++;
      }
    } else {
      const prisma = new PrismaClient();
      try {
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

        const existingArticles = await prisma.article.findMany({
          where: {
            OR: [
              { slug: { in: articles.map((a) => a.slug) } },
              { sourceUrl: { in: articles.map((a) => a.sourceUrl) } },
            ],
          },
          select: { slug: true, sourceUrl: true },
        });

        const existingSlugs = new Set(existingArticles.map((a) => a.slug));
        const existingUrls = new Set(existingArticles.map((a) => a.sourceUrl).filter(Boolean));

        const freshArticles = articles.filter(
          (a) => !existingSlugs.has(a.slug) && !existingUrls.has(a.sourceUrl)
        );
        freshCount = freshArticles.length;

        if (freshArticles.length > 0) {
          const insertPayload = freshArticles.map((item) => ({
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            content: item.content,
            coverImage: item.coverImage,
            category: item.category,
            source: item.source,
            sourceUrl: item.sourceUrl,
            published: true,
            authorId: author!.id,
            createdAt: safeDate(item.publishedAt),
          }));

          const result = await prisma.article.createMany({
            data: insertPayload,
          });
          insertedCount = result.count;
        }
      } finally {
        await prisma.$disconnect();
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("=================================================");
    console.log(`✅ Sync Completed in ${elapsed}s`);
    console.log(`   - Feeds Queried: BBC Sport, Sky Sports, Guardian, ClutchPoints`);
    console.log(`   - Articles Collected: ${articles.length}`);
    console.log(`   - New Articles Inserted: ${insertedCount}`);
    console.log(`   - Existing Skipped: ${articles.length - freshCount}`);
    console.log("=================================================");
  } catch (error: any) {
    console.error("❌ News sync error:", error?.message || error);
    process.exit(1);
  }
}

main();
