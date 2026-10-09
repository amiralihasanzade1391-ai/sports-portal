import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for creating a player ────────────────────────────────────────

const playerCreateSchema = z.object({
  name: z.string().min(2, "Player name must be at least 2 characters").max(100),
  teamId: z.string().cuid("Invalid team ID"),
  position: z
    .string()
    .min(2, "Position is required")
    .max(50)
    .refine(
      (val) =>
        ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"].some(
          (p) => val.toLowerCase().includes(p.toLowerCase())
        ),
      { message: "Position must be a valid football position (e.g. Midfielder, Forward)" }
    ),
  number: z.number().int().min(1).max(99).nullable().optional(),
  nationality: z.string().min(2, "Nationality is required").max(100),
  nameFa: z.string().optional(),
  positionFa: z.string().optional(),
  nationalityFa: z.string().optional(),
  image: z.string().url("Player image must be a valid URL"),
  goals: z.number().int().min(0).default(0),
  assists: z.number().int().min(0).default(0),
  appearances: z.number().int().min(0).default(0),
});

// ─── GET /api/players ─────────────────────────────────────────────────────────
// Public: Fetch all players with optional team filter and pagination

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const search = searchParams.get("search");
    const position = searchParams.get("position");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "12")));
    const sortBy = searchParams.get("sortBy") ?? "goals"; // goals | assists | appearances

    const validSortFields = ["goals", "assists", "appearances", "name"];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "goals";

    const where = {
      ...(teamId ? { teamId } : {}),
      ...(position ? { position: { contains: position } } : {}),
      ...(search ? { name: { contains: search } } : {}),
    };

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        include: {
          team: {
            select: { id: true, name: true, shortName: true, logo: true, league: true },
          },
        },
        orderBy: { [orderField]: orderField === "name" ? "asc" : "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.player.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: players,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/players]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

// ─── POST /api/players ────────────────────────────────────────────────────────
// Admin only: Register a new player

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
    const result = playerCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify the target team exists
    const team = await prisma.team.findUnique({ where: { id: result.data.teamId } });
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Target team not found" },
        { status: 404 }
      );
    }

    // Check squad number uniqueness within the same team
    if (result.data.number != null) {
      const numberConflict = await prisma.player.findFirst({
        where: { teamId: result.data.teamId, number: result.data.number },
      });
      if (numberConflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Squad number #${result.data.number} is already taken by ${numberConflict.name} in this team`,
          },
          { status: 409 }
        );
      }
    }

    const player = await prisma.player.create({
      data: result.data,
      include: {
        team: { select: { id: true, name: true, shortName: true, logo: true } },
      },
    });

    return NextResponse.json({ success: true, data: player }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/players]", error);
    return NextResponse.json(
      { success: false, error: "Failed to register player" },
      { status: 500 }
    );
  }
}
