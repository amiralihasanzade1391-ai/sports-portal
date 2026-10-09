import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for partial match updates ─────────────────────────────────────

const matchUpdateSchema = z.object({
  homeScore: z.number().int().min(0).nullable().optional(),
  awayScore: z.number().int().min(0).nullable().optional(),
  status: z
    .enum([
      "NOT_STARTED",
      "FIRST_HALF",
      "HALF_TIME",
      "SECOND_HALF",
      "FINISHED",
      "POSTPONED",
      "CANCELLED",
    ])
    .optional(),
  minute: z.number().int().min(0).max(120).nullable().optional(),
  venue: z.string().max(200).nullable().optional(),
  league: z.string().min(2).max(100).optional(),
  matchDate: z
    .string()
    .datetime("Must be a valid ISO 8601 datetime")
    .optional(),
  homeTeamId: z.string().cuid().optional(),
  awayTeamId: z.string().cuid().optional(),
});

// ─── GET /api/matches/[id] ────────────────────────────────────────────────────
// Public: Fetch a single match by ID

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        homeTeam: {
          select: { id: true, name: true, shortName: true, logo: true, stadium: true },
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true, logo: true, stadium: true },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: match });
  } catch (error) {
    console.error("[GET /api/matches/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch match" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/matches/[id] ────────────────────────────────────────────────────
// Admin only: Update match details (scores, status, minute — live updates)

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

    const existing = await prisma.match.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = matchUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // If teams are being changed, verify they exist and aren't the same
    const { homeTeamId, awayTeamId, matchDate, ...rest } = result.data;

    if (homeTeamId || awayTeamId) {
      const resolvedHome = homeTeamId ?? existing.homeTeamId;
      const resolvedAway = awayTeamId ?? existing.awayTeamId;

      if (resolvedHome === resolvedAway) {
        return NextResponse.json(
          { success: false, error: "Home team and away team cannot be the same" },
          { status: 400 }
        );
      }

      if (homeTeamId) {
        const ht = await prisma.team.findUnique({ where: { id: homeTeamId } });
        if (!ht) {
          return NextResponse.json(
            { success: false, error: "Home team not found" },
            { status: 404 }
          );
        }
      }
      if (awayTeamId) {
        const at = await prisma.team.findUnique({ where: { id: awayTeamId } });
        if (!at) {
          return NextResponse.json(
            { success: false, error: "Away team not found" },
            { status: 404 }
          );
        }
      }
    }

    const updated = await prisma.match.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(homeTeamId ? { homeTeamId } : {}),
        ...(awayTeamId ? { awayTeamId } : {}),
        ...(matchDate ? { matchDate: new Date(matchDate) } : {}),
      },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/matches/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update match" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/matches/[id] ─────────────────────────────────────────────────
// Admin only: Permanently delete a match record

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

    const existing = await prisma.match.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    await prisma.match.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      message: `Match between teams deleted successfully`,
    });
  } catch (error) {
    console.error("[DELETE /api/matches/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete match" },
      { status: 500 }
    );
  }
}
