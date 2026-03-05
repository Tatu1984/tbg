"use client";

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
} from "lucide-react";

const salesData = [
  { day: "Mon", amount: 12450 },
  { day: "Tue", amount: 18200 },
  { day: "Wed", amount: 9800 },
  { day: "Thu", amount: 22100 },
  { day: "Fri", amount: 15600 },
  { day: "Sat", amount: 28900 },
  { day: "Sun", amount: 8700 },
];
const maxSale = Math.max(...salesData.map((d) => d.amount));

const categoryBreakdown = [
  { name: "Helmets", revenue: 142000, percentage: 35, color: "bg-blue-500" },
  { name: "Riding Jackets", revenue: 89000, percentage: 22, color: "bg-emerald-500" },
  { name: "Accessories", revenue: 65000, percentage: 16, color: "bg-purple-500" },
  { name: "Gloves", revenue: 48000, percentage: 12, color: "bg-amber-500" },
  { name: "Boots", revenue: 36000, percentage: 9, color: "bg-red-500" },
  { name: "Others", revenue: 24000, percentage: 6, color: "bg-gray-400" },
];

export default function ReportsPage() {
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
              { label: "This Week", value: "1,15,750", change: "+18%", up: true },
              { label: "This Month", value: "4,04,000", change: "+12%", up: true },
              { label: "Avg. Bill Value", value: "3,480", change: "+5%", up: true },
              { label: "Total Invoices", value: "116", change: "-3%", up: false },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold">&#8377;{kpi.value}</p>
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
                    This Week
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-48">
                  {salesData.map((d) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        &#8377;{(d.amount / 1000).toFixed(1)}k
                      </span>
                      <div
                        className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors"
                        style={{
                          height: `${(d.amount / maxSale) * 140}px`,
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
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {cat.percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.color}`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
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
                  { label: "Total Products", value: "48" },
                  { label: "Total Stock Value", value: "₹12,45,000" },
                  { label: "Low/Out of Stock", value: "7" },
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8">
                {[
                  { label: "Gross Revenue", value: "₹4,04,000" },
                  { label: "Total Cost", value: "₹2,82,800" },
                  { label: "Net Profit", value: "₹1,21,200" },
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
