"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Warehouse,
  TrendingDown,
  TrendingUp,
  Package,
  Download,
  FileSpreadsheet,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { exportToCSV } from "@/frontend/utils/csv-utils";
import { apiClient } from "@/frontend/api/client";

const TX_TYPES = [
  "Purchase",
  "Sale",
  "Cash Sale",
  "Return",
  "Damaged",
  "Adjustment",
] as const;
type TxType = (typeof TX_TYPES)[number];

const typeColors: Record<string, string> = {
  Sale: "bg-blue-500/10 text-blue-700",
  Purchase: "bg-emerald-500/10 text-emerald-700",
  Return: "bg-amber-500/10 text-amber-700",
  "Cash Sale": "bg-purple-500/10 text-purple-700",
  Damaged: "bg-red-500/10 text-red-700",
  Adjustment: "bg-gray-500/10 text-gray-700",
};

interface ApiTransaction {
  id: string;
  productId: string;
  userId: string;
  type: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
  product: { name: string; sku: string };
  user: { name: string };
}

interface ApiProduct {
  id: string;
  sku: string;
  name: string;
  stock: number;
  reorderLevel: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InventoryPage() {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Adjust stock dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formProductId, setFormProductId] = useState("");
  const [formType, setFormType] = useState<TxType>("Purchase");
  const [formQty, setFormQty] = useState<number>(0);
  const [formNotes, setFormNotes] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, prodRes] = await Promise.all([
        apiClient.get<{ transactions: ApiTransaction[] }>("/inventory", {
          params: { limit: 100 },
        }),
        apiClient.get<{ products: ApiProduct[] }>("/products"),
      ]);
      setTransactions(txRes.data.transactions);
      setProducts(prodRes.data.products);
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = transactions.filter(
    (m) =>
      m.product.name.toLowerCase().includes(search.toLowerCase()) ||
      m.product.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase())
  );

  // ── Stats ──────────────────────────────────────────────────────────
  const todayStr = new Date().toDateString();
  const todayTx = transactions.filter(
    (t) => new Date(t.createdAt).toDateString() === todayStr
  );
  const stockInToday = todayTx
    .filter((t) => t.quantity > 0)
    .reduce((sum, t) => sum + t.quantity, 0);
  const stockOutToday = todayTx
    .filter((t) => t.quantity < 0)
    .reduce((sum, t) => sum + t.quantity, 0);
  const lowStockCount = products.filter(
    (p) => p.stock <= p.reorderLevel && p.stock > 0
  ).length;
  const totalSkus = products.length;

  // ── Handlers ──────────────────────────────────────────────────────
  function openAdjustDialog() {
    setFormProductId(products[0]?.id ?? "");
    setFormType("Purchase");
    setFormQty(0);
    setFormNotes("");
    setDialogOpen(true);
  }

  async function handleSubmitAdjustment() {
    if (!formProductId) {
      toast.error("Select a product");
      return;
    }
    if (!formQty) {
      toast.error("Quantity must be non-zero");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/inventory", {
        productId: formProductId,
        type: formType,
        quantity: Number(formQty),
        notes: formNotes || undefined,
      });
      toast.success("Stock adjusted");
      setDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to adjust stock";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handleExportCSV() {
    const rows = filtered.map((m) => ({
      id: m.id,
      product: m.product.name,
      sku: m.product.sku,
      type: m.type,
      qty: m.quantity,
      user: m.user.name,
      date: formatDate(m.createdAt),
      notes: m.notes ?? "",
    }));
    exportToCSV(
      rows,
      [
        { key: "id", label: "Transaction ID" },
        { key: "product", label: "Product" },
        { key: "sku", label: "SKU" },
        { key: "type", label: "Type" },
        { key: "qty", label: "Quantity" },
        { key: "user", label: "User" },
        { key: "date", label: "Date" },
        { key: "notes", label: "Notes" },
      ],
      "inventory-movements"
    );
    toast.success(`Exported ${rows.length} movements to CSV.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Track stock movements and manage inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="gap-2" onClick={openAdjustDialog}>
            <Plus className="h-4 w-4" />
            Adjust Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total SKUs",
            value: String(totalSkus),
            icon: Package,
            color: "text-blue-600",
          },
          {
            label: "Stock In Today",
            value: stockInToday > 0 ? `+${stockInToday}` : "0",
            icon: TrendingUp,
            color: "text-emerald-600",
          },
          {
            label: "Stock Out Today",
            value: String(stockOutToday),
            icon: TrendingDown,
            color: "text-red-500",
          },
          {
            label: "Low Stock Items",
            value: String(lowStockCount),
            icon: Warehouse,
            color: "text-amber-600",
          },
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                    Loading movements...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No movements found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {m.id.slice(0, 10)}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {m.product.name}
                      <span className="block text-xs text-muted-foreground">
                        {m.product.sku}
                      </span>
                    </TableCell>
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
                          m.quantity > 0 ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.user.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Record a stock movement. Use a negative quantity for outflows.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={formProductId} onValueChange={setFormProductId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — stock: {p.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formType}
                  onValueChange={(v) => setFormType(v as TxType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TX_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formQty || ""}
                  onChange={(e) => setFormQty(Number(e.target.value))}
                  placeholder="e.g. 5 or -2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Reference, reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSubmitAdjustment} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
