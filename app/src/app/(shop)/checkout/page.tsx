"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Smartphone, ShieldCheck, Lock, Loader2, Banknote, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCustomerStore, type CartItem } from "@/frontend/store/customerStore";
import {
  getPaymentGateways,
  type PaymentGateway,
} from "@/config/payment-gateways";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
];

const GATEWAY_ICONS: Record<string, typeof CreditCard> = {
  razorpay: Wallet,
  phonepe: Smartphone,
  cashfree: Wallet,
  payu: CreditCard,
  stripe: CreditCard,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { token, customer, hydrateCustomer } = useCustomerStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [enabledGateways, setEnabledGateways] = useState<PaymentGateway[]>([]);

  const [address, setAddress] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [phone, setPhone] = useState("");

  useEffect(() => {
    hydrateCustomer();
    // Load enabled payment gateways
    const config = getPaymentGateways();
    setEnabledGateways(config.gateways.filter((g) => g.enabled));
  }, [hydrateCustomer]);

  useEffect(() => {
    if (token) fetchCart();
    else {
      setLoading(false);
      router.push("/register");
    }
  }, [token, router]);

  async function fetchCart() {
    try {
      const res = await fetch("/api/shop/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );
  const gst = Math.round(subtotal * 0.18);
  const shipping = subtotal >= 2000 ? 0 : 99;
  const total = subtotal + shipping;

  async function handlePlaceOrder() {
    if (!address.line1 || !address.city || !address.state || !address.pincode) {
      toast.error("Please fill in all address fields");
      return;
    }

    setPlacing(true);
    try {
      // Step 1: Create the order
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          paymentMethod: paymentMethod === "cod" ? "cod" : "online",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }

      const data = await res.json();

      // Step 2: If online payment, initiate payment via gateway
      if (paymentMethod !== "cod") {
        const payRes = await fetch("/api/shop/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: data.order.id,
            amount: total,
            gatewayId: paymentMethod,
            customerEmail: customer?.email || "",
            customerPhone: phone,
          }),
        });

        if (!payRes.ok) {
          // Order created but payment initiation failed — user can retry payment
          toast.error("Order placed but payment initiation failed. You can pay later from My Orders.");
          router.push("/my-orders");
          return;
        }

        const payData = await payRes.json();

        // If the gateway returns a checkout URL, redirect there
        if (payData.checkoutUrl) {
          window.location.href = payData.checkoutUrl;
          return;
        }

        // Otherwise (for gateways that open a modal like Razorpay),
        // the frontend SDK integration would go here.
        // For now, treat as successful order placement.
        toast.success(`Order ${data.order.orderNumber} placed! Payment via ${paymentMethod} is being processed.`);
      } else {
        toast.success(`Order ${data.order.orderNumber} placed successfully!`);
      }

      router.push("/my-orders");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Build payment method options: COD is always available, plus any enabled gateways
  const paymentOptions = [
    { value: "cod", icon: Banknote, label: "Cash on Delivery", description: "Pay when you receive" },
    ...enabledGateways.map((gw) => ({
      value: gw.id,
      icon: GATEWAY_ICONS[gw.id] || Wallet,
      label: gw.name,
      description: gw.description,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Address Line 1 *</Label>
                <Input
                  placeholder="123 Main Street"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input
                  placeholder="Apt, Suite, etc. (optional)"
                  value={address.line2}
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    placeholder="Kolkata"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select
                    value={address.state}
                    onValueChange={(val) => setAddress({ ...address, state: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pincode *</Label>
                  <Input
                    placeholder="700001"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn(
                "grid gap-3",
                paymentOptions.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"
              )}>
                {paymentOptions.map((pm) => {
                  const PmIcon = pm.icon;
                  return (
                    <button
                      key={pm.value}
                      type="button"
                      onClick={() => setPaymentMethod(pm.value)}
                      className={cn(
                        "flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left",
                        paymentMethod === pm.value
                          ? "border-brand bg-brand/5"
                          : "border-border hover:border-foreground/20"
                      )}
                    >
                      <PmIcon
                        className={cn(
                          "h-5 w-5",
                          paymentMethod === pm.value
                            ? "text-brand"
                            : "text-muted-foreground"
                        )}
                      />
                      <div>
                        <span className="text-sm font-medium block">{pm.label}</span>
                        {pm.description && (
                          <span className="text-[10px] text-muted-foreground">{pm.description}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {enabledGateways.length === 0 && paymentMethod !== "cod" && (
                <p className="text-xs text-muted-foreground">
                  Online payment gateways can be configured in Settings.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name}{" "}
                      {item.quantity > 1 && `x${item.quantity}`}
                    </span>
                    <span>&#8377;{(item.product.sellingPrice * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>&#8377;{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600">Free</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (incl.)</span>
                  <span>&#8377;{gst.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">&#8377;{total.toLocaleString("en-IN")}</span>
              </div>

              <Button
                className="w-full h-12 gap-2 bg-brand hover:bg-brand/90 text-brand-foreground text-base"
                onClick={handlePlaceOrder}
                disabled={placing || cartItems.length === 0}
              >
                {placing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {placing
                  ? "Placing Order..."
                  : paymentMethod === "cod"
                    ? `Place Order - ₹${total.toLocaleString("en-IN")}`
                    : `Pay ₹${total.toLocaleString("en-IN")}`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure checkout
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
