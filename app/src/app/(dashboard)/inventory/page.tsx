"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Warehouse,
  TrendingDown,
  TrendingUp,
  ArrowUpDown,
  Package,
} from "lucide-react";
import { useState } from "react";

const movements = [
  { id: "ST-10012", product: "MT Thunder 3 Helmet", type: "Sale", qty: -1, user: "Cashier", date: "05 Mar, 2:30 PM" },
  { id: "ST-10011", product: "Rynox Air GT Gloves", type: "Sale", qty: -2, user: "Cashier", date: "05 Mar, 1:15 PM" },
  { id: "ST-10010", product: "LS2 FF800 Helmet", type: "Purchase", qty: +5, user: "Admin", date: "05 Mar, 11:00 AM" },
  { id: "ST-10009", product: "Quad Lock Phone Mount", type: "Sale", qty: -1, user: "Cashier", date: "04 Mar, 5:45 PM" },
  { id: "ST-10008", product: "Cramster Blaster Boots", type: "Return", qty: +1, user: "Manager", date: "04 Mar, 3:20 PM" },
  { id: "ST-10007", product: "Royal Enfield Saddle Bag", type: "Cash Sale", qty: -1, user: "Cashier", date: "04 Mar, 2:00 PM" },
  { id: "ST-10006", product: "AGV K3 SV Helmet", type: "Damaged", qty: -1, user: "Admin", date: "03 Mar, 4:30 PM" },
  { id: "ST-10005", product: "Rynox Storm Evo Jacket", type: "Sale", qty: -1, user: "Cashier", date: "03 Mar, 12:00 PM" },
];

const typeColors: Record<string, string> = {
  Sale: "bg-blue-500/10 text-blue-700",
  Purchase: "bg-emerald-500/10 text-emerald-700",
  Return: "bg-amber-500/10 text-amber-700",
  "Cash Sale": "bg-purple-500/10 text-purple-700",
  Damaged: "bg-red-500/10 text-red-700",
  Adjustment: "bg-gray-500/10 text-gray-700",
};

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  const filtered = movements.filter(
    (m) =>
      m.product.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Track stock movements and manage inventory
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total SKUs", value: "48", icon: Package, color: "text-blue-600" },
          { label: "Stock In Today", value: "+5", icon: TrendingUp, color: "text-emerald-600" },
          { label: "Stock Out Today", value: "-4", icon: TrendingDown, color: "text-red-500" },
          { label: "Low Stock Items", value: "7", icon: Warehouse, color: "text-amber-600" },
        ].map((s) => {
          const SIcon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <SIcon className={`h-4 w-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Stock Movements</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movements..."
                className="pl-9 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {m.id}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{m.product}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        typeColors[m.type] || typeColors.Adjustment
                      }`}
                    >
                      {m.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`text-sm font-semibold ${
                        m.qty > 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {m.qty > 0 ? `+${m.qty}` : m.qty}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.user}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
