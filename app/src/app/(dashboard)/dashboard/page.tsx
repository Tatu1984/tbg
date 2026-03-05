"use client";

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
} from "lucide-react";

const stats = [
  {
    title: "Today's Sales",
    value: "12,450",
    change: "+12%",
    up: true,
    icon: IndianRupee,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Invoices",
    value: "18",
    change: "+3",
    up: true,
    icon: Receipt,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    title: "Low Stock Items",
    value: "7",
    change: "+2",
    up: false,
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    title: "Online Orders",
    value: "4",
    change: "New",
    up: true,
    icon: ShoppingCart,
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
];

const topProducts = [
  { name: "MT Thunder 3 Helmet", sold: 12, revenue: 66000 },
  { name: "Rynox Storm Evo Jacket", sold: 8, revenue: 47920 },
  { name: "Rynox Air GT Gloves", sold: 15, revenue: 22350 },
  { name: "Royal Enfield Saddle Bag", sold: 6, revenue: 17940 },
  { name: "Cramster Blaster Boots", sold: 5, revenue: 14950 },
];

const recentInvoices = [
  { id: "INV-1042", customer: "Walk-in", total: 6200, method: "UPI", time: "2 min ago" },
  { id: "INV-1041", customer: "Walk-in", total: 12890, method: "Cash", time: "18 min ago" },
  { id: "INV-1040", customer: "Walk-in", total: 3490, method: "Card", time: "45 min ago" },
  { id: "INV-1039", customer: "Online", total: 8750, method: "Razorpay", time: "1h ago" },
  { id: "INV-1038", customer: "Walk-in", total: 1299, method: "Cash", time: "2h ago" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
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
                        {stat.title === "Today's Sales" && (
                          <span className="text-xl">&#8377;</span>
                        )}
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
                Today
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{inv.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.customer} &middot; {inv.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      &#8377;{inv.total.toLocaleString("en-IN")}
                    </p>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {inv.method}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Top Products</CardTitle>
                <CardDescription>Best sellers this month</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((prod, i) => (
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
                    &#8377;{prod.revenue.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: "Rynox Air GT Gloves", stock: 2, threshold: 5 },
              { name: "LS2 FF800 Helmet", stock: 1, threshold: 3 },
              { name: "Cramster Tank Bag", stock: 3, threshold: 5 },
              { name: "AGV K3 SV Helmet", stock: 0, threshold: 3 },
            ].map((p) => (
              <div
                key={p.name}
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
                  Reorder level: {p.threshold}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
