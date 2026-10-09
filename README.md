# ⚽ Sports Portal — Enterprise Sports News & Live Match Intelligence

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-SQLite%20%7C%20Postgres-2D3748?logo=prisma)](https://prisma.io/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-v4-purple?logo=auth0)](https://next-auth.js.org/)
[![API-Football](https://img.shields.io/badge/API--Football-v3-00d084)](https://api-sports.io/)

A modern, full-stack, enterprise-grade sports intelligence platform engineered with Next.js 14 App Router, Next-Intl (Bilingual English & Persian RTL), Prisma ORM, SWR data caching, and real-time football integrations.

---

## ✨ Key Features

### 🌐 1. Full Internationalization (i18n) & Persian RTL
- Dual locale routing: `/en` (English) and `/fa` (Persian).
- First-class RTL layout with dynamic direction switching.
- **Persian Typography**: Integrated **Estedad** and **Vazirmatn** web fonts with localized numeral conversion (English `123` ➔ Persian `۱۲۳`).
- SEO alternates (`hreflang`), canonical URLs, and localized metadata.

### 🏆 2. Real-Time Competition Standings (API-Football)
- Live standings for top 6 world competitions:
  - **Premier League** (England)
  - **La Liga** (Spain)
  - **Serie A** (Italy)
  - **Bundesliga** (Germany)
  - **Ligue 1** (France)
  - **UEFA Champions League** (Europe)
- Server-side hourly caching via Next.js `unstable_cache` with a 3600-second TTL to protect external API rate limits.
- High-fidelity offline fallback data guarantee.
- Champions League qualification zone highlight (emerald accents) and Relegation zone highlight (rose accents).
- 5-match form guide badges (W/D/L pills) and in-table club search filtering.

### 📰 3. News Editorial & Community Discussions
- Categorized articles (Football, Basketball, Tennis, Formula 1, Esports).
- Single article view with estimated read times, author bios, and social sharing.
- User comments system with optimistic mutations and moderation controls.

### 🛡️ 4. Administration Control Center (`/admin`)
- Role-Based Access Control (`ADMIN` role required).
- CRUD operations for Articles, Matches, Teams, Players, and Users.
- Instant Optimistic UI updates with automatic rollbacks.
- Live logo and portrait image URL previews.
- Dynamic team dropdowns and `<ConfirmDialog>` deletion safeguards.

### 👤 5. Fan Dashboard (`/dashboard`)
- User Profile management with real-time NextAuth session sync.
- Favorite clubs tracking with searchable club autocomplete.
- Personal comment history and moderation tracking.
- Profile completeness progress meter.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Radix UI, Lucide Icons, Framer Motion |
| **Fonts** | Inter, Vazirmatn, Estedad |
| **Backend & APIs** | Next.js Route Handlers, Server Actions, API-Football v3 REST API |
| **Database & ORM**| Prisma ORM (SQLite for local dev, PostgreSQL for production) |
| **Auth & Security**| NextAuth.js v4 (JWT session strategy, bcryptjs password hashing) |
| **Data Fetching**  | SWR (Stale-While-Revalidate), Next.js `unstable_cache` |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18.x or 20.x
- npm / yarn / pnpm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/sports-portal.git
cd sports-portal
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
FOOTBALL_API_KEY="b9c83628c8449f161672f3b4c7319580"
```

### 3. Setup Database & Seed Initial Content
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Seed teams, players, articles, and admin account
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Accounts (Seeded)

| Account | Email | Password | Role |
|---|---|---|---|
| **Admin** | `admin@sportsportal.com` | `admin123` | `ADMIN` |
| **Demo Fan** | `fan@sportsportal.com` | `fan123` | `USER` |

---

## 🧪 Production Verification

To test a full production build:
```bash
npm run build
npm run start
```

Health check verification:
```bash
curl http://localhost:3000/api/health
```

---

## 📖 Deployment

For detailed production deployment instructions using Vercel and Neon/Supabase, please refer to [DEPLOYMENT.md](./DEPLOYMENT.md).
