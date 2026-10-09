import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for adding a favorite team ───────────────────────────────────

const favoriteCreateSchema = z.object({
  teamId: z.string().cuid("Invalid team ID"),
});

// ─── GET /api/users/[id]/favorites ────────────────────────────────────────────
// Auth: User can view their own favorites; Admins can view any user's favorites

export async function GET(
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

    const isSelf = session.user.id === params.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const favorites = await prisma.favoriteTeam.findMany({
      where: { userId: params.id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logo: true,
            league: true,
            country: true,
            stadium: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: favorites });
  } catch (error) {
    console.error("[GET /api/users/[id]/favorites]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch favorite teams" },
      { status: 500 }
    );
  }
}

// ─── POST /api/users/[id]/favorites ───────────────────────────────────────────
// Auth: User can follow a team for themselves; Admins can add for any user

export async function POST(
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

    const isSelf = session.user.id === params.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = favoriteCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: result.data.teamId },
    });
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existing = await prisma.favoriteTeam.findUnique({
      where: {
        userId_teamId: {
          userId: params.id,
          teamId: result.data.teamId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Team is already in your favorites" },
        { status: 409 }
      );
    }

    const favorite = await prisma.favoriteTeam.create({
      data: {
        userId: params.id,
        teamId: result.data.teamId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logo: true,
            league: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: favorite }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/users/[id]/favorites]", error);
    return NextResponse.json(
      { success: false, error: "Failed to follow team" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/users/[id]/favorites ─────────────────────────────────────────
// Auth: User can unfollow a team for themselves; Admins can remove for any user

export async function DELETE(
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

    const isSelf = session.user.id === params.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let teamId = searchParams.get("teamId");

    // Support teamId passed either in query string or in JSON body
    if (!teamId) {
      try {
        const body = await request.json();
        teamId = body.teamId;
      } catch {
        // Body was empty or non-JSON
      }
    }

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "teamId query parameter or JSON body is required" },
        { status: 400 }
      );
    }

    const deleted = await prisma.favoriteTeam.deleteMany({
      where: {
        userId: params.id,
        teamId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: "Favorite club entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Club removed from favorites successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/users/[id]/favorites]", error);
    return NextResponse.json(
      { success: false, error: "Failed to unfollow team" },
      { status: 500 }
    );
  }
}
