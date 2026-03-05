"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ChevronRight, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCustomerStore } from "@/frontend/store/customerStore";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-500/10 text-blue-700",
  shipped: "bg-amber-500/10 text-amber-700",
  delivered: "bg-emerald-500/10 text-emerald-700",
  cancelled: "bg-red-500/10 text-red-700",
};

export default function CustomerOrdersPage() {
  const { token, hydrateCustomer } = useCustomerStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrateCustomer();
  }, [hydrateCustomer]);

  useEffect(() => {
    if (token) fetchOrders();
    else setLoading(false);
  }, [token]);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/shop/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
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
      <div className="max-w-3xl mx-auto px-6 py-8 text-center py-20">
        <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Sign in to view your orders</h2>
        <p className="text-muted-foreground mb-6">Create an account or sign in to track your orders.</p>
        <Link href="/register">
          <Button className="gap-2 bg-brand hover:bg-brand/90 text-brand-foreground">
            Create Account
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            Your order history will appear here.
          </p>
          <Link href="/shop">
            <Button className="gap-2 bg-brand hover:bg-brand/90 text-brand-foreground">
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                        statusColors[order.status] || statusColors.confirmed
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.product.name}
                        {item.quantity > 1 && ` x${item.quantity}`}
                      </span>
                      <span className="font-medium">
                        &#8377;{item.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold">
                    &#8377;{order.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
