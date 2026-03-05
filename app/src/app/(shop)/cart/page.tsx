"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCustomerStore, type CartItem } from "@/frontend/store/customerStore";

export default function CartPage() {
  const { token, customer, hydrateCustomer } = useCustomerStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrateCustomer();
  }, [hydrateCustomer]);

  useEffect(() => {
    if (token) fetchCart();
    else setLoading(false);
  }, [token]);

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

  async function updateQty(productId: string, quantity: number) {
    if (quantity < 1) {
      return removeItem(productId);
    }
    try {
      const res = await fetch("/api/shop/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch {
      toast.error("Failed to update quantity");
    }
  }

  async function removeItem(productId: string) {
    try {
      await fetch(`/api/shop/cart?productId=${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
      toast("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 text-center py-20">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Sign in to view your cart</h2>
        <p className="text-muted-foreground mb-6">Create an account or sign in to start shopping.</p>
        <Link href="/register">
          <Button className="gap-2 bg-brand hover:bg-brand/90 text-brand-foreground">
            Create Account
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );
  const savings = cartItems.reduce(
    (sum, item) => sum + (item.product.mrp - item.product.sellingPrice) * item.quantity,
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
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <span className="text-2xl font-bold text-muted-foreground/20">
                        {(item.product.brand || item.product.name).charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.product.brand}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeItem(item.product.id)}
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
                            onClick={() => updateQty(item.product.id, item.quantity - 1)}
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
                            onClick={() => updateQty(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            &#8377;{(item.product.sellingPrice * item.quantity).toLocaleString("en-IN")}
                          </p>
                          {item.product.mrp > item.product.sellingPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              &#8377;{(item.product.mrp * item.quantity).toLocaleString("en-IN")}
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

          <div>
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({cartItems.length} items)
                    </span>
                    <span>&#8377;{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Savings</span>
                      <span>-&#8377;{savings.toLocaleString("en-IN")}</span>
                    </div>
                  )}
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
