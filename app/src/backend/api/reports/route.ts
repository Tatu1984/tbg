import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { requirePagePermission } from "@/backend/auth/permissions";
import { handleError } from "@/backend/utils/error-handler.util";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePagePermission(req, "reports");
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

    if (type === "sales") {
      // Weekly sales (last 7 days), monthly totals, KPIs
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const sevenDaysAgo = new Date(startOfToday);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // include today => 7 buckets

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [weekInvoices, monthAgg, prevMonthAgg, allTimeCount] = await Promise.all([
        prisma.invoice.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { totalAmount: true, createdAt: true },
        }),
        prisma.invoice.aggregate({
          where: { createdAt: { gte: startOfMonth } },
          _sum: { totalAmount: true },
          _count: true,
        }),
        prisma.invoice.aggregate({
          where: { createdAt: { gte: startOfPrevMonth, lt: startOfMonth } },
          _sum: { totalAmount: true },
          _count: true,
        }),
        prisma.invoice.count(),
      ]);

      // Build day buckets
      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const buckets: { day: string; date: string; amount: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        buckets.push({
          day: dayLabels[d.getDay()],
          date: d.toISOString().slice(0, 10),
          amount: 0,
        });
      }
      for (const inv of weekInvoices) {
        const key = new Date(inv.createdAt).toISOString().slice(0, 10);
        const b = buckets.find((x) => x.date === key);
        if (b) b.amount += Number(inv.totalAmount);
      }

      const weekTotal = buckets.reduce((s, b) => s + b.amount, 0);
      const monthTotal = Number(monthAgg._sum.totalAmount || 0);
      const monthCount = monthAgg._count;
      const prevMonthTotal = Number(prevMonthAgg._sum.totalAmount || 0);
      const prevMonthCount = prevMonthAgg._count;

      const monthChange =
        prevMonthTotal > 0
          ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100
          : monthTotal > 0
          ? 100
          : 0;
      const countChange =
        prevMonthCount > 0
          ? ((monthCount - prevMonthCount) / prevMonthCount) * 100
          : monthCount > 0
          ? 100
          : 0;
      const avgBill = monthCount > 0 ? monthTotal / monthCount : 0;
      const prevAvgBill = prevMonthCount > 0 ? prevMonthTotal / prevMonthCount : 0;
      const avgBillChange =
        prevAvgBill > 0
          ? ((avgBill - prevAvgBill) / prevAvgBill) * 100
          : avgBill > 0
          ? 100
          : 0;

      return NextResponse.json({
        weekly: buckets.map((b) => ({ day: b.day, amount: b.amount })),
        kpis: {
          weekTotal,
          monthTotal,
          monthChange,
          avgBill,
          avgBillChange,
          totalInvoices: allTimeCount,
          countChange,
        },
      });
    }

    if (type === "category-breakdown") {
      // Aggregate in the database; the previous implementation loaded
      // every InvoiceItem into JS, which OOMs at scale.
      const rows = await prisma.$queryRaw<
        { name: string | null; revenue: string | number }[]
      >`
        SELECT c."name" AS name, SUM(ii."totalPrice")::numeric AS revenue
        FROM "InvoiceItem" ii
        JOIN "Product" p ON p."id" = ii."productId"
        LEFT JOIN "Category" c ON c."id" = p."categoryId"
        GROUP BY c."name"
        ORDER BY revenue DESC
      `;

      const total = rows.reduce((s, r) => s + Number(r.revenue || 0), 0);
      const breakdown = rows.map((r) => {
        const revenue = Number(r.revenue || 0);
        return {
          name: r.name || "Uncategorized",
          revenue,
          percentage: total > 0 ? Math.round((revenue / total) * 100) : 0,
        };
      });

      return NextResponse.json({ breakdown, total });
    }

    if (type === "inventory") {
      const products = await prisma.product.findMany({
        where: { active: true },
        select: {
          stock: true,
          costPrice: true,
          reorderLevel: true,
        },
      });
      const totalProducts = products.length;
      const totalStockValue = products.reduce(
        (sum, p) => sum + Number(p.costPrice) * p.stock,
        0
      );
      const lowOrOut = products.filter((p) => p.stock <= p.reorderLevel).length;

      return NextResponse.json({
        totalProducts,
        totalStockValue,
        lowOrOutOfStock: lowOrOut,
      });
    }

    if (type === "profit") {
      // Aggregate revenue and cost in the database. Snapshotting cost
      // at the time of sale would be more accurate, but the schema
      // doesn't store that — using current costPrice is the best we
      // can do without changing the model.
      const rows = await prisma.$queryRaw<
        { revenue: string | number | null; cost: string | number | null }[]
      >`
        SELECT
          SUM(ii."totalPrice")::numeric AS revenue,
          SUM(ii."quantity" * p."costPrice")::numeric AS cost
        FROM "InvoiceItem" ii
        JOIN "Product" p ON p."id" = ii."productId"
      `;

      const revenue = Number(rows[0]?.revenue || 0);
      const cost = Number(rows[0]?.cost || 0);
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return NextResponse.json({
        grossRevenue: revenue,
        totalCost: cost,
        netProfit: profit,
        margin,
      });
    }

    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  } catch (error) {
    return handleError(error);
  }
}
