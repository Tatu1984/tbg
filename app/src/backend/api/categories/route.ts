import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/backend/database/client";
import { authenticateRequest } from "@/backend/api/middleware";
import { requirePagePermission } from "@/backend/auth/permissions";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

const DEFAULT_CATEGORIES = [
  "Helmets",
  "Riding Jackets",
  "Riding Gloves",
  "Riding Boots",
  "Bike Accessories",
  "Bike Parts",
  "Luggage & Bags",
  "Protection Gear",
];

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

// GET /api/categories - list all categories (auto-seeds defaults if empty)
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });

    // Auto-seed default categories if none exist
    if (categories.length === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((name) => ({ name })),
        skipDuplicates: true,
      });
      categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/categories - create category
export async function POST(req: NextRequest) {
  try {
    const auth = await requirePagePermission(req, "products");
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({
      where: { name: parsed.data.name },
    });
    if (existing) {
      throw new AppError("Category with this name already exists", 409);
    }

    const category = await prisma.category.create({ data: parsed.data });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/categories?id=... - delete category (only if no products)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requirePagePermission(req, "products");
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new AppError("Category ID is required", 400);

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category with ${productCount} products`,
        409
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return handleError(error);
  }
}
