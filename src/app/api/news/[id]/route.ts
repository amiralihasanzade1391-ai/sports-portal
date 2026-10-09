import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for partial article updates ───────────────────────────────────

const articleUpdateSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only")
    .optional(),
  excerpt: z.string().min(10).optional(),
  content: z.string().min(20).optional(),
  coverImage: z.string().url().optional(),
  category: z
    .enum(["FOOTBALL", "BASKETBALL", "TENNIS", "CRICKET", "GENERAL"])
    .optional(),
  published: z.boolean().optional(),
  titleFa: z.string().optional(),
  excerptFa: z.string().optional(),
  contentFa: z.string().optional(),
});

// ─── GET /api/news/[id] ───────────────────────────────────────────────────────
// Public: Fetch a single article by its database ID

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { comments: true } },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // Unpublished articles are only visible to admins
    const session = await getServerSession(authOptions);
    if (!article.published && session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("[GET /api/news/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/news/[id] ───────────────────────────────────────────────────────
// Admin only: Partially update an article

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

    // Ensure article exists
    const existing = await prisma.article.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = articleUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // If slug is being changed, verify uniqueness
    if (result.data.slug && result.data.slug !== existing.slug) {
      const slugConflict = await prisma.article.findUnique({
        where: { slug: result.data.slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: "An article with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: result.data,
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/news/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/news/[id] ────────────────────────────────────────────────────
// Admin only: Permanently delete an article (cascades to comments)

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

    const existing = await prisma.article.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // Prisma cascades DELETE to child comments (defined in schema)
    await prisma.article.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      message: `Article "${existing.title}" deleted successfully`,
    });
  } catch (error) {
    console.error("[DELETE /api/news/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
