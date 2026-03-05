import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { createUserSchema, updateUserSchema } from "@/backend/validators/auth.validator";
import { hashPassword } from "@/backend/utils/hash.util";
import { authorizeRoles } from "@/backend/api/middleware";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

// GET /api/users - list all users (owner/manager only)
export async function GET(req: NextRequest) {
  try {
    const auth = await authorizeRoles("owner", "manager")(req);
    if (auth instanceof NextResponse) return auth;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/users - create user (owner only)
export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRoles("owner")(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { username, password, name, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      throw new AppError("Username already taken", 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name, role },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/users - update user (owner only)
export async function PUT(req: NextRequest) {
  try {
    const auth = await authorizeRoles("owner")(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      throw new AppError("User ID is required", 400);
    }

    const parsed = updateUserSchema.safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };

    if (data.password && typeof data.password === "string") {
      data.password = await hashPassword(data.password);
    }

    if (data.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username as string },
      });
      if (existing && existing.id !== id) {
        throw new AppError("Username already taken", 409);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleError(error);
  }
}
