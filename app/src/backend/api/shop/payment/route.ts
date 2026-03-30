import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/backend/database/client";
import { authenticateRequest } from "@/backend/api/middleware";
import { handleError, AppError } from "@/backend/utils/error-handler.util";

const initiatePaymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  gatewayId: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});

async function getCustomerId(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if ("error" in auth) return null;
  if (auth.user.role !== "customer") return null;
  return auth.user.id as string;
}

// GET /api/shop/payment?orderId=xxx — Check payment status
export async function GET(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify the order belongs to this customer
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
      select: { id: true, status: true, paymentMethod: true },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // TODO: Query actual payment status from the gateway
    // For now, return mock status based on order state
    const paymentStatus =
      order.status === "confirmed" || order.status === "processing"
        ? "success"
        : order.status === "cancelled"
          ? "failed"
          : "pending";

    return NextResponse.json({
      orderId: order.id,
      status: paymentStatus as "pending" | "success" | "failed",
      gatewayId: order.paymentMethod === "cod" ? null : order.paymentMethod,
      transactionId: null, // TODO: Store and return actual transaction ID from gateway
    });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/shop/payment — Initiate a payment
export async function POST(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = initiatePaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { orderId, amount, gatewayId, customerEmail, customerPhone } = parsed.data;

    // Verify the order belongs to this customer
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // COD doesn't need a payment gateway
    if (gatewayId === "cod") {
      return NextResponse.json({
        paymentId: `cod_${orderId}`,
        gatewayOrderId: null,
        gatewayId: "cod",
        status: "success",
        checkoutUrl: null,
      });
    }

    // Generate a mock payment ID
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // TODO: Razorpay — const instance = new Razorpay({ key_id, key_secret }); const order = await instance.orders.create({...})
    // TODO: PhonePe — call PhonePe Payment API
    // TODO: Cashfree — call Cashfree Order API
    // TODO: PayU — generate hash and redirect URL
    // TODO: Stripe — const session = await stripe.checkout.sessions.create({...})

    // Mock response — replace with actual gateway integration
    return NextResponse.json({
      paymentId,
      gatewayOrderId: `gw_${paymentId}`,
      gatewayId,
      status: "pending",
      checkoutUrl: null, // Gateway-specific checkout/redirect URL goes here
      // Gateway-specific data the frontend may need:
      // razorpay: { key, orderId, amount, currency, name, prefill }
      // phonepe: { redirectUrl, transactionId }
      // cashfree: { paymentSessionId, orderToken }
      // payu: { hash, txnid, redirectUrl }
      // stripe: { sessionId, publishableKey }
    });
  } catch (error) {
    return handleError(error);
  }
}
