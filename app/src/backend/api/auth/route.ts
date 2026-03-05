import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { loginSchema } from "@/backend/validators/auth.validator";
import { verifyPassword } from "@/backend/utils/hash.util";
import { signToken } from "@/backend/utils/jwt.util";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new AppError("Invalid username or password", 401);
    }

    if (!user.active) {
      throw new AppError("Account is deactivated. Contact admin.", 403);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      throw new AppError("Invalid username or password", 401);
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
