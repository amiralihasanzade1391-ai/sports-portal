import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Valid match status values (mirrors SQLite string field in schema) ────────

const MATCH_STATUSES = [
  "NOT_STARTED",
  "FIRST_HALF",
  "HALF_TIME",
  "SECOND_HALF",
  "FINISHED",
  "POSTPONED",
  "CANCELLED",
] as const;

// ─── Zod schema for creating a match ─────────────────────────────────────────

const matchCreateSchema = z.object({
  homeTeamId: z.string().cuid("Invalid home team ID"),
  awayTeamId: z.string().cuid("Invalid away team ID"),
  matchDate: z.string().datetime("Match date must be a valid ISO 8601 datetime"),
  venue: z.string().max(200).optional(),
  league: z.string().min(2, "League name is required").max(100),
  homeScore: z.number().int().min(0).nullable().default(null),
  awayScore: z.number().int().min(0).nullable().default(null),
  status: z.enum(MATCH_STATUSES).default("NOT_STARTED"),
  minute: z.number().int().min(0).max(120).nullable().default(null),
}).refine(
  (data) => data.homeTeamId !== data.awayTeamId,
  { message: "Home team and away team cannot be the same", path: ["awayTeamId"] }
);

// ─── GET /api/matches ─────────────────────────────────────────────────────────
// Public: Fetch matches with optional status filter and pagination

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
    const status = searchParams.get("status"); // e.g. "LIVE" maps to multiple statuses
    const league = searchParams.get("league");

    // Build status filter — "LIVE" is a convenience alias
    let statusFilter: object = {};
    if (status === "LIVE") {
      statusFilter = {
        status: { in: ["FIRST_HALF", "HALF_TIME", "SECOND_HALF"] },
      };
    } else if (status === "UPCOMING") {
      statusFilter = { status: "NOT_STARTED" };
    } else if (status === "FINISHED") {
      statusFilter = { status: "FINISHED" };
    } else if (status && MATCH_STATUSES.includes(status as (typeof MATCH_STATUSES)[number])) {
      statusFilter = { status };
    }

    const where = {
      ...statusFilter,
      ...(league ? { league: { contains: league } } : {}),
    };

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          homeTeam: {
            select: { id: true, name: true, shortName: true, logo: true },
          },
          awayTeam: {
            select: { id: true, name: true, shortName: true, logo: true },
          },
        },
        orderBy: [
          // Live matches first, then upcoming by date, then finished
          { matchDate: "desc" },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.match.count({ where }),
    ]);

    // If status is LIVE, also fetch real-time in-progress fixtures from sports providers
    let externalLiveMatches: any[] = [];
    if (status === "LIVE") {
      try {
        const { getLiveMatches } = await import("@/lib/providers");
        const liveFeeds = await getLiveMatches();
        externalLiveMatches = liveFeeds.map((m) => ({
          id: m.id,
          homeTeam: {
            id: String(m.homeTeam.id),
            name: m.homeTeam.name,
            shortName: m.homeTeam.name.slice(0, 3).toUpperCase(),
            logo: m.homeTeam.logo || "",
          },
          awayTeam: {
            id: String(m.awayTeam.id),
            name: m.awayTeam.name,
            shortName: m.awayTeam.name.slice(0, 3).toUpperCase(),
            logo: m.awayTeam.logo || "",
          },
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: "FIRST_HALF",
          minute: m.minute || 1,
          league: m.league,
          matchDate: m.matchDate,
          venue: m.venue || "Stadium",
        }));
      } catch (err) {
        console.warn("[GET /api/matches] Live feed fetch failed:", err);
      }
    }

    const combined = [...matches, ...externalLiveMatches];

    return NextResponse.json({
      success: true,
      data: combined,
      total: total + externalLiveMatches.length,
      page,
      pageSize,
      totalPages: Math.ceil((total + externalLiveMatches.length) / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/matches]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

// ─── POST /api/matches ────────────────────────────────────────────────────────
// Admin only: Create / schedule a new match

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = matchCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify both teams exist
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({ where: { id: result.data.homeTeamId } }),
      prisma.team.findUnique({ where: { id: result.data.awayTeamId } }),
    ]);

    if (!homeTeam) {
      return NextResponse.json(
        { success: false, error: "Home team not found" },
        { status: 404 }
      );
    }
    if (!awayTeam) {
      return NextResponse.json(
        { success: false, error: "Away team not found" },
        { status: 404 }
      );
    }

    const match = await prisma.match.create({
      data: {
        ...result.data,
        matchDate: new Date(result.data.matchDate),
      },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: match },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/matches]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create match" },
      { status: 500 }
    );
  }
}
