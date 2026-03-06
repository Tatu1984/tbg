import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/backend/database/client";
import { hashPassword, verifyPassword } from "@/backend/utils/hash.util";
import { signToken } from "@/backend/utils/jwt.util";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

const registerSchema = z.object({
  action: z.literal("register"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional(),
});

const loginSchema = z.object({
  action: z.literal("login").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/shop/auth - customer login or register
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "register") {
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
      }

      const { name, email, password, phone } = parsed.data;

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
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;

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
