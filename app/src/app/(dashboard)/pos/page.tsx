"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  SplitSquareHorizontal,
  Search,
  PackagePlus,
  Check,
  ChevronsUpDown,
  Receipt,
  ShoppingBag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock product data (will come from DB)
const INITIAL_PRODUCTS = [
  { id: "1", sku: "BG-HEL-001", name: "MT Thunder 3 Helmet - Black M", price: 5500, mrp: 6200, gst: 18, stock: 7, category: "Helmets" },
  { id: "2", sku: "BG-HEL-002", name: "LS2 FF800 Storm Helmet - Blue L", price: 8900, mrp: 9500, gst: 18, stock: 1, category: "Helmets" },
  { id: "3", sku: "BG-JAK-001", name: "Rynox Storm Evo Jacket - L", price: 5990, mrp: 6490, gst: 18, stock: 4, category: "Riding Jackets" },
  { id: "4", sku: "BG-GLV-001", name: "Rynox Air GT Gloves - M", price: 1490, mrp: 1690, gst: 18, stock: 2, category: "Riding Gloves" },
  { id: "5", sku: "BG-BOT-001", name: "Cramster Blaster Boots - 10", price: 2990, mrp: 3490, gst: 18, stock: 5, category: "Riding Boots" },
  { id: "6", sku: "BG-ACC-001", name: "Royal Enfield Saddle Bag", price: 2990, mrp: 3490, gst: 18, stock: 6, category: "Luggage & Bags" },
  { id: "7", sku: "BG-ACC-002", name: "Phone Mount - Quad Lock", price: 3200, mrp: 3500, gst: 18, stock: 8, category: "Bike Accessories" },
  { id: "8", sku: "BG-PRO-001", name: "Knee Guard Pro - Rynox", price: 1890, mrp: 2190, gst: 18, stock: 3, category: "Protection Gear" },
];

type Product = (typeof INITIAL_PRODUCTS)[number];

interface InvoiceItem {
  product: Product;
  quantity: number;
  discount: number;
}

