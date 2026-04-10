import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/backend/database/client";
import { createProductSchema, updateProductSchema } from "@/backend/validators/product.validator";
import { authenticateRequest } from "@/backend/api/middleware";
import { requirePagePermission } from "@/backend/auth/permissions";
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
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
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
    const auth = await requirePagePermission(req, "products");
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    // Verify the category exists. Without this check, an invalid id
    // surfaces as a generic 500 from a foreign-key violation.
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new AppError("Selected category does not exist", 400);
    }

    const existing = await prisma.product.findUnique({
      where: { sku: parsed.data.sku },
    });
    if (existing) {
      throw new AppError("Product with this SKU already exists", 409);
    }

    try {
      const product = await prisma.product.create({
        data: parsed.data,
        include: { category: { select: { name: true } } },
      });
      return NextResponse.json({ product }, { status: 201 });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new AppError("Product with this SKU already exists", 409);
      }
      throw e;
    }
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/products - update product
export async function PUT(req: NextRequest) {
  try {
    const auth = await requirePagePermission(req, "products");
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      throw new AppError("Product ID is required", 400);
    }

    const parsed = updateProductSchema.safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
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
    const auth = await requirePagePermission(req, "products");
    if (auth instanceof NextResponse) return auth;

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
