import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for posting a comment ────────────────────────────────────────

const commentCreateSchema = z.object({
  articleId: z.string().cuid("Invalid article ID"),
  content: z
    .string()
    .min(3, "Comment must be at least 3 characters")
    .max(1000, "Comment cannot exceed 1000 characters")
    .trim(),
});

// ─── GET /api/comments ────────────────────────────────────────────────────────
// Public (for published articles): Fetch comments, optionally filtered by articleId

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    const userId = searchParams.get("userId");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));

    // If scoped to a specific article, verify it exists and is published
    if (articleId) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { id: true, published: true },
      });

      if (!article) {
        return NextResponse.json(
          { success: false, error: "Article not found" },
          { status: 404 }
        );
      }

      // Non-admins cannot read comments on unpublished articles
      const session = await getServerSession(authOptions);
      if (!article.published && session?.user?.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Article not found" },
          { status: 404 }
        );
      }
    }

    const where = {
      ...(articleId ? { articleId } : {}),
      ...(userId ? { userId } : {}),
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: comments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/comments]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// ─── POST /api/comments ───────────────────────────────────────────────────────
// Authenticated users only: Post a comment on a published article

export async function POST(request: Request) {
  try {
    // Any logged-in user can comment (not just admins)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to post a comment" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = commentCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify the article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: result.data.articleId },
      select: { id: true, published: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // Only admins can comment on draft/unpublished articles
    if (!article.published && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Cannot comment on an unpublished article" },
        { status: 403 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: result.data.content,
        articleId: result.data.articleId,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        article: { select: { id: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/comments]", error);
    return NextResponse.json(
      { success: false, error: "Failed to post comment" },
      { status: 500 }
    );
  }
}
