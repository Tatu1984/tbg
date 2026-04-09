import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/backend/database/client";
import { authenticateRequest } from "@/backend/api/middleware";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
});

const updateSupplierSchema = supplierSchema.partial();

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ suppliers });
  } catch (error) {
    return handleError(error);
  }
}

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
    const parsed = supplierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({ data: parsed.data });
    return NextResponse.json({ supplier }, { status: 201 });
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

    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) throw new AppError("Supplier ID is required", 400);

    const parsed = updateSupplierSchema.safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const supplier = await prisma.supplier.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ supplier });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/suppliers?id=... - delete supplier (only if no purchases)
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
    if (!id) throw new AppError("Supplier ID is required", 400);

    const purchaseCount = await prisma.purchase.count({ where: { supplierId: id } });
    if (purchaseCount > 0) {
      throw new AppError(
        `Cannot delete supplier with ${purchaseCount} purchase orders`,
        409
      );
    }

    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ message: "Supplier deleted" });
  } catch (error) {
    return handleError(error);
  }
}
