import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { authenticateRequest } from "@/backend/api/middleware";
import { handleError } from "@/backend/utils/error-handler.util";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const role = auth.user.role as string;
    if (!["owner", "manager"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Order ID and status required" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ order });
  } catch (error) {
    return handleError(error);
  }
}
