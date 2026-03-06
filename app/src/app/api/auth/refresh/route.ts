import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { verifyToken, signToken } from "@/backend/utils/jwt.util";
import { handleError } from "@/backend/utils/error-handler.util";

// POST /api/auth/refresh - refresh JWT token
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const role = payload.role as string;

    // Refresh for staff users
    if (role !== "customer") {
      const user = await prisma.user.findUnique({
        where: { id: payload.id as string },
        select: { id: true, username: true, name: true, role: true, active: true },
      });

      if (!user || !user.active) {
        return NextResponse.json({ error: "Account not found or deactivated" }, { status: 401 });
      }

      const newToken = await signToken({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      });

      return NextResponse.json({
        token: newToken,
        user: { id: user.id, username: user.username, name: user.name, role: user.role },
      });
    }

    // Refresh for customers
    const customer = await prisma.customer.findUnique({
      where: { id: payload.id as string },
      select: { id: true, email: true, name: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Account not found" }, { status: 401 });
    }

    const newToken = await signToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: "customer",
    });

    return NextResponse.json({
      token: newToken,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
  } catch (error) {
    return handleError(error);
  }
}
