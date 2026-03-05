import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { authenticateRequest } from "@/backend/api/middleware";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

async function getCustomerId(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if ("error" in auth) return null;
  if (auth.user.role !== "customer") return null;
  return auth.user.id as string;
}

// GET /api/shop/orders - list customer's orders
export async function GET(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/shop/orders - place order from cart
export async function POST(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { addressId, paymentMethod, address: newAddress } = await req.json();

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { customerId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // Verify stock
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new AppError(`${item.product.name} has insufficient stock`, 400);
      }
    }

    // Create or use address
    let finalAddressId = addressId;
    if (!finalAddressId && newAddress) {
      const addr = await prisma.address.create({
        data: { customerId, ...newAddress },
      });
      finalAddressId = addr.id;
    }
    if (!finalAddressId) {
      throw new AppError("Shipping address is required", 400);
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.sellingPrice * item.quantity,
      0
    );
    const gstAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const shippingCharge = subtotal >= 2000 ? 0 : 99;
    const totalAmount = subtotal + shippingCharge;

    // Generate order number
    const count = await prisma.order.count();
    const orderNumber = `ORD-${String(count + 1).padStart(4, "0")}`;

    // Create order with items and update stock
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        addressId: finalAddressId,
        subtotal,
        gstAmount,
        shippingCharge,
        totalAmount,
        paymentMethod: paymentMethod || "cod",
        status: "confirmed",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.sellingPrice,
            totalPrice: item.product.sellingPrice * item.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { name: true } } } },
        address: true,
      },
    });

    // Update stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { customerId } });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
