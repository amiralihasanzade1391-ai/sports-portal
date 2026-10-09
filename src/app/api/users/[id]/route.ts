import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Zod schema for updating a user profile / role ───────────────────────────

const userUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

// ─── GET /api/users/[id] ──────────────────────────────────────────────────────
// Auth: User can view their own profile; Admins can view any profile

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

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments: true,
            favoriteTeams: true,
            articles: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[GET /api/users/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/users/[id] ──────────────────────────────────────────────────────
// Auth: User can update their own name/image; Only Admins can change role

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

    const isSelf = session.user.id === params.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = userUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Role modification guard: only admins are permitted to alter roles
    if (result.data.role && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Only administrators can modify user roles" },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(result.data.name !== undefined ? { name: result.data.name } : {}),
        ...(result.data.image !== undefined ? { image: result.data.image || null } : {}),
        ...(result.data.role !== undefined && isAdmin ? { role: result.data.role } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/users/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/users/[id] ───────────────────────────────────────────────────
// Auth: User can delete their own account; Admins can delete any user account

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

    const isSelf = session.user.id === params.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Guard: Prevent deleting the last remaining admin
    if (existing.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot delete the sole administrator account" },
          { status: 409 }
        );
      }
    }

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      message: `User account deleted successfully`,
    });
  } catch (error) {
    console.error("[DELETE /api/users/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user account" },
      { status: 500 }
    );
  }
}
