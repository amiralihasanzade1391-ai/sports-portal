import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for creating a team ──────────────────────────────────────────

const teamCreateSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100),
  shortName: z
    .string()
    .min(2, "Short name required")
    .max(5, "Short name cannot exceed 5 characters")
    .toUpperCase(),
  logo: z.string().min(1, "Logo (emoji or URL) is required").max(500),
  league: z.string().min(2, "League name is required").max(100),
  country: z.string().min(2, "Country is required").max(100),
  nameFa: z.string().optional(),
  leagueFa: z.string().optional(),
  stadiumFa: z.string().optional(),
  founded: z.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
  stadium: z.string().max(200).nullable().optional(),
});

// ─── GET /api/teams ───────────────────────────────────────────────────────────
// Public: Fetch all teams with optional league filter and search

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get("league");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));

    const where = {
      ...(league ? { league: { contains: league } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { shortName: { contains: search } },
            ],
          }
        : {}),
    };

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        include: {
          _count: { select: { players: true, homeMatches: true, awayMatches: true } },
        },
        orderBy: [{ league: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.team.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: teams,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/teams]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// ─── POST /api/teams ──────────────────────────────────────────────────────────
// Admin only: Create a new team/club

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
    const result = teamCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Prevent duplicate team names within the same league
    const existing = await prisma.team.findFirst({
      where: {
        name: result.data.name,
        league: result.data.league,
      },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A team with this name already exists in this league" },
        { status: 409 }
      );
    }

    const team = await prisma.team.create({
      data: result.data,
    });

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/teams]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create team" },
      { status: 500 }
    );
  }
}
