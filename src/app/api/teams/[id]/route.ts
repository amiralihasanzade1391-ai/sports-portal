import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for partial team updates ─────────────────────────────────────

const teamUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  shortName: z.string().min(2).max(5).toUpperCase().optional(),
  logo: z.string().min(1).max(500).optional(),
  league: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  nameFa: z.string().optional(),
  leagueFa: z.string().optional(),
  stadiumFa: z.string().optional(),
  founded: z.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
  stadium: z.string().max(200).nullable().optional(),
});

// ─── GET /api/teams/[id] ──────────────────────────────────────────────────────
// Public: Fetch a single team with its players and upcoming matches

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        players: {
          orderBy: { goals: "desc" },
        },
        homeMatches: {
          include: {
            awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
          },
          orderBy: { matchDate: "desc" },
          take: 5,
        },
        awayMatches: {
          include: {
            homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
          },
          orderBy: { matchDate: "desc" },
          take: 5,
        },
        _count: { select: { players: true, favoriteTeams: true } },
      },
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("[GET /api/teams/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/teams/[id] ──────────────────────────────────────────────────────
// Admin only: Update team information

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const existing = await prisma.team.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = teamUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.team.update({
      where: { id: params.id },
      data: result.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/teams/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update team" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/teams/[id] ───────────────────────────────────────────────────
// Admin only: Delete a team (cascades to players and favorite_teams)

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
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

    const existing = await prisma.team.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Guard: cannot delete a team that has scheduled/live matches
    const activeMatches = await prisma.match.count({
      where: {
        OR: [{ homeTeamId: params.id }, { awayTeamId: params.id }],
        status: { in: ["NOT_STARTED", "FIRST_HALF", "HALF_TIME", "SECOND_HALF"] },
      },
    });
    if (activeMatches > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete team with ${activeMatches} active or scheduled match(es). Finish or cancel those first.`,
        },
        { status: 409 }
      );
    }

    await prisma.team.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      message: `Team "${existing.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("[DELETE /api/teams/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete team" },
      { status: 500 }
    );
  }
}
