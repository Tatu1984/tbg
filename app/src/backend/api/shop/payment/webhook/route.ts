import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/database/client";
import { handleError } from "@/backend/utils/error-handler.util";

// POST /api/shop/payment/webhook — Receive payment callbacks from gateways
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const gatewayId = req.headers.get("x-gateway-id") ?? detectGateway(req);

    // TODO: Razorpay signature verification
    // const shasum = crypto.createHmac("sha256", webhookSecret);
    // shasum.update(rawBody);
    // const expectedSignature = shasum.digest("hex");
    // const razorpaySignature = req.headers.get("x-razorpay-signature");
    // if (expectedSignature !== razorpaySignature) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    // TODO: PhonePe signature verification
    // Verify X-VERIFY header using SHA256(response + "/pg/v1/status/" + merchantId + "/" + transactionId + saltKey) + "###" + saltIndex

    // TODO: Cashfree signature verification
    // Verify using x-webhook-signature header with secretKey

    // TODO: PayU signature verification
    // Verify using reverse hash: sha512(merchantSalt|status||||||||||email|firstname|productinfo|amount|txnid|key)

    // TODO: Stripe signature verification
    // const sig = req.headers.get("stripe-signature");
    // const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    // Parse the body after verification
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // TODO: Extract order ID and payment status from gateway-specific payload
    // Each gateway sends data in a different format:
    // Razorpay: payload.payload.payment.entity.order_id, payload.event === "payment.captured"
    // PhonePe: payload.data.merchantTransactionId, payload.code === "PAYMENT_SUCCESS"
    // Cashfree: payload.data.order.order_id, payload.data.payment.payment_status === "SUCCESS"
    // PayU: payload.txnid, payload.status === "success"
    // Stripe: event.data.object.metadata.orderId, event.type === "checkout.session.completed"

    const orderId = (payload.orderId as string) ?? null;
    const paymentStatus = (payload.status as string) ?? "unknown";

    if (orderId && paymentStatus === "success") {
      // Update order status to paid
      await prisma.order.updateMany({
        where: { id: orderId },
        data: { status: "confirmed" },
      });
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json(
      { received: true, gatewayId, orderId },
      { status: 200 }
    );
  } catch (error) {
    // Log webhook errors but still return 200 to prevent retries for server errors
    console.error("Webhook processing error:", error);
    return handleError(error);
  }
}

/**
 * Detect which gateway sent the webhook based on request headers/user-agent.
 */
function detectGateway(req: NextRequest): string {
  const userAgent = req.headers.get("user-agent") ?? "";
  const signature = req.headers.get("x-razorpay-signature");
  const stripeSignature = req.headers.get("stripe-signature");
  const cashfreeSignature = req.headers.get("x-webhook-signature");
  const phonePeVerify = req.headers.get("x-verify");

  if (signature) return "razorpay";
  if (stripeSignature) return "stripe";
  if (cashfreeSignature) return "cashfree";
  if (phonePeVerify) return "phonepe";
  if (userAgent.toLowerCase().includes("payu")) return "payu";

  return "unknown";
}
