# 🚀 Sports Portal — Production Deployment Guide

This guide provides step-by-step instructions for deploying the **Sports Portal** platform to production environments, focusing on **Vercel** paired with managed serverless PostgreSQL (**Neon** or **Supabase**), as well as self-hosted Docker deployments.

---

## 📋 Architectural Overview

- **Framework**: Next.js 14.2 (App Router)
- **Internationalization**: `next-intl` (English & Persian RTL, route prefixing `/en` and `/fa`)
- **Database & ORM**: Prisma ORM with SQLite (local development) / PostgreSQL (production)
- **Authentication**: NextAuth.js v4 (Credentials + JWT sessions, Role-Based Access Control)
- **Client Cache**: SWR with optimistic UI mutations
- **Server Cache**: Next.js `unstable_cache` (1-hour TTL on API-Football to protect 100/day limits)
- **External Data**: API-Football (v3.football.api-sports.io)

---

## 🔐 Required Environment Variables

Configure these variables in your Vercel project settings or production `.env.production`:

| Variable | Description | Example Value |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string with connection pooling | `postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | 32-character random key for JWT signature | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical public URL of the deployed application | `https://your-domain.vercel.app` |
| `FOOTBALL_API_KEY` | API-Football API key (100 free requests/day) | `b9c83628c8449f161672f3b4c7319580` |

---

## 🗄️ Database Setup (Neon / Supabase)

### 1. Provision a Postgres Instance
1. Sign up for [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Create a new database project named `sports-portal`.
3. Copy the pooled connection string (Direct URL or Pooled URL).

### 2. Switch Prisma Provider from SQLite to PostgreSQL
Before deploying to production, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Push Migrations & Seed Initial Data
Run the following commands locally or in CI/CD pipeline targeting the remote database:

```bash
# Push schema tables and relations
npx prisma db push

# Generate client
npx prisma generate

# Seed initial teams, players, articles, and admin account
npm run seed
```

---

## ⚡ Deploying to Vercel (Recommended)

1. **Push your code to GitHub / GitLab**.
2. **Import project into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository.
   - Framework Preset: **Next.js**.
   - Root Directory: `./` (or the folder where `package.json` resides).
3. **Configure Environment Variables**:
   - Add `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `FOOTBALL_API_KEY`.
4. **Build & Development Settings**:
   - Build Command: `npx prisma generate && npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Click **Deploy**. Vercel will build the application, optimize images, generate edge routes, and publish globally.

---

## 🐳 Docker Self-Hosted Deployment

For self-hosting on VPS (Ubuntu/Debian) or Docker Swarm/Kubernetes:

```dockerfile
# Multi-stage production Dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Run with Docker Compose:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:secret@db:5432/sports_portal
      - NEXTAUTH_SECRET=supersecretjwtstring
      - NEXTAUTH_URL=http://localhost:3000
      - FOOTBALL_API_KEY=b9c83628c8449f161672f3b4c7319580
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=sports_portal
      - POSTGRES_PASSWORD=secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 🩺 Post-Deployment Verification Checklist

- [ ] **Health Endpoint**: Navigate to `https://your-domain/api/health` and verify HTTP 200 with all checks `healthy`.
- [ ] **Language Switching**: Test switching between `/en` and `/fa`. Check RTL alignment and Persian digits formatting.
- [ ] **Authentication**: Log in with default admin credentials (`admin@sportsportal.com` / `admin123`).
- [ ] **API-Football Standings**: Visit `/matches` -> **Standings** tab. Toggle between Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and Champions League.
- [ ] **Sitemap & Robots**: Verify `https://your-domain/sitemap.xml` and `https://your-domain/robots.txt` render correctly.
