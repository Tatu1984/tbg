"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/frontend/hooks/useAuth";
import { apiClient } from "@/frontend/api/client";

interface DashboardData {
  todaySales: { revenue: number; count: number; revenueChange: number };
  yesterdaySales: { count: number };
  totalInvoices: number;
  onlineOrders: number;
  recentInvoices: {
    id: string;
    invoiceNumber: string;
    totalAmount: string;
    paymentMethod: string;
    createdAt: string;
    user: { name: string };
  }[];
  lowStockProducts: {
    id: string;
    name: string;
    stock: number;
    reorderLevel: number;
  }[];
  topProducts: { name: string; sold: number; revenue: number }[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    async function load() {
      try {
        const { data: d } = await apiClient.get("/dashboard");
        setData(d);
      } catch {
        // apiClient handles 401 redirect
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  const invoiceCountChange = data.todaySales.count - data.yesterdaySales.count;

  const stats = [
    {
      title: "Today's Sales",
      value: `\u20B9${data.todaySales.revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      change: `${data.todaySales.revenueChange >= 0 ? "+" : ""}${data.todaySales.revenueChange}%`,
      up: data.todaySales.revenueChange >= 0,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Today's Invoices",
      value: String(data.todaySales.count),
      change: `${invoiceCountChange >= 0 ? "+" : ""}${invoiceCountChange}`,
      up: invoiceCountChange >= 0,
      icon: Receipt,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Low Stock Items",
      value: String(data.lowStockProducts.length),
      change: data.lowStockProducts.filter((p) => p.stock === 0).length > 0
        ? `${data.lowStockProducts.filter((p) => p.stock === 0).length} out`
        : "OK",
      up: data.lowStockProducts.length === 0,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      title: "Online Orders",
      value: String(data.onlineOrders),
      change: "Total",
      up: true,
      icon: ShoppingCart,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <motion.div key={stat.title} variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                    >
                      <StatIcon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {stat.up ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stat.up ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs yesterday
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent invoices */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Invoices</CardTitle>
                <CardDescription>Latest billing activity</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {data.totalInvoices} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No invoices yet. Create one from POS.
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.user.name} &middot; {timeAgo(inv.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {"\u20B9"}{Number(inv.totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </p>
                      <Badge variant="outline" className="text-[10px] font-normal capitalize">
                        {inv.paymentMethod.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Top Products</CardTitle>
                <CardDescription>Best sellers by revenue</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No sales data yet.
              </p>
            ) : (
              <div className="space-y-3">
                {data.topProducts.map((prod, i) => (
                  <div
                    key={prod.name}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono w-5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[160px]">
                          {prod.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prod.sold} sold
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600">
                      {"\u20B9"}{prod.revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low stock alerts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              All products are well-stocked.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border p-3 bg-amber-500/5 border-amber-500/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Package className="h-4 w-4 text-amber-600" />
                    <Badge
                      variant={p.stock === 0 ? "destructive" : "outline"}
                      className="text-[10px]"
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Reorder level: {p.reorderLevel}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
