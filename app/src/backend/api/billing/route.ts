import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { createInvoiceSchema } from "@/backend/validators/billing.validator";
import { authenticateRequest } from "@/backend/api/middleware";
import { requirePagePermission } from "@/backend/auth/permissions";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

// GET /api/billing - list invoices with search, filters, pagination
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;
    const search = searchParams.get("search") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    // Build where clause
    const where: Record<string, unknown> = {};

    // Payment method filter
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        createdAt.lte = end;
      }
      where.createdAt = createdAt;
    }

    // Search across invoice number, customer name, customer phone, product names
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        {
          items: {
            some: {
              product: { name: { contains: search, mode: "insensitive" } },
            },
          },
        },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          user: { select: { name: true } },
          items: {
            include: { product: { select: { name: true, sku: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({ invoices, total });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/billing - create invoice
export async function POST(req: NextRequest) {
  try {
    const auth = await requirePagePermission(req, "pos");
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { items, paymentMethod, paymentDetail, discount, customerName, customerPhone } = parsed.data;

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
      const price = Number(product.sellingPrice);
      const gstPct = Number(product.gstPercentage);
      const lineTotal = price * item.quantity;
      const lineDiscount = item.discount || 0;
      const taxableAmount = lineTotal - lineDiscount;
      const gst = (taxableAmount * gstPct) / 100;

      subtotal += taxableAmount;
      totalGst += gst;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: price,
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
          customerName: customerName || null,
          customerPhone: customerPhone || null,
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

// DELETE /api/billing?id=... - delete an invoice and restore stock
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requirePagePermission(req, "invoices");
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      throw new AppError("Invoice ID is required", 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    // Restore stock and delete in one transaction
    await prisma.$transaction(async (tx) => {
      for (const item of invoice.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            userId: auth.user.id as string,
            type: "Return",
            quantity: item.quantity,
            notes: `Deleted invoice ${invoice.invoiceNumber}`,
          },
        });
      }
      // Cascade deletes InvoiceItems automatically
      await tx.invoice.delete({ where: { id } });
    });

    return NextResponse.json({ message: "Invoice deleted and stock restored" });
  } catch (error) {
    return handleError(error);
  }
}
