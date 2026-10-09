import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── GET /api/stats ───────────────────────────────────────────────────────────
// Admin only: Live KPIs and aggregation metrics for the admin dashboard

export const dynamic = "force-dynamic";

export async function GET() {
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

    const [
      totalUsers,
      totalArticles,
      publishedArticles,
      draftArticles,
      totalMatches,
      activeMatches,
      finishedMatches,
      totalTeams,
      totalPlayers,
      totalComments,
      recentUsers,
      recentMatches,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.article.count(),
      prisma.article.count({ where: { published: true } }),
      prisma.article.count({ where: { published: false } }),
      prisma.match.count(),
      prisma.match.count({
        where: {
          status: { in: ["FIRST_HALF", "HALF_TIME", "SECOND_HALF"] },
        },
      }),
      prisma.match.count({ where: { status: "FINISHED" } }),
      prisma.team.count(),
      prisma.player.count(),
      prisma.comment.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.match.findMany({
        take: 5,
        orderBy: { matchDate: "desc" },
        include: {
          homeTeam: { select: { name: true, shortName: true, logo: true } },
          awayTeam: { select: { name: true, shortName: true, logo: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalArticles,
        publishedArticles,
        draftArticles,
        totalMatches,
        activeMatches,
        finishedMatches,
        totalTeams,
        totalPlayers,
        totalComments,
        recentUsers,
        recentMatches,
      },
    });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
