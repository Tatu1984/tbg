import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/backend/database/client";
import { authenticateRequest } from "@/backend/api/middleware";
import { requirePagePermission } from "@/backend/auth/permissions";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

const stockTransactionSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["Purchase", "Sale", "Cash Sale", "Return", "Damaged", "Adjustment"]),
  quantity: z.number().int(),
  notes: z.string().optional(),
});

// GET /api/inventory - list stock transactions
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;

    const transactions = await prisma.stockTransaction.findMany({
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/inventory - create stock transaction
export async function POST(req: NextRequest) {
  try {
    const auth = await requirePagePermission(req, "inventory");
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = stockTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { productId, type, quantity, notes } = parsed.data;

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Update stock and create transaction
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new AppError("Insufficient stock", 400);
    }

    const [transaction] = await prisma.$transaction([
      prisma.stockTransaction.create({
        data: {
          productId,
          userId: auth.user.id as string,
          type,
          quantity,
          notes,
        },
        include: {
          product: { select: { name: true, sku: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
    ]);

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
