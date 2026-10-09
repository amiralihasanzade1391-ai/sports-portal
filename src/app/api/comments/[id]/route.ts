import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for updating a comment ───────────────────────────────────────

const commentUpdateSchema = z.object({
  content: z
    .string()
    .min(3, "Comment must be at least 3 characters")
    .max(1000, "Comment cannot exceed 1000 characters")
    .trim(),
});

// ─── GET /api/comments/[id] ───────────────────────────────────────────────────
// Public: Fetch a single comment by ID

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, image: true } },
        article: { select: { id: true, title: true, slug: true, published: true } },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    // Hide comments on unpublished articles from non-admins
    const session = await getServerSession(authOptions);
    if (!comment.article?.published && session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: comment });
  } catch (error) {
    console.error("[GET /api/comments/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/comments/[id] ───────────────────────────────────────────────────
// Auth: Owner can edit their own comment; Admins can edit any comment

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

    const existing = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, content: true },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    // Authorization: must be comment owner OR admin
    const isOwner = existing.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to edit this comment" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = commentUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.comment.update({
      where: { id: params.id },
      data: { content: result.data.content },
      include: {
        user: { select: { id: true, name: true, image: true } },
        article: { select: { id: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/comments/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/comments/[id] ────────────────────────────────────────────────
// Auth: Owner can delete their own comment; Admins can delete any comment

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

    const existing = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    // Authorization: must be comment owner OR admin
    const isOwner = existing.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to delete this comment" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/comments/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
