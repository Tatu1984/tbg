"use client";

import { useState } from "react";
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
import { Search, MoreHorizontal, Eye, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";

type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

type Order = {
  id: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: string;
  date: string;
  method: string;
};

const initialOrders: Order[] = [
  {
    id: "ORD-2041",
    customer: "Rahul Sharma",
    items: [
      { name: "Basmati Rice (5kg)", qty: 2, price: 4500 },
      { name: "Toor Dal (1kg)", qty: 3, price: 690 },
      { name: "Mustard Oil (1L)", qty: 1, price: 3200 },
    ],
    total: 17890,
    status: "confirmed",
    date: "05 Mar 2026",
    method: "Razorpay",
  },
  {
    id: "ORD-2040",
    customer: "Priya Menon",
    items: [{ name: "Organic Honey (500g)", qty: 1, price: 5500 }],
    total: 5500,
    status: "shipped",
    date: "04 Mar 2026",
    method: "UPI",
  },
  {
    id: "ORD-2039",
    customer: "Amit Patel",
    items: [
      { name: "Almonds (250g)", qty: 2, price: 3240 },
      { name: "Cashews (250g)", qty: 1, price: 2000 },
    ],
    total: 8480,
    status: "delivered",
    date: "03 Mar 2026",
    method: "Card",
  },
  {
    id: "ORD-2038",
    customer: "Sneha Reddy",
    items: [{ name: "Green Tea (100 bags)", qty: 1, price: 2990 }],
    total: 2990,
    status: "cancelled",
    date: "02 Mar 2026",
    method: "UPI",
  },
  {
    id: "ORD-2037",
    customer: "Vikram Singh",
    items: [
      { name: "Saffron (1g)", qty: 2, price: 6400 },
      { name: "Cardamom (100g)", qty: 1, price: 4870 },
      { name: "Cinnamon Sticks (200g)", qty: 3, price: 2100 },
      { name: "Black Pepper (250g)", qty: 1, price: 4000 },
    ],
    total: 23670,
    status: "delivered",
    date: "01 Mar 2026",
    method: "Razorpay",
  },
  {
    id: "ORD-2036",
    customer: "Ananya Gupta",
    items: [
      { name: "Ghee (1L)", qty: 1, price: 6500 },
      { name: "Jaggery (500g)", qty: 2, price: 1100 },
    ],
    total: 8700,
    status: "processing",
    date: "28 Feb 2026",
    method: "Card",
  },
  {
    id: "ORD-2035",
    customer: "Rajesh Kumar",
    items: [
      { name: "Turmeric Powder (500g)", qty: 3, price: 900 },
      { name: "Red Chilli Powder (500g)", qty: 2, price: 750 },
      { name: "Coriander Powder (500g)", qty: 2, price: 600 },
    ],
    total: 5800,
    status: "confirmed",
    date: "27 Feb 2026",
    method: "UPI",
  },
  {
    id: "ORD-2034",
    customer: "Deepika Nair",
    items: [
      { name: "Coconut Oil (1L)", qty: 2, price: 2400 },
      { name: "Curry Leaves (dried, 100g)", qty: 1, price: 350 },
    ],
    total: 5150,
    status: "shipped",
    date: "26 Feb 2026",
    method: "Razorpay",
  },
  {
    id: "ORD-2033",
    customer: "Suresh Iyer",
    items: [
      { name: "Peanut Butter (500g)", qty: 1, price: 4200 },
    ],
    total: 4200,
    status: "delivered",
    date: "25 Feb 2026",
    method: "Card",
  },
  {
    id: "ORD-2032",
    customer: "Kavitha Rao",
    items: [
      { name: "Quinoa (1kg)", qty: 1, price: 3600 },
      { name: "Chia Seeds (250g)", qty: 2, price: 1800 },
      { name: "Flax Seeds (500g)", qty: 1, price: 1200 },
    ],
    total: 8400,
    status: "processing",
    date: "24 Feb 2026",
    method: "UPI",
  },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-500/10 text-blue-700 border-blue-200",
  processing: "bg-purple-500/10 text-purple-700 border-purple-200",
  shipped: "bg-amber-500/10 text-amber-700 border-amber-200",
  delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-500/10 text-red-700 border-red-200",
};

const statusOptions = ["confirmed", "processing", "shipped", "delivered"];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // View sheet state
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Update status dialog state
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Cancel dialog state
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
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

  function handleUpdateStatusConfirm() {
    if (!statusOrder || !newStatus) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === statusOrder.id ? { ...o, status: newStatus } : o
      )
    );
    toast.success(`Status updated`, {
      description: `${statusOrder.id} is now "${newStatus}"`,
    });
    setStatusOpen(false);
    setStatusOrder(null);
  }

  function handleCancelOpen(order: Order) {
    setCancelOrder(order);
    setCancelOpen(true);
  }

  function handleCancelConfirm() {
    if (!cancelOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelOrder.id ? { ...o, status: "cancelled" } : o
      )
    );
    toast.success(`Order cancelled`, {
      description: `${cancelOrder.id} has been cancelled. The customer will be notified.`,
    });
    setCancelOpen(false);
    setCancelOrder(null);
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
              {filteredOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {o.id}
                  </TableCell>
                  <TableCell className="text-sm">{o.customer}</TableCell>
                  <TableCell className="text-center text-sm">
                    {o.items.length}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    &#8377;{o.total.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {o.method}
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
                    {o.date}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
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
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
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
              Full details for {viewOrder?.id}
            </SheetDescription>
          </SheetHeader>
          {viewOrder && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono font-medium">{viewOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm">{viewOrder.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm">{viewOrder.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <Badge variant="outline" className="text-xs font-normal">
                    {viewOrder.method}
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
                  {viewOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.qty} x &#8377;
                          {item.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <p className="font-medium">
                        &#8377;
                        {(item.qty * item.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Total</p>
                <p className="text-lg font-bold">
                  &#8377;{viewOrder.total.toLocaleString("en-IN")}
                </p>
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
              Change the status for {statusOrder?.id}
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
            <Button variant="outline" onClick={() => setStatusOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatusConfirm}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Cancel order {cancelOrder?.id}? This will notify the customer.
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
