"use client";

import { useState, useEffect, useCallback } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, MoreHorizontal, Eye, Truck, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/frontend/api/client";

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  product: { name: string; sku: string };
};

type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  subtotal: string | number;
  gstAmount: string | number;
  shippingCharge: string | number;
  totalAmount: string | number;
  paymentMethod: string;
  paymentId: string | null;
  status: string;
  createdAt: string;
  customer: { name: string; email: string };
  items: OrderItem[];
};

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-500/10 text-blue-700 border-blue-200",
  processing: "bg-purple-500/10 text-purple-700 border-purple-200",
  shipped: "bg-amber-500/10 text-amber-700 border-amber-200",
  delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-500/10 text-red-700 border-red-200",
};

const statusOptions = ["confirmed", "processing", "shipped", "delivered"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtMoney(v: string | number): string {
  return Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // View sheet state
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Update status dialog state
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // Cancel dialog state
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ orders: Order[] }>("/orders", {
        params: { limit: 100 },
      });
      setOrders(data.orders);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase())
  );

  function handleView(order: Order) {
    setViewOrder(order);
    setViewOpen(true);
  }

  function handleUpdateStatusOpen(order: Order) {
    setStatusOrder(order);
    setNewStatus(order.status);
    setStatusOpen(true);
  }

  async function handleUpdateStatusConfirm() {
    if (!statusOrder || !newStatus) return;
    setUpdating(true);
    try {
      const { data } = await apiClient.put<{ order: Order }>("/orders", {
        id: statusOrder.id,
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === statusOrder.id ? data.order : o))
      );
      toast.success("Status updated", {
        description: `${statusOrder.orderNumber} is now "${newStatus}"`,
      });
      setStatusOpen(false);
      setStatusOrder(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to update status";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  }

  function handleCancelOpen(order: Order) {
    setCancelOrder(order);
    setCancelOpen(true);
  }

  async function handleCancelConfirm() {
    if (!cancelOrder) return;
    try {
      const { data } = await apiClient.put<{ order: Order }>("/orders", {
        id: cancelOrder.id,
        status: "cancelled",
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === cancelOrder.id ? data.order : o))
      );
      toast.success("Order cancelled", {
        description: `${cancelOrder.orderNumber} has been cancelled.`,
      });
      setCancelOpen(false);
      setCancelOrder(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to cancel order";
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage online and in-store orders
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Orders</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {o.orderNumber}
                    </TableCell>
                    <TableCell className="text-sm">{o.customer.name}</TableCell>
                    <TableCell className="text-center text-sm">
                      {o.items.length}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      ₹{fmtMoney(o.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal capitalize">
                        {o.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                          statusColors[o.status] ?? ""
                        }`}
                      >
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(o)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatusOpen(o)}
                            disabled={o.status === "cancelled"}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleCancelOpen(o)}
                            disabled={
                              o.status === "cancelled" ||
                              o.status === "delivered"
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Sheet */}
      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              Full details for {viewOrder?.orderNumber}
            </SheetDescription>
          </SheetHeader>
          {viewOrder && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono font-medium">{viewOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm">{formatDate(viewOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm">{viewOrder.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{viewOrder.customer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <Badge variant="outline" className="text-xs font-normal capitalize">
                    {viewOrder.paymentMethod}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                      statusColors[viewOrder.status] ?? ""
                    }`}
                  >
                    {viewOrder.status}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Items</h4>
                <div className="space-y-3">
                  {viewOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} x ₹{fmtMoney(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-medium">
                        ₹{fmtMoney(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{fmtMoney(viewOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST</span>
                  <span>₹{fmtMoney(viewOrder.gstAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{fmtMoney(viewOrder.shippingCharge)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-lg font-bold">
                    ₹{fmtMoney(viewOrder.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Update Status Dialog */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for {statusOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="capitalize">{s}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatusConfirm} disabled={updating}>
              {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Cancel order {cancelOrder?.orderNumber}? This will notify the customer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm}>
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
