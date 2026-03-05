import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { createInvoiceSchema } from "@/backend/validators/billing.validator";
import { authenticateRequest } from "@/backend/api/middleware";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

// GET /api/billing - list invoices
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;

    const invoices = await prisma.invoice.findMany({
      include: {
        user: { select: { name: true } },
        items: {
          include: { product: { select: { name: true, sku: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/billing - create invoice
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const role = auth.user.role as string;
    if (!["owner", "manager", "cashier"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { items, paymentMethod, paymentDetail, discount } = parsed.data;

    // Fetch products and calculate totals
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new AppError("One or more products not found", 404);
    }

    let subtotal = 0;
    let totalGst = 0;
    const invoiceItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const lineTotal = product.sellingPrice * item.quantity;
      const lineDiscount = item.discount || 0;
      const taxableAmount = lineTotal - lineDiscount;
      const gst = (taxableAmount * product.gstPercentage) / 100;

      subtotal += taxableAmount;
      totalGst += gst;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        gstAmount: gst,
        discount: lineDiscount,
        totalPrice: taxableAmount + gst,
      };
    });

    const totalAmount = subtotal + totalGst - discount;

    // Generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `TBG-${String(count + 1).padStart(5, "0")}`;

    // Create invoice with items and update stock in one transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          userId: auth.user.id as string,
          subtotal,
          gstAmount: totalGst,
          discount,
          totalAmount,
          paymentMethod,
          paymentDetail,
          items: { create: invoiceItems },
        },
        include: {
          items: { include: { product: { select: { name: true, sku: true } } } },
          user: { select: { name: true } },
        },
      });

      // Decrement stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        // Record stock transaction
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            userId: auth.user.id as string,
            type: "Sale",
            quantity: -item.quantity,
            notes: `Invoice ${invoiceNumber}`,
          },
        });
      }

      return inv;
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
