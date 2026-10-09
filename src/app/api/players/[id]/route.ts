import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for partial player updates ────────────────────────────────────

const playerUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  nameFa: z.string().optional(),
  teamId: z.string().cuid("Invalid team ID").optional(),
  position: z.string().min(2).max(50).optional(),
  positionFa: z.string().optional(),
  number: z.number().int().min(1).max(99).nullable().optional(),
  nationality: z.string().min(2).max(100).optional(),
  nationalityFa: z.string().optional(),
  image: z.string().url().optional(),
  goals: z.number().int().min(0).optional(),
  assists: z.number().int().min(0).optional(),
  appearances: z.number().int().min(0).optional(),
});

// ─── GET /api/players/[id] ────────────────────────────────────────────────────
// Public: Fetch a single player with their team info

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const player = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logo: true,
            league: true,
            country: true,
          },
        },
      },
    });

    if (!player) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    console.error("[GET /api/players/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch player" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/players/[id] ────────────────────────────────────────────────────
// Admin only: Update player stats, position, squad number, or team (transfer)

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

    const existing = await prisma.player.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = playerUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // If transferring to a new team, verify it exists
    if (result.data.teamId && result.data.teamId !== existing.teamId) {
      const newTeam = await prisma.team.findUnique({ where: { id: result.data.teamId } });
      if (!newTeam) {
        return NextResponse.json(
          { success: false, error: "Target team for transfer not found" },
          { status: 404 }
        );
      }
    }

    // If squad number is changing, check uniqueness in the target team
    const targetTeamId = result.data.teamId ?? existing.teamId;
    if (result.data.number != null && result.data.number !== existing.number) {
      const conflict = await prisma.player.findFirst({
        where: {
          teamId: targetTeamId,
          number: result.data.number,
          NOT: { id: params.id },
        },
      });
      if (conflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Squad number #${result.data.number} is already taken by ${conflict.name}`,
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.player.update({
      where: { id: params.id },
      data: result.data,
      include: {
        team: { select: { id: true, name: true, shortName: true, logo: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/players/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update player" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/players/[id] ─────────────────────────────────────────────────
// Admin only: Remove a player record

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

    const existing = await prisma.player.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 }
      );
    }

    await prisma.player.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      message: `Player "${existing.name}" removed successfully`,
    });
  } catch (error) {
    console.error("[DELETE /api/players/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete player" },
      { status: 500 }
    );
  }
}
