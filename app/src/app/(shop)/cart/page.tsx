"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { toast } from "sonner";

const initialCart = [
  { id: 1, name: "MT Thunder 3 Helmet - Black M", brand: "MT", price: 5500, mrp: 6200, quantity: 1 },
  { id: 3, name: "Rynox Storm Evo Jacket - L", brand: "Rynox", price: 5990, mrp: 6490, quantity: 1 },
  { id: 7, name: "Quad Lock Phone Mount", brand: "Quad Lock", price: 3200, mrp: 3500, quantity: 2 },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCart);
  const [coupon, setCoupon] = useState("");

  function updateQty(id: number, delta: number) {
    setCartItems(
      cartItems
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as typeof initialCart
    );
  }

  function removeItem(id: number) {
    setCartItems(cartItems.filter((item) => item.id !== id));
    toast("Item removed from cart");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const savings = cartItems.reduce(
    (sum, item) => sum + (item.mrp - item.price) * item.quantity,
    0
  );
  const shipping = subtotal > 2000 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link href="/shop">
            <Button className="gap-2 bg-brand hover:bg-brand/90 text-brand-foreground">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image placeholder */}
                    <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <span className="text-2xl font-bold text-muted-foreground/20">
                        {item.brand.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.brand}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-end justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQty(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQty(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            &#8377;
                            {(item.price * item.quantity).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                          {item.mrp > item.price && (
                            <p className="text-xs text-muted-foreground line-through">
                              &#8377;
                              {(item.mrp * item.quantity).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Coupon code"
                      className="pl-9"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    Apply
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({cartItems.length} items)
                    </span>
                    <span>
                      &#8377;{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Savings</span>
                    <span>
                      -&#8377;{savings.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">
                    &#8377;{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full gap-2 bg-brand hover:bg-brand/90 text-brand-foreground mt-2">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/shop">
                  <Button variant="ghost" className="w-full text-sm">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
