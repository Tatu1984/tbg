import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { hashPassword, verifyPassword } from "@/backend/utils/hash.util";
import { signToken } from "@/backend/utils/jwt.util";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

// POST /api/shop/auth - customer login or register
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "register") {
      const { name, email, password, phone } = body;
      if (!name || !email || !password) {
        throw new AppError("Name, email, and password are required", 400);
      }
      if (password.length < 6) {
        throw new AppError("Password must be at least 6 characters", 400);
      }

      const existing = await prisma.customer.findUnique({ where: { email } });
      if (existing) {
        throw new AppError("An account with this email already exists", 409);
      }

      const hashed = await hashPassword(password);
      const customer = await prisma.customer.create({
        data: { name, email, password: hashed, phone: phone || null },
      });

      const token = await signToken({
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: "customer",
      });

      return NextResponse.json({
        token,
        customer: { id: customer.id, name: customer.name, email: customer.email },
      }, { status: 201 });
    }

    // Login
    const { email, password } = body;
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      throw new AppError("Invalid email or password", 401);
    }

    const valid = await verifyPassword(password, customer.password);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = await signToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: "customer",
    });

    return NextResponse.json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
  } catch (error) {
    return handleError(error);
  }
}
