import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { handleError } from "@/backend/utils/error-handler.util";

// GET /api/shop/products - public product listing (no auth required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, unknown> = {
      active: true,
      stock: { gt: 0 },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All") {
      where.category = { name: category };
    }

    let orderBy: Record<string, string>;
    switch (sort) {
      case "price-low":
        orderBy = { sellingPrice: "asc" };
        break;
      case "price-high":
        orderBy = { sellingPrice: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy,
    });

    return NextResponse.json({ products });
  } catch (error) {
    return handleError(error);
  }
}