const CATEGORIES = [
  "Helmets",
  "Riding Jackets",
  "Riding Gloves",
  "Riding Boots",
  "Bike Accessories",
  "Bike Parts",
  "Luggage & Bags",
  "Protection Gear",
];

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [invoiceNo] = useState(() => String(Date.now()).slice(-6));

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    mrp: "",
    gst: "18",
    stock: "1",
  });

  const inStockProducts = useMemo(
    () => products.filter((p) => p.stock > 0),
    [products]
  );

  function addItem(product: Product) {
    setSearchOpen(false);
    const existing = items.find((it) => it.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Only ${product.stock} in stock for ${product.name}`);
        return;
      }
      setItems(
        items.map((it) =>
          it.product.id === product.id
            ? { ...it, quantity: it.quantity + 1 }
            : it
        )
      );
    } else {
      setItems([...items, { product, quantity: 1, discount: 0 }]);
    }
    toast.success(`Added ${product.name}`);
  }

  function updateQuantity(productId: string, delta: number) {
    setItems(
      items
        .map((it) => {
          if (it.product.id !== productId) return it;
          const newQty = it.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > it.product.stock) {
            toast.error(`Only ${it.product.stock} in stock`);
            return it;
          }
          return { ...it, quantity: newQty };
        })
        .filter(Boolean) as InvoiceItem[]
    );
  }

  function removeItem(productId: string) {
    setItems(items.filter((it) => it.product.id !== productId));
  }

  function updateItemDiscount(productId: string, discount: number) {
    setItems(
      items.map((it) =>
        it.product.id === productId ? { ...it, discount } : it
      )
    );
  }

  // Calculations
  const subtotal = items.reduce(
    (sum, it) => sum + it.product.price * it.quantity - it.discount,
    0
  );
  const totalGst = items.reduce(
    (sum, it) =>
      sum +
      ((it.product.price * it.quantity - it.discount) * it.product.gst) / 100,
    0
  );
  const grandTotal = subtotal + totalGst - globalDiscount;

  function handleNewProduct(e: React.FormEvent) {
    e.preventDefault();
    const product: Product = {
      id: `new-${Date.now()}`,
      sku: newProduct.sku || `BG-NEW-${Date.now().toString(36).toUpperCase()}`,
      name: newProduct.name,
      price: Number(newProduct.price),
      mrp: Number(newProduct.mrp) || Number(newProduct.price),
      gst: Number(newProduct.gst),
      stock: Number(newProduct.stock),
      category: newProduct.category || "Bike Accessories",
    };
    setProducts([...products, product]);
    addItem(product);
    setNewProductOpen(false);
    setNewProduct({
      name: "",
      sku: "",
      category: "",
      price: "",
      mrp: "",
      gst: "18",
      stock: "1",
    });
    toast.success(`Product "${product.name}" added to catalog & invoice`);
  }

  function handleGenerateInvoice() {
    if (items.length === 0) {
      toast.error("Add items to the invoice first");
      return;
    }

    // Deduct stock for each item
    setProducts(
      products.map((p) => {
        const invoiceItem = items.find((it) => it.product.id === p.id);
        if (invoiceItem) {
          return { ...p, stock: p.stock - invoiceItem.quantity };
        }
        return p;
      })
    );

    toast.success(
      `Invoice generated! Total: ₹${grandTotal.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      })} (${paymentMethod.toUpperCase()})`
    );
    setItems([]);
    setGlobalDiscount(0);
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)]">
      {/* Left - Product selection & invoice items */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Product search bar */}
        <div className="flex items-center gap-3 mb-4">
          {/* Option 1: Dropdown search from existing stock */}
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={searchOpen}
                className="flex-1 justify-between h-12 text-base"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                  Search products by name or SKU...
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Type product name or SKU..." />
                <CommandList>
                  <CommandEmpty>
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        No products found.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setSearchOpen(false);
                          setNewProductOpen(true);
                        }}
                      >
                        <PackagePlus className="h-4 w-4" />
                        Add New Product
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup heading="In Stock">
                    {inStockProducts.map((product) => {
                      const isAdded = items.some(
                        (it) => it.product.id === product.id
                      );
                      return (
                        <CommandItem
                          key={product.id}
                          value={`${product.name} ${product.sku}`}
                          onSelect={() => addItem(product)}
                          className="flex items-center justify-between py-3"
                        >
                          <div className="flex items-center gap-3">
                            {isAdded ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.sku} &middot; {product.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              &#8377;{product.price.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Stock: {product.stock}
                            </p>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Option 2: Add new product button (popup) */}
          <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="gap-2 h-12 bg-brand hover:bg-brand/90 text-brand-foreground shrink-0"
              >
                <PackagePlus className="h-5 w-5" />
                New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  This product will be saved to the catalog and added to the
                  current invoice.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewProduct} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="np-name">Product Name *</Label>
                    <Input
                      id="np-name"
                      placeholder="e.g., AGV K3 SV Helmet - L"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-sku">SKU / Barcode</Label>
                    <Input
                      id="np-sku"
                      placeholder="Auto-generated if blank"
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-category">Category</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(val) =>
                        setNewProduct({ ...newProduct, category: val })
                      }
                    >
                      <SelectTrigger id="np-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-price">Selling Price (&#8377;) *</Label>
                    <Input
                      id="np-price"
                      type="number"
                      placeholder="0"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-mrp">MRP (&#8377;)</Label>
                    <Input
                      id="np-mrp"
                      type="number"
                      placeholder="0"
                      value={newProduct.mrp}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, mrp: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-gst">GST %</Label>
                    <Input
                      id="np-gst"
                      type="number"
                      value={newProduct.gst}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, gst: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-stock">Initial Stock</Label>
                    <Input
                      id="np-stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 pt-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="gap-2">
                    <PackagePlus className="h-4 w-4" />
                    Add & Bill
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Invoice items table */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Invoice Items
                {items.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {items.length}
                  </Badge>
                )}
              </CardTitle>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setItems([]);
                    toast("Invoice cleared");
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
                <ShoppingBag className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-sm font-medium mb-1">No items added</p>
                <p className="text-xs">
                  Search products above or add a new item
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[40%]">Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Disc</TableHead>
                      <TableHead className="text-right">GST</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {items.map((it) => {
                        const lineSubtotal =
                          it.product.price * it.quantity - it.discount;
                        const lineGst =
                          (lineSubtotal * it.product.gst) / 100;
                        const lineTotal = lineSubtotal + lineGst;

                        return (
                          <motion.tr
                            key={it.product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="border-b"
                          >
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">
                                  {it.product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {it.product.sku} &middot; Stock:{" "}
                                  {it.product.stock}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(it.product.id, -1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-semibold">
                                  {it.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(it.product.id, 1)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              &#8377;
                              {it.product.price.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                className="w-16 h-7 text-xs text-right ml-auto"
                                value={it.discount || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  updateItemDiscount(
                                    it.product.id,
                                    Number(e.target.value) || 0
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {it.product.gst}%
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold">
                              &#8377;
                              {lineTotal.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(it.product.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right - Payment panel */}
      <div className="w-[340px] shrink-0 flex flex-col gap-4">
        {/* Store info */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
                <span className="text-brand-foreground font-bold text-sm">
                  B
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm">The Biker Genome</p>
                <p className="text-xs text-muted-foreground">
                  Invoice #{invoiceNo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-base">Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  &#8377;{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST</span>
                <span>
                  &#8377;{totalGst.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Extra Discount</span>
                <Input
                  type="number"
                  className="w-20 h-7 text-xs text-right"
                  value={globalDiscount || ""}
                  placeholder="0"
                  onChange={(e) =>
                    setGlobalDiscount(Number(e.target.value) || 0)
                  }
                />
              </div>
              <Separator />
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-brand">
                  &#8377;
                  {grandTotal.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {/* Payment method */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Payment Method
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "cash", icon: Banknote, label: "Cash" },
                    { value: "upi", icon: Smartphone, label: "UPI" },
                    { value: "card", icon: CreditCard, label: "Card" },
                    {
                      value: "split",
                      icon: SplitSquareHorizontal,
                      label: "Split",
                    },
                  ].map((pm) => {
                    const PmIcon = pm.icon;
                    return (
                      <button
                        key={pm.value}
                        type="button"
                        onClick={() => setPaymentMethod(pm.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all",
                          paymentMethod === pm.value
                            ? "border-brand bg-brand/5 text-brand"
                            : "border-border text-muted-foreground hover:border-foreground/20"
                        )}
                      >
                        <PmIcon className="h-5 w-5" />
                        {pm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full h-12 text-base gap-2 bg-brand hover:bg-brand/90 text-brand-foreground"
                  onClick={handleGenerateInvoice}
                  disabled={items.length === 0}
                >
                  <Receipt className="h-5 w-5" />
                  Generate Invoice
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={items.length === 0}
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
