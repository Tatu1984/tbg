"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Printer,
  IndianRupee,
  Receipt,
  Calendar,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/frontend/hooks/useAuth";
import { toast } from "sonner";

interface InvoiceItem {
  id: string;
  quantity: number;
  unitPrice: string;
  gstAmount: string;
  discount: string;
  totalPrice: string;
  product: { name: string; sku: string };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: string;
  gstAmount: string;
  discount: string;
  totalAmount: string;
  paymentMethod: string;
  paymentDetail: string | null;
  status: string;
  createdAt: string;
  user: { name: string };
  items: InvoiceItem[];
}

const PAGE_SIZE = 20;

export default function InvoiceHistoryPage() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  async function fetchInvoices() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/billing?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      setInvoices(data.invoices);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page]);

  const filtered = useMemo(() => {
    let list = invoices;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.user.name.toLowerCase().includes(q) ||
          inv.items.some(
            (it) =>
              it.product.name.toLowerCase().includes(q) ||
              it.product.sku.toLowerCase().includes(q)
          )
      );
    }
    if (paymentFilter !== "all") {
      list = list.filter((inv) => inv.paymentMethod === paymentFilter);
    }
    return list;
  }, [invoices, search, paymentFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount),
    0
  );

  function handlePrintInvoice(inv: Invoice) {
    const rows = inv.items
      .map(
        (it, i) =>
          `<tr>
        <td style="border:1px solid #ddd;padding:8px;text-align:center">${i + 1}</td>
        <td style="border:1px solid #ddd;padding:8px">${it.product.name}<br/><small style="color:#666">${it.product.sku}</small></td>
        <td style="border:1px solid #ddd;padding:8px;text-align:center">${it.quantity}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right">${Number(it.unitPrice).toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right">${Number(it.gstAmount).toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right">${Number(it.discount).toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right;font-weight:bold">${Number(it.totalPrice).toFixed(2)}</td>
      </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNumber}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:auto}table{width:100%;border-collapse:collapse;margin:20px 0}@media print{body{padding:20px}}</style>
    </head><body>
    <h1 style="margin:0">THE BIKER GENOME</h1>
    <h2 style="color:#666;margin:4px 0 20px">${inv.invoiceNumber}</h2>
    <p><strong>Date:</strong> ${new Date(inv.createdAt).toLocaleString("en-IN")}</p>
    <p><strong>Billed by:</strong> ${inv.user.name}</p>
    <p><strong>Payment:</strong> ${inv.paymentMethod.toUpperCase()}</p>
    <table>
      <thead><tr style="background:#f5f5f5">
        <th style="border:1px solid #ddd;padding:8px">#</th>
        <th style="border:1px solid #ddd;padding:8px;text-align:left">Product</th>
        <th style="border:1px solid #ddd;padding:8px">Qty</th>
        <th style="border:1px solid #ddd;padding:8px;text-align:right">Price</th>
        <th style="border:1px solid #ddd;padding:8px;text-align:right">GST</th>
        <th style="border:1px solid #ddd;padding:8px;text-align:right">Disc</th>
        <th style="border:1px solid #ddd;padding:8px;text-align:right">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="text-align:right;margin-top:20px">
      <p>Subtotal: ₹${Number(inv.subtotal).toFixed(2)}</p>
      <p>GST: ₹${Number(inv.gstAmount).toFixed(2)}</p>
      ${Number(inv.discount) > 0 ? `<p>Discount: -₹${Number(inv.discount).toFixed(2)}</p>` : ""}
      <h2>Total: ₹${Number(inv.totalAmount).toFixed(2)}</h2>
    </div>
    </body></html>`;

    const w = window.open("", "_blank", "width=900,height=700");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Page Revenue</p>
                <p className="text-2xl font-bold">
                  {"\u20B9"}
                  {totalRevenue.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latest Invoice</p>
                <p className="text-2xl font-bold">
                  {invoices[0]?.invoiceNumber || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoice History
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoice, product, staff..."
                  className="pl-9 h-9 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No invoices found</p>
              <p className="text-sm mt-1">
                {total === 0
                  ? "Invoices will appear here once sales are made from POS."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Billed By</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">GST</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow
                    key={inv.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <TableCell className="font-mono font-semibold text-sm">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      <span className="text-xs text-muted-foreground ml-1">
                        {new Date(inv.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{inv.user.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {inv.items.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          inv.paymentMethod === "cash" &&
                            "border-green-300 text-green-700",
                          inv.paymentMethod === "upi" &&
                            "border-purple-300 text-purple-700",
                          (inv.paymentMethod === "card" ||
                            inv.paymentMethod === "credit_card" ||
                            inv.paymentMethod === "debit_card") &&
                            "border-blue-300 text-blue-700",
                          inv.paymentMethod === "split" &&
                            "border-orange-300 text-orange-700"
                        )}
                      >
                        {inv.paymentMethod.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {"\u20B9"}
                      {Number(inv.subtotal).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {"\u20B9"}
                      {Number(inv.gstAmount).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      {"\u20B9"}
                      {Number(inv.totalAmount).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          inv.status === "completed" ? "default" : "secondary"
                        }
                        className={cn(
                          "text-xs",
                          inv.status === "completed" &&
                            "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        )}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(inv);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintInvoice(inv);
                          }}
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  {selectedInvoice.invoiceNumber}
                </DialogTitle>
                <DialogDescription>
                  {new Date(selectedInvoice.createdAt).toLocaleString("en-IN")}{" "}
                  &middot; Billed by {selectedInvoice.user.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Payment</p>
                    <p className="font-medium capitalize">
                      {selectedInvoice.paymentMethod.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium capitalize">
                      {selectedInvoice.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Total Amount
                    </p>
                    <p className="font-bold text-lg">
                      {"\u20B9"}
                      {Number(selectedInvoice.totalAmount).toLocaleString(
                        "en-IN",
                        { minimumFractionDigits: 2 }
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">GST</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.product.sku}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {"\u20B9"}
                          {Number(item.unitPrice).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {"\u20B9"}
                          {Number(item.gstAmount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {"\u20B9"}
                          {Number(item.discount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {"\u20B9"}
                          {Number(item.totalPrice).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="text-right space-y-1 text-sm">
                  <div className="flex justify-end gap-8">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {"\u20B9"}
                      {Number(selectedInvoice.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-end gap-8">
                    <span className="text-muted-foreground">GST</span>
                    <span>
                      {"\u20B9"}
                      {Number(selectedInvoice.gstAmount).toFixed(2)}
                    </span>
                  </div>
                  {Number(selectedInvoice.discount) > 0 && (
                    <div className="flex justify-end gap-8">
                      <span className="text-muted-foreground">Discount</span>
                      <span>
                        -{"\u20B9"}
                        {Number(selectedInvoice.discount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-end gap-8 text-base font-bold">
                    <span>Total</span>
                    <span>
                      {"\u20B9"}
                      {Number(selectedInvoice.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button
                  className="gap-2"
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
