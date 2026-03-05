import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { authenticateRequest } from "@/backend/api/middleware";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

async function getCustomerId(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if ("error" in auth) return null;
  if (auth.user.role !== "customer") return null;
  return auth.user.id as string;
}

// GET /api/shop/cart
export async function GET(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.cartItem.findMany({
      where: { customerId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            sellingPrice: true,
            mrp: true,
            stock: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/shop/cart - add or update item
export async function POST(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await req.json();
    if (!productId || !quantity || quantity < 1) {
      throw new AppError("Product ID and quantity are required", 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active || !product.availableOnline) {
      throw new AppError("Product not available", 404);
    }
    if (product.stock < quantity) {
      throw new AppError("Insufficient stock", 400);
    }

    const item = await prisma.cartItem.upsert({
      where: { customerId_productId: { customerId, productId } },
      update: { quantity },
      create: { customerId, productId, quantity },
      include: {
        product: {
          select: { id: true, name: true, brand: true, sellingPrice: true, mrp: true, stock: true, imageUrl: true },
        },
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/shop/cart - remove item
export async function DELETE(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      throw new AppError("Product ID is required", 400);
    }

    await prisma.cartItem.delete({
      where: { customerId_productId: { customerId, productId } },
    });

    return NextResponse.json({ message: "Item removed" });
  } catch (error) {
    return handleError(error);
  }
}
