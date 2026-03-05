"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Package, ChevronRight } from "lucide-react";

const orders = [
  {
    id: "ORD-2041",
    date: "05 Mar 2026",
    total: 17890,
    status: "confirmed",
    items: [
      { name: "MT Thunder 3 Helmet", qty: 1, price: 5500 },
      { name: "Rynox Storm Evo Jacket", qty: 1, price: 5990 },
      { name: "Quad Lock Phone Mount", qty: 2, price: 6400 },
    ],
  },
  {
    id: "ORD-2035",
    date: "28 Feb 2026",
    total: 2990,
    status: "delivered",
    items: [{ name: "Cramster Blaster Boots", qty: 1, price: 2990 }],
  },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-500/10 text-blue-700",
  shipped: "bg-amber-500/10 text-amber-700",
  delivered: "bg-emerald-500/10 text-emerald-700",
  cancelled: "bg-red-500/10 text-red-700",
};

export default function CustomerOrdersPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground">
            Your order history will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">
                      {order.id}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {order.date}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.name}
                        {item.qty > 1 && ` x${item.qty}`}
                      </span>
                      <span className="font-medium">
                        &#8377;{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold">
                    &#8377;{order.total.toLocaleString("en-IN")}
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
