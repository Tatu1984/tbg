"use client";

import { useState } from "react";
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
import { CreditCard, Smartphone, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("upi");

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input placeholder="123 Main Street" />
              </div>
              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input placeholder="Apt, Suite, etc. (optional)" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="Bangalore" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ka">Karnataka</SelectItem>
                      <SelectItem value="mh">Maharashtra</SelectItem>
                      <SelectItem value="tn">Tamil Nadu</SelectItem>
                      <SelectItem value="dl">Delhi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input placeholder="560001" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+91 98765 43210" />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "upi", icon: Smartphone, label: "UPI" },
                  { value: "card", icon: CreditCard, label: "Card" },
                ].map((pm) => {
                  const PmIcon = pm.icon;
                  return (
                    <button
                      key={pm.value}
                      type="button"
                      onClick={() => setPaymentMethod(pm.value)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border transition-all",
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
                      <span className="text-sm font-medium">{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry</Label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input placeholder="123" type="password" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="space-y-2 pt-2">
                  <Label>UPI ID</Label>
                  <Input placeholder="yourname@upi" />
                </div>
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
                {[
                  { name: "MT Thunder 3 Helmet", qty: 1, price: 5500 },
                  { name: "Rynox Storm Evo Jacket", qty: 1, price: 5990 },
                  { name: "Quad Lock Phone Mount", qty: 2, price: 6400 },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.name}{" "}
                      {item.qty > 1 && `x${item.qty}`}
                    </span>
                    <span>&#8377;{item.price.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>&#8377;17,890</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (incl.)</span>
                  <span>&#8377;2,736</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">&#8377;17,890</span>
              </div>

              <Button className="w-full h-12 gap-2 bg-brand hover:bg-brand/90 text-brand-foreground text-base">
                <Lock className="h-4 w-4" />
                Pay &#8377;17,890
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure checkout powered by Razorpay
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
