import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { TOP_20_CLUBS } from "../src/lib/sports-data";

import fs from "fs";
import path from "path";

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

async function main() {
  console.log("🌱 Seeding Neon PostgreSQL database over HTTPS (port 443)...");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const sql = neon(dbUrl);

  const adminEmail = "admin@sportsportal.com";
  const hashedPassword = await bcrypt.hash("admin123456", 10);
  const adminId = "user-admin-sportsportal";
  const now = new Date().toISOString();

  // 1. Admin User
  await sql.query(
    `INSERT INTO "users" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT ("email") DO UPDATE SET "role" = EXCLUDED."role", "password" = EXCLUDED."password"
     RETURNING "id"`,
    [adminId, "Portal Administrator", adminEmail, hashedPassword, "ADMIN", now, now]
  );
  console.log("  ✓ Admin user seeded (admin@sportsportal.com)");

  // 2. Teams (Top 8 clubs)
  for (const club of TOP_20_CLUBS.slice(0, 8)) {
    await sql.query(
      `INSERT INTO "teams" ("id", "name", "nameFa", "shortName", "logo", "league", "leagueFa", "country", "stadium", "founded", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT ("id") DO UPDATE SET
         "name" = EXCLUDED."name",
         "nameFa" = EXCLUDED."nameFa",
         "shortName" = EXCLUDED."shortName",
         "logo" = EXCLUDED."logo",
         "league" = EXCLUDED."league",
         "leagueFa" = EXCLUDED."leagueFa",
         "country" = EXCLUDED."country",
         "stadium" = EXCLUDED."stadium",
         "founded" = EXCLUDED."founded"`,
      [
        club.id,
        club.name,
        club.nameFa || null,
        club.shortName,
        club.logo,
        club.league,
        club.leagueFa || null,
        club.country,
        club.stadium || null,
        club.founded || null,
        now,
        now,
      ]
    );
  }
  console.log("  ✓ Top clubs seeded with CDN logos");

  // 3. Demo Articles
  const articles = [
    {
      id: "art-demo-1",
      title: "Champions League Quarterfinals: Key Tactical Matchups Breakdown",
      titleFa: "یک‌چهارم نهایی لیگ قهرمانان اروپا: کالبدشکافی تاکتیکی غول‌های اروپا",
      slug: "champions-league-quarterfinals-tactical-breakdown",
      excerpt: "An in-depth analysis of high-pressing structures, mid-block variations, and midfield transitions.",
      excerptFa: "تحلیل موشکافانه سیستم‌های پرس سنگین، تغییر آرایش در فاز انتقال و جدال مرگ و زندگی در خط میانی.",
      content: "The UEFA Champions League quarterfinals represent the tactical pinnacle of world football. High pressing intensity, rapid vertical transitions, and individual brilliance continue to dictate outcomes at the highest echelon of the sport.",
      contentFa: "رقابت‌های لیگ قهرمانان اروپا به اوج حساسیت رسیده است. تیم‌های حاضر در مرحله یک‌چهارم نهایی با تلفیقی از پرسینگ از بالا و ضدحملات سریع خطرسازترین نمایش‌های فصل را به اجرا گذاشته‌اند.",
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60",
      category: "FOOTBALL",
      source: "demo",
      sourceUrl: "https://sportsportal.internal/demo",
    },
    {
      id: "art-demo-2",
      title: "El Clásico Title Race: Tactical Evolution at the Bernabéu",
      titleFa: "ال‌کلاسیکو و سرنوشت قهرمانی: تکامل تاکتیکی در سانتیاگو برنابئو",
      slug: "el-clasico-title-race-tactics",
      excerpt: "Inside the tactical chess match between Real Madrid and Barcelona that could decide the championship.",
      excerptFa: "نگاهی موشکافانه به شطرنج تاکتیکی رئال مادرید و بارسلونا که می‌تواند سرنوشت جام را تعیین کند.",
      content: "Whenever Real Madrid and Barcelona meet, tactical schemes are pushed to their limits. With high line offside traps and inverted wingers, this season's showdown delivers unprecedented technical mastery.",
      contentFa: "جدال رئال مادرید و بارسلونا همواره فراتر از یک مسابقه ساده است؛ تله‌های آفسایدگیری و حرکات قطری وینگرها شطرنجی نفس‌گیر را در برنابئو رقم زده است.",
      coverImage: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=60",
      category: "FOOTBALL",
      source: "demo",
      sourceUrl: "https://sportsportal.internal/demo",
    },
  ];

  for (const art of articles) {
    await sql.query(
      `INSERT INTO "articles" ("id", "title", "titleFa", "slug", "excerpt", "excerptFa", "content", "contentFa", "coverImage", "category", "published", "source", "sourceUrl", "authorId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11, $12, $13, $14, $15)
       ON CONFLICT ("slug") DO UPDATE SET
         "title" = EXCLUDED."title",
         "titleFa" = EXCLUDED."titleFa",
         "excerpt" = EXCLUDED."excerpt",
         "excerptFa" = EXCLUDED."excerptFa",
         "content" = EXCLUDED."content",
         "contentFa" = EXCLUDED."contentFa",
         "coverImage" = EXCLUDED."coverImage"`,
      [
        art.id,
        art.title,
        art.titleFa,
        art.slug,
        art.excerpt,
        art.excerptFa,
        art.content,
        art.contentFa,
        art.coverImage,
        art.category,
        art.source,
        art.sourceUrl,
        adminId,
        now,
        now,
      ]
    );
  }
  console.log("  ✓ Demo articles seeded");

  // 4. Players
  const players = [
    {
      id: "player-haaland",
      name: "Erling Haaland",
      nameFa: "ارلینگ هالند",
      position: "Striker",
      positionFa: "مهاجم نوک",
      number: 9,
      nationality: "Norway",
      nationalityFa: "نروژ",
      image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=60",
      goals: 31,
      assists: 4,
      appearances: 28,
      teamId: "team-mancity",
    },
    {
      id: "player-saka",
      name: "Bukayo Saka",
      nameFa: "بوکایو ساکا",
      position: "Winger",
      positionFa: "وینگر راست",
      number: 7,
      nationality: "England",
      nationalityFa: "انگلستان",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60",
      goals: 16,
      assists: 14,
      appearances: 28,
      teamId: "team-arsenal",
    },
    {
      id: "player-mbappe",
      name: "Kylian Mbappé",
      nameFa: "کیلیان امباپه",
      position: "Forward",
      positionFa: "مهاجم",
      number: 9,
      nationality: "France",
      nationalityFa: "فرانسه",
      image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=60",
      goals: 28,
      assists: 8,
      appearances: 26,
      teamId: "team-realmadrid",
    },
  ];

  for (const pl of players) {
    await sql.query(
      `INSERT INTO "players" ("id", "name", "nameFa", "position", "positionFa", "number", "nationality", "nationalityFa", "image", "goals", "assists", "appearances", "teamId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT ("id") DO UPDATE SET
         "goals" = EXCLUDED."goals",
         "assists" = EXCLUDED."assists",
         "appearances" = EXCLUDED."appearances",
         "image" = EXCLUDED."image"`,
      [
        pl.id,
        pl.name,
        pl.nameFa,
        pl.position,
        pl.positionFa,
        pl.number,
        pl.nationality,
        pl.nationalityFa,
        pl.image,
        pl.goals,
        pl.assists,
        pl.appearances,
        pl.teamId,
        now,
        now,
      ]
    );
  }
  console.log("  ✓ Key star players seeded");

  // 5. Scheduled Matches
  await sql.query(
    `INSERT INTO "matches" ("id", "homeTeamId", "awayTeamId", "homeScore", "awayScore", "status", "minute", "league", "venue", "matchDate", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT ("id") DO UPDATE SET "homeScore" = EXCLUDED."homeScore", "awayScore" = EXCLUDED."awayScore"`,
    [
      "match-ars-mci",
      "team-arsenal",
      "team-mancity",
      2,
      1,
      "FIRST_HALF",
      38,
      "Premier League",
      "Emirates Stadium",
      now,
      now,
      now,
    ]
  );

  await sql.query(
    `INSERT INTO "matches" ("id", "homeTeamId", "awayTeamId", "homeScore", "awayScore", "status", "league", "venue", "matchDate", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, null, null, 'NOT_STARTED', 'La Liga', 'Santiago Bernabéu', $4, $5, $6)
     ON CONFLICT ("id") DO NOTHING`,
    [
      "match-rma-bar",
      "team-realmadrid",
      "team-barcelona",
      new Date(Date.now() + 86400000 * 2).toISOString(),
      now,
      now,
    ]
  );
  console.log("  ✓ Scheduled & live matches seeded");

  // 6. Site Settings
  await sql.query(
    `INSERT INTO "site_settings" ("id", "siteName", "siteDescription", "maintenanceMode", "featuredArticleIds", "updatedAt")
     VALUES ('default', 'Sports Portal', 'Your premier destination for world football & sports', false, '[]', $1)
     ON CONFLICT ("id") DO UPDATE SET "siteName" = EXCLUDED."siteName"`,
    [now]
  );
  console.log("  ✓ Site settings configured");

  console.log("\n✅ Neon database successfully seeded!");
}

main().catch((e) => {
  console.error("❌ Neon seed error:", e);
  process.exit(1);
});
