import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TOP_20_CLUBS } from "../src/lib/sports-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding portal database with authentic CDN logos & dual-language content...");

  const adminEmail = "admin@sportsportal.com";
  const hashedPassword = await bcrypt.hash("admin123456", 10);

  // 1. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Portal Administrator",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2. Seed Real Top Clubs with official CDN crests
  const createdClubs: Record<string, any> = {};
  for (const club of TOP_20_CLUBS.slice(0, 8)) {
    const dbClub = await prisma.team.upsert({
      where: { id: club.id },
      update: {
        name: club.name,
        nameFa: club.nameFa,
        shortName: club.shortName,
        logo: club.logo,
        league: club.league,
        leagueFa: club.leagueFa,
        country: club.country,
        stadium: club.stadium,
        founded: club.founded,
      },
      create: {
        id: club.id,
        name: club.name,
        nameFa: club.nameFa,
        shortName: club.shortName,
        logo: club.logo,
        league: club.league,
        leagueFa: club.leagueFa,
        country: club.country,
        stadium: club.stadium,
        founded: club.founded,
      },
    });
    createdClubs[club.id] = dbClub;
  }

  // 3. Bilingual Demo Articles (Tagged with source: "demo" for production filtering)
  await prisma.article.upsert({
    where: { slug: "champions-league-quarterfinals-tactical-breakdown" },
    update: {
      source: "demo",
      sourceUrl: "https://sportsportal.internal/demo",
      titleFa: "یک‌چهارم نهایی لیگ قهرمانان اروپا: کالبدشکافی تاکتیکی غول‌های اروپا",
      excerptFa: "تحلیل موشکافانه سیستم‌های پرس سنگین، تغییر آرایش در فاز انتقال و جدال مرگ و زندگی در خط میانی.",
      contentFa: "رقابت‌های لیگ قهرمانان اروپا به اوج حساسیت رسیده است. تیم‌های حاضر در مرحله یک‌چهارم نهایی با تلفیقی از پرسینگ از بالا و ضدحملات سریع خطرسازترین نمایش‌های فصل را به اجرا گذاشته‌اند.",
    },
    create: {
      title: "Champions League Quarterfinals: Key Tactical Matchups Breakdown",
      titleFa: "یک‌چهارم نهایی لیگ قهرمانان اروپا: کالبدشکافی تاکتیکی غول‌های اروپا",
      slug: "champions-league-quarterfinals-tactical-breakdown",
      excerpt: "An in-depth analysis of high-pressing structures, mid-block variations, and midfield transitions.",
      excerptFa: "تحلیل موشکافانه سیستم‌های پرس سنگین، تغییر آرایش در فاز انتقال و جدال مرگ و زندگی در خط میانی.",
      content: "The UEFA Champions League quarterfinals represent the tactical pinnacle of world football. High pressing intensity, rapid vertical transitions, and individual brilliance continue to dictate outcomes at the highest echelon of the sport.",
      contentFa: "رقابت‌های لیگ قهرمانان اروپا به اوج حساسیت رسیده است. تیم‌های حاضر در مرحله یک‌چهارم نهایی با تلفیقی از پرسینگ از بالا و ضدحملات سریع خطرسازترین نمایش‌های فصل را به اجرا گذاشته‌اند.",
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60",
      category: "FOOTBALL",
      published: true,
      source: "demo",
      sourceUrl: "https://sportsportal.internal/demo",
      authorId: adminUser.id,
    },
  });

  await prisma.article.upsert({
    where: { slug: "el-clasico-title-race-tactics" },
    update: {
      source: "demo",
      sourceUrl: "https://sportsportal.internal/demo",
    },
    create: {
      title: "El Clásico Title Race: Tactical Evolution at the Bernabéu",
      titleFa: "ال‌کلاسیکو و سرنوشت قهرمانی: تکامل تاکتیکی در سانتیاگو برنابئو",
      slug: "el-clasico-title-race-tactics",
      excerpt: "Inside the tactical chess match between Real Madrid and Barcelona that could decide the championship.",
      excerptFa: "نگاهی موشکافانه به شطرنج تاکتیکی رئال مادرید و بارسلونا که می‌تواند سرنوشت جام را تعیین کند.",
      content: "Whenever Real Madrid and Barcelona meet, tactical schemes are pushed to their limits. With high line offside traps and inverted wingers, this season's showdown delivers unprecedented technical mastery.",
      contentFa: "جدال رئال مادرید و بارسلونا همواره فراتر از یک مسابقه ساده است؛ تله‌های آفسایدگیری و حرکات قطری وینگرها شطرنجی نفس‌گیر را در برنابئو رقم زده است.",
      coverImage: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=60",
      category: "FOOTBALL",
      published: true,
      source: "demo",
      sourceUrl: "https://sportsportal.internal/demo",
      authorId: adminUser.id,
    },
  });

  // 4. Players
  const mci = createdClubs["team-mancity"];
  const ars = createdClubs["team-arsenal"];
  const rma = createdClubs["team-realmadrid"];

  if (mci) {
    await prisma.player.upsert({
      where: { id: "player-haaland" },
      update: {
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=60",
      },
      create: {
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
        teamId: mci.id,
      },
    });
  }

  if (ars) {
    await prisma.player.upsert({
      where: { id: "player-saka" },
      update: {
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60",
      },
      create: {
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
        teamId: ars.id,
      },
    });
  }

  if (rma) {
    await prisma.player.upsert({
      where: { id: "player-mbappe" },
      update: {
        image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=60",
      },
      create: {
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
        teamId: rma.id,
      },
    });
  }

  // 5. Matches with authentic clubs
  if (ars && mci) {
    await prisma.match.upsert({
      where: { id: "match-ars-mci" },
      update: {
        homeScore: 2,
        awayScore: 1,
        status: "FIRST_HALF",
        minute: 38,
      },
      create: {
        id: "match-ars-mci",
        homeTeamId: ars.id,
        awayTeamId: mci.id,
        homeScore: 2,
        awayScore: 1,
        status: "FIRST_HALF",
        minute: 38,
        league: "Premier League",
        venue: "Emirates Stadium",
        matchDate: new Date(),
      },
    });
  }

  const bar = createdClubs["team-barcelona"];
  if (rma && bar) {
    await prisma.match.upsert({
      where: { id: "match-rma-bar" },
      update: {},
      create: {
        id: "match-rma-bar",
        homeTeamId: rma.id,
        awayTeamId: bar.id,
        homeScore: null,
        awayScore: null,
        status: "NOT_STARTED",
        league: "La Liga",
        venue: "Santiago Bernabéu",
        matchDate: new Date(Date.now() + 86400000 * 2),
      },
    });
  }

  console.log("✅ Seed completed with official logos, bilingual metadata, and scheduled fixtures!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
