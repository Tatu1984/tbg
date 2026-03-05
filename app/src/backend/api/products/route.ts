import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { createProductSchema } from "@/backend/validators/product.validator";
import { authenticateRequest } from "@/backend/api/middleware";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

// GET /api/products - list products (authenticated)
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const where: Record<string, unknown> = { active: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    if (category) {
      where.category = { name: category };
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/products - create product
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const role = auth.user.role as string;
    if (!["owner", "manager", "inventory_staff"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({
      where: { sku: parsed.data.sku },
    });
    if (existing) {
      throw new AppError("Product with this SKU already exists", 409);
    }

    const product = await prisma.product.create({
      data: parsed.data,
      include: { category: { select: { name: true } } },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/products - update product
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const role = auth.user.role as string;
    if (!["owner", "manager", "inventory_staff"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      throw new AppError("Product ID is required", 400);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: { select: { name: true } } },
    });

    return NextResponse.json({ product });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/products - soft delete product
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const role = auth.user.role as string;
    if (!["owner", "manager"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new AppError("Product ID is required", 400);
    }

    await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return handleError(error);
  }
}
