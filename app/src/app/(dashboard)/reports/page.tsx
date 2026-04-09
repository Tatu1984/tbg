"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/frontend/api/client";

interface SalesReport {
  weekly: { day: string; amount: number }[];
  kpis: {
    weekTotal: number;
    monthTotal: number;
    monthChange: number;
    avgBill: number;
    avgBillChange: number;
    totalInvoices: number;
    countChange: number;
  };
}

interface CategoryReport {
  breakdown: { name: string; revenue: number; percentage: number }[];
  total: number;
}

interface InventoryReport {
  totalProducts: number;
  totalStockValue: number;
  lowOrOutOfStock: number;
}

interface ProfitReport {
  grossRevenue: number;
  totalCost: number;
  netProfit: number;
  margin: number;
}

const CATEGORY_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-gray-400",
];

function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}

function fmtChange(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [category, setCategory] = useState<CategoryReport | null>(null);
  const [inventory, setInventory] = useState<InventoryReport | null>(null);
  const [profit, setProfit] = useState<ProfitReport | null>(null);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [s, c, i, p] = await Promise.all([
          apiClient.get<SalesReport>("/reports", { params: { type: "sales" } }),
          apiClient.get<CategoryReport>("/reports", {
            params: { type: "category-breakdown" },
          }),
          apiClient.get<InventoryReport>("/reports", {
            params: { type: "inventory" },
          }),
          apiClient.get<ProfitReport>("/reports", { params: { type: "profit" } }),
        ]);
        setSales(s.data);
        setCategory(c.data);
        setInventory(i.data);
        setProfit(p.data);
      } catch {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const maxSale =
    sales && sales.weekly.length > 0
      ? Math.max(...sales.weekly.map((d) => d.amount), 1)
      : 1;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Sales analytics, inventory insights & profit analysis
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin inline mr-2" />
            Loading reports...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Sales analytics, inventory insights & profit analysis
        </p>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <PieChart className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="profit" className="gap-2">
            <IndianRupee className="h-4 w-4" />
            Profit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "This Week",
                value: fmt(sales?.kpis.weekTotal ?? 0),
                change: "",
                up: true,
              },
              {
                label: "This Month",
                value: fmt(sales?.kpis.monthTotal ?? 0),
                change: fmtChange(sales?.kpis.monthChange ?? 0),
                up: (sales?.kpis.monthChange ?? 0) >= 0,
              },
              {
                label: "Avg. Bill Value",
                value: fmt(sales?.kpis.avgBill ?? 0),
                change: fmtChange(sales?.kpis.avgBillChange ?? 0),
                up: (sales?.kpis.avgBillChange ?? 0) >= 0,
              },
              {
                label: "Total Invoices",
                value: String(sales?.kpis.totalInvoices ?? 0),
                change: fmtChange(sales?.kpis.countChange ?? 0),
                up: (sales?.kpis.countChange ?? 0) >= 0,
              },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold">
                    {kpi.label === "Total Invoices" ? "" : "₹"}
                    {kpi.value}
                  </p>
                  {kpi.change && (
                    <div className="flex items-center gap-1 mt-1">
                      {kpi.up ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          kpi.up ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {kpi.change}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart + category */}
          <div className="grid lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Weekly Sales</CardTitle>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    Last 7 Days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-48">
                  {(sales?.weekly ?? []).map((d, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <span className="text-[10px] text-muted-foreground">
                        ₹{(d.amount / 1000).toFixed(1)}k
                      </span>
                      <div
                        className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors"
                        style={{
                          height: `${Math.max((d.amount / maxSale) * 140, 2)}px`,
                        }}
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {d.day}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">By Category</CardTitle>
                <CardDescription>Revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(category?.breakdown ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sales yet.</p>
                ) : (
                  (category?.breakdown ?? []).map((cat, idx) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {cat.percentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                          }`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8">
                {[
                  {
                    label: "Total Products",
                    value: String(inventory?.totalProducts ?? 0),
                  },
                  {
                    label: "Total Stock Value",
                    value: `₹${fmt(inventory?.totalStockValue ?? 0)}`,
                  },
                  {
                    label: "Low/Out of Stock",
                    value: String(inventory?.lowOrOutOfStock ?? 0),
                  },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-3xl font-bold">{s.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profit Overview</CardTitle>
              <CardDescription>
                Margin: {(profit?.margin ?? 0).toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8">
                {[
                  {
                    label: "Gross Revenue",
                    value: `₹${fmt(profit?.grossRevenue ?? 0)}`,
                  },
                  {
                    label: "Total Cost",
                    value: `₹${fmt(profit?.totalCost ?? 0)}`,
                  },
                  {
                    label: "Net Profit",
                    value: `₹${fmt(profit?.netProfit ?? 0)}`,
                  },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-3xl font-bold">{s.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
