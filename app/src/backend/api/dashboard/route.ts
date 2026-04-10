import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { requirePagePermission } from "@/backend/auth/permissions";
import { handleError } from "@/backend/utils/error-handler.util";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePagePermission(req, "dashboard");
    if (auth instanceof NextResponse) return auth;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      todaySales,
      yesterdaySales,
      totalInvoices,
      recentInvoices,
      lowStockProducts,
      topProductItems,
      onlineOrders,
    ] = await Promise.all([
      // Today's sales
      prisma.invoice.aggregate({
        where: { createdAt: { gte: todayStart } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Yesterday's sales (for comparison)
      prisma.invoice.aggregate({
        where: {
          createdAt: {
            gte: new Date(todayStart.getTime() - 86400000),
            lt: todayStart,
          },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Total invoices
      prisma.invoice.count(),
      // Recent invoices (last 5)
      prisma.invoice.findMany({
        include: {
          user: { select: { name: true } },
          items: {
            include: { product: { select: { name: true, sku: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Low stock products (fetch low stock and filter in JS)
      prisma.product.findMany({
        where: { active: true },
        include: { category: { select: { name: true } } },
        orderBy: { stock: "asc" },
        take: 50,
      }).then(products => products.filter(p => p.stock <= p.reorderLevel).slice(0, 8)),
      // Top selling products (last 30 days)
      prisma.invoiceItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 5,
      }),
      // Online orders count
      prisma.order.count({
        where: { status: { not: "cancelled" } },
      }),
    ]);

    // Fetch product names for top products
    const topProductIds = topProductItems.map((p) => p.productId);
    const topProducts = topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true },
        })
      : [];

    const topProductsData = topProductItems.map((item) => ({
      name: topProducts.find((p) => p.id === item.productId)?.name || "Unknown",
      sold: item._sum.quantity || 0,
      revenue: Number(item._sum.totalPrice || 0),
    }));

    const todayRevenue = Number(todaySales._sum.totalAmount || 0);
    const yesterdayRevenue = Number(yesterdaySales._sum.totalAmount || 0);
    const revenueChange = yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : todayRevenue > 0 ? 100 : 0;

    return NextResponse.json({
      todaySales: {
        revenue: todayRevenue,
        count: todaySales._count,
        revenueChange,
      },
      yesterdaySales: {
        count: yesterdaySales._count,
      },
      totalInvoices,
      onlineOrders,
      recentInvoices,
      lowStockProducts,
      topProducts: topProductsData,
    });
  } catch (error) {
    return handleError(error);
  }
}
