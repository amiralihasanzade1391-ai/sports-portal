import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod validation schema for creating / updating an article ────────────────

const articleCreateSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title too long"),
  slug: z
    .string()
    .min(3, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  coverImage: z.string().url("Cover image must be a valid URL"),
  category: z.enum(["FOOTBALL", "BASKETBALL", "TENNIS", "CRICKET", "GENERAL"]),
  published: z.boolean().default(false),
  titleFa: z.string().optional(),
  excerptFa: z.string().optional(),
  contentFa: z.string().optional(),
});

// ─── GET /api/news ────────────────────────────────────────────────────────────
// Public: Fetch all published articles with optional category filter + pagination

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "9")));
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const includeUnpublished = searchParams.get("all") === "true";

    // Determine if requester is an admin (to allow seeing unpublished drafts)
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Build Prisma where clause
    const where = {
      // Non-admins always see only published articles
      ...(!isAdmin || !includeUnpublished ? { published: true } : {}),
      ...(category && category !== "ALL" ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { excerpt: { contains: search } },
            ],
          }
        : {}),
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: articles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/news]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// ─── POST /api/news ───────────────────────────────────────────────────────────
// Admin only: Create a new article

export async function POST(request: Request) {
  try {
    // Auth check — must be ADMIN
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

    // Parse + validate body
    const body = await request.json();
    const result = articleCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check for slug uniqueness
    const existing = await prisma.article.findUnique({
      where: { slug: result.data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An article with this slug already exists" },
        { status: 409 }
      );
    }

    const article = await prisma.article.create({
      data: {
        ...result.data,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: article },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/news]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create article" },
      { status: 500 }
    );
  }
}
