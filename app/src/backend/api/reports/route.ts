import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { authorizeRoles } from "@/backend/api/middleware";
import { handleError } from "@/backend/utils/error-handler.util";

export async function GET(req: NextRequest) {
  try {
    const auth = await authorizeRoles("owner", "manager")(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "summary";

    if (type === "summary") {
      const [totalProducts, totalInvoices, totalOrders, lowStockProducts] =
        await Promise.all([
          prisma.product.count({ where: { active: true } }),
          prisma.invoice.count(),
          prisma.order.count(),
          prisma.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(*)::bigint as count FROM "Product"
            WHERE active = true AND stock <= "reorderLevel"
          `.then((r) => Number(r[0]?.count ?? 0)).catch(() => 0),
        ]);

      const revenueResult = await prisma.invoice.aggregate({
        _sum: { totalAmount: true },
      });

      return NextResponse.json({
        report: {
          totalProducts,
          totalInvoices,
          totalOrders,
          lowStockProducts,
          totalRevenue: revenueResult._sum.totalAmount || 0,
        },
      });
    }

    if (type === "low-stock") {
      const products = await prisma.product.findMany({
        where: { active: true },
        include: { category: { select: { name: true } } },
        orderBy: { stock: "asc" },
        take: 50,
      });

      const lowStock = products.filter((p) => p.stock <= p.reorderLevel);
      return NextResponse.json({ products: lowStock });
    }

    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  } catch (error) {
    return handleError(error);
  }
}
