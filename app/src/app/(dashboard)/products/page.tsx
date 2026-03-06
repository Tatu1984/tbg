"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  Filter,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, downloadTemplate, importFromExcel } from "@/frontend/utils/csv-utils";

// ── Types ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Helmets",
  "Riding Jackets",
  "Riding Gloves",
  "Riding Boots",
  "Bike Accessories",
  "Bike Parts",
  "Luggage & Bags",
  "Protection Gear",
] as const;

type Category = (typeof CATEGORIES)[number];

interface Product {
  id: number;
  sku: string;
  name: string;
  category: Category;
  brand: string;
  size: string;
  color: string;
  costPrice: number;
  price: number;
  mrp: number;
  gst: number;
  stock: number;
  reorderLevel: number;
  availableOnline: boolean;
}

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

// ── Initial data ────────────────────────────────────────────────────────────

const initialProducts: Product[] = [
  { id: 1, sku: "BG-HEL-001", name: "MT Thunder 3 Helmet - Black M", category: "Helmets", brand: "MT", size: "M", color: "Black", costPrice: 4200, price: 5500, mrp: 6200, gst: 18, stock: 7, reorderLevel: 3, availableOnline: true },
  { id: 2, sku: "BG-HEL-002", name: "LS2 FF800 Storm Helmet - Blue L", category: "Helmets", brand: "LS2", size: "L", color: "Blue", costPrice: 7200, price: 8900, mrp: 9500, gst: 18, stock: 1, reorderLevel: 3, availableOnline: true },
  { id: 3, sku: "BG-JAK-001", name: "Rynox Storm Evo Jacket - L", category: "Riding Jackets", brand: "Rynox", size: "L", color: "Black", costPrice: 4500, price: 5990, mrp: 6490, gst: 12, stock: 4, reorderLevel: 2, availableOnline: true },
  { id: 4, sku: "BG-GLV-001", name: "Rynox Air GT Gloves - M", category: "Riding Gloves", brand: "Rynox", size: "M", color: "Black", costPrice: 1100, price: 1490, mrp: 1690, gst: 12, stock: 2, reorderLevel: 3, availableOnline: false },
  { id: 5, sku: "BG-BOT-001", name: "Cramster Blaster Boots - 10", category: "Riding Boots", brand: "Cramster", size: "10", color: "Black", costPrice: 2200, price: 2990, mrp: 3490, gst: 18, stock: 5, reorderLevel: 2, availableOnline: true },
  { id: 6, sku: "BG-ACC-001", name: "Royal Enfield Saddle Bag", category: "Luggage & Bags", brand: "RE", size: "One Size", color: "Brown", costPrice: 2200, price: 2990, mrp: 3490, gst: 18, stock: 6, reorderLevel: 2, availableOnline: true },
  { id: 7, sku: "BG-ACC-002", name: "Phone Mount - Quad Lock", category: "Bike Accessories", brand: "Quad Lock", size: "Universal", color: "Black", costPrice: 2500, price: 3200, mrp: 3500, gst: 18, stock: 8, reorderLevel: 3, availableOnline: true },
  { id: 8, sku: "BG-PRO-001", name: "Knee Guard Pro - Rynox", category: "Protection Gear", brand: "Rynox", size: "Free Size", color: "Black", costPrice: 1400, price: 1890, mrp: 2190, gst: 12, stock: 0, reorderLevel: 3, availableOnline: false },
];

const emptyForm: Omit<Product, "id"> = {
  sku: "",
  name: "",
  category: "Helmets",
  brand: "",
  size: "",
  color: "",
  costPrice: 0,
  price: 0,
  mrp: 0,
  gst: 18,
  stock: 0,
  reorderLevel: 3,
  availableOnline: true,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getStatus(product: Product): "active" | "low" | "out" {
  if (product.stock === 0) return "out";
  if (product.stock <= product.reorderLevel) return "low";
  return "active";
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Omit<Product, "id">>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);

  // Duplicate detection state
  const [duplicateMatch, setDuplicateMatch] = useState<Product | null>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Filter state
  const [filterCategories, setFilterCategories] = useState<Set<string>>(new Set());
  const [filterStock, setFilterStock] = useState<StockFilter>("all");

  // ── Filtering logic ───────────────────────────────────────────────────

  const filtered = products.filter((p) => {
    // Search
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    // Category filter
    const matchesCategory =
      filterCategories.size === 0 || filterCategories.has(p.category);

    // Stock filter
    const status = getStatus(p);
    const matchesStock =
      filterStock === "all" ||
      (filterStock === "in-stock" && status === "active") ||
      (filterStock === "low-stock" && status === "low") ||
      (filterStock === "out-of-stock" && status === "out");

    return matchesSearch && matchesCategory && matchesStock;
  });

  // ── Stats ─────────────────────────────────────────────────────────────

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => getStatus(p) === "active").length;
  const lowStockCount = products.filter((p) => getStatus(p) === "low").length;
  const outOfStockCount = products.filter((p) => getStatus(p) === "out").length;

  // ── Handlers ──────────────────────────────────────────────────────────

  function checkDuplicate(value: string) {
    if (dialogMode !== "add" || !value.trim()) {
      setDuplicateMatch(null);
      return;
    }
    const match = products.find(
      (p) => p.sku.toLowerCase() === value.trim().toLowerCase()
    );
    if (match) {
      setDuplicateMatch(match);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = match;
      setFormData({ ...rest });
      toast.warning(`Existing product found: "${match.name}" (${match.sku})`);
    } else {
      setDuplicateMatch(null);
    }
  }

  function openAddDialog() {
    setDialogMode("add");
    setFormData({ ...emptyForm });
    setEditId(null);
    setDuplicateMatch(null);
    setDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setDialogMode("edit");
    setEditId(product.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = product;
    setFormData({ ...rest });
    setDialogOpen(true);
  }

  function openDeleteDialog(product: Product) {
    setDeleteTarget(product);
    setDeleteDialogOpen(true);
  }

  function handleSubmit() {
    if (!formData.name.trim() || !formData.sku.trim()) {
      toast.error("Name and SKU are required.");
      return;
    }

    if (dialogMode === "add") {
      const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      setProducts((prev) => [...prev, { id: newId, ...formData }]);
      toast.success(`"${formData.name}" has been added.`);
    } else if (editId !== null) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...formData } : p))
      );
      toast.success(`"${formData.name}" has been updated.`);
    }

    setDialogOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.name}" has been deleted.`);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }

  function toggleCategoryFilter(cat: string) {
    setFilterCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function clearFilters() {
    setFilterCategories(new Set());
    setFilterStock("all");
  }

  const activeFilterCount =
    filterCategories.size + (filterStock !== "all" ? 1 : 0);

  // ── CSV / Excel ─────────────────────────────────────────────────────

  const csvHeaders: { key: keyof Product; label: string }[] = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "brand", label: "Brand" },
    { key: "size", label: "Size" },
    { key: "color", label: "Color" },
    { key: "costPrice", label: "Cost Price" },
    { key: "price", label: "Selling Price" },
    { key: "mrp", label: "MRP" },
    { key: "gst", label: "GST %" },
    { key: "stock", label: "Stock" },
    { key: "reorderLevel", label: "Reorder Level" },
    { key: "availableOnline", label: "Available Online" },
  ];

  const sampleProduct: Record<string, unknown> = {
    sku: "BG-HEL-099",
    name: "Sample Helmet - Black L",
    category: "Helmets",
    brand: "MT",
    size: "L",
    color: "Black",
    costPrice: 4200,
    price: 5500,
    mrp: 6200,
    gst: 18,
    stock: 10,
    reorderLevel: 3,
    availableOnline: "true",
  };

  function handleExportCSV() {
    exportToCSV(filtered, csvHeaders, "products-export");
    toast.success(`Exported ${filtered.length} products to CSV.`);
  }

  function handleDownloadTemplate() {
    downloadTemplate(csvHeaders, "products", sampleProduct);
    toast.success("Template downloaded.");
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const toNum = (v: string) => Number(v) || 0;
      const toBool = (v: string) => v.toLowerCase() === "true" || v === "1" || v.toLowerCase() === "yes";

      const imported = await importFromExcel<Omit<Product, "id">>(file, [
        { label: "SKU", key: "sku" },
        { label: "Name", key: "name" },
        { label: "Category", key: "category" },
        { label: "Brand", key: "brand" },
        { label: "Size", key: "size" },
        { label: "Color", key: "color" },
        { label: "Cost Price", key: "costPrice", transform: toNum },
        { label: "Selling Price", key: "price", transform: toNum },
        { label: "MRP", key: "mrp", transform: toNum },
        { label: "GST %", key: "gst", transform: toNum },
        { label: "Stock", key: "stock", transform: toNum },
        { label: "Reorder Level", key: "reorderLevel", transform: toNum },
        { label: "Available Online", key: "availableOnline", transform: toBool },
      ]);

      const valid = imported.filter((p) => p.sku && p.name);
      if (valid.length === 0) {
        toast.error("No valid rows found. Ensure SKU and Name columns are filled.");
        return;
      }

      let maxId = products.length > 0 ? Math.max(...products.map((p) => p.id)) : 0;
      const newProducts = valid.map((p) => ({
        ...p,
        id: ++maxId,
        category: (p.category || "Helmets") as Category,
        gst: p.gst || 18,
        reorderLevel: p.reorderLevel || 3,
        availableOnline: p.availableOnline ?? true,
      }));

      setProducts((prev) => [...prev, ...newProducts]);
      toast.success(`Imported ${newProducts.length} products.`);
    } catch {
      toast.error("Failed to import file. Please check the format.");
    }

    // Reset input so the same file can be re-imported
    e.target.value = "";
  }

  // ── Form updater ──────────────────────────────────────────────────────

  function updateField<K extends keyof Omit<Product, "id">>(
    key: K,
    value: Omit<Product, "id">[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Import / Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadTemplate}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Template
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => document.getElementById("product-import")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import from Excel / CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            id="product-import"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportExcel}
          />
          <Button className="gap-2" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Products",
            value: totalProducts,
            icon: Package,
            bg: "bg-blue-100 dark:bg-blue-900/40",
            iconColor: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "In Stock",
            value: inStockCount,
            icon: CheckCircle2,
            bg: "bg-green-100 dark:bg-green-900/40",
            iconColor: "text-green-600 dark:text-green-400",
          },
          {
            label: "Low Stock",
            value: lowStockCount,
            icon: TrendingDown,
            bg: "bg-amber-100 dark:bg-amber-900/40",
            iconColor: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Out of Stock",
            value: outOfStockCount,
            icon: AlertTriangle,
            bg: "bg-red-100 dark:bg-red-900/40",
            iconColor: "text-red-600 dark:text-red-400",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4 flex items-center gap-4">
              <div
                className={`flex items-center justify-center h-11 w-11 rounded-lg ${s.bg}`}
              >
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  {s.label}
                </p>
                <p className="text-2xl font-bold leading-none">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Products</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filter popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Filter className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Filters</p>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs"
                          onClick={clearFilters}
                        >
                          Clear all
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Category filters */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Category
                      </p>
                      <div className="space-y-1.5">
                        {CATEGORIES.map((cat) => (
                          <label
                            key={cat}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={filterCategories.has(cat)}
                              onChange={() => toggleCategoryFilter(cat)}
                              className="rounded border-input h-4 w-4 accent-primary"
                            />
                            {cat}
                          </label>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Stock status filter */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Stock Status
                      </p>
                      <div className="space-y-1.5">
                        {(
                          [
                            { value: "all", label: "All" },
                            { value: "in-stock", label: "In Stock" },
                            { value: "low-stock", label: "Low Stock" },
                            { value: "out-of-stock", label: "Out of Stock" },
                          ] as const
                        ).map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="radio"
                              name="stockFilter"
                              checked={filterStock === opt.value}
                              onChange={() => setFilterStock(opt.value)}
                              className="h-4 w-4 accent-primary"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">MRP</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const status = getStatus(p);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.brand}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {p.sku}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        <span className="inline-flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />
                          {p.price.toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />
                          {p.mrp.toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium">
                        {p.stock}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            status === "out"
                              ? "destructive"
                              : status === "low"
                              ? "outline"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {status === "out"
                            ? "Out of stock"
                            : status === "low"
                            ? "Low stock"
                            : "In stock"}
                        </Badge>
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
                            <DropdownMenuItem
                              onClick={() => openEditDialog(p)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openDeleteDialog(p)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Add / Edit Product Dialog ──────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add" ? "Add Product" : "Edit Product"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Add a new product to your catalog."
                : "Update the product details below."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Duplicate warning */}
            {duplicateMatch && dialogMode === "add" && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40 p-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    Existing product found
                  </p>
                  <p className="text-amber-700 dark:text-amber-400/80 mt-0.5">
                    &quot;{duplicateMatch.name}&quot; ({duplicateMatch.sku}) already exists with {duplicateMatch.stock} in stock. The form has been auto-filled. You can edit the existing product instead.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 text-xs border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    onClick={() => {
                      setDialogOpen(false);
                      openEditDialog(duplicateMatch);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1.5" />
                    Edit Existing Product
                  </Button>
                </div>
              </div>
            )}

            {/* Row 1: Name + SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-name">Name *</Label>
                <Input
                  id="prod-name"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-sku">SKU *</Label>
                <Input
                  id="prod-sku"
                  placeholder="e.g. BG-HEL-003"
                  value={formData.sku}
                  onChange={(e) => updateField("sku", e.target.value)}
                  onBlur={(e) => checkDuplicate(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Category + Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    updateField("category", val as Category)
                  }
                >
                  <SelectTrigger className="w-full">
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
                <Label htmlFor="prod-brand">Brand</Label>
                <Input
                  id="prod-brand"
                  placeholder="Brand name"
                  value={formData.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Size + Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-size">Size</Label>
                <Input
                  id="prod-size"
                  placeholder="e.g. M, L, 10"
                  value={formData.size}
                  onChange={(e) => updateField("size", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-color">Color</Label>
                <Input
                  id="prod-color"
                  placeholder="e.g. Black"
                  value={formData.color}
                  onChange={(e) => updateField("color", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Row 4: Cost Price + Selling Price + MRP + GST */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-cost">Cost Price</Label>
                <Input
                  id="prod-cost"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.costPrice || ""}
                  onChange={(e) =>
                    updateField("costPrice", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-price">Selling Price</Label>
                <Input
                  id="prod-price"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.price || ""}
                  onChange={(e) =>
                    updateField("price", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-mrp">MRP</Label>
                <Input
                  id="prod-mrp"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.mrp || ""}
                  onChange={(e) =>
                    updateField("mrp", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-gst">GST %</Label>
                <Input
                  id="prod-gst"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="18"
                  value={formData.gst || ""}
                  onChange={(e) =>
                    updateField("gst", Number(e.target.value))
                  }
                />
              </div>
            </div>

            {/* Row 5: Stock + Reorder Level + Available Online */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-stock">Stock</Label>
                <Input
                  id="prod-stock"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.stock ?? ""}
                  onChange={(e) =>
                    updateField("stock", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-reorder">Reorder Level</Label>
                <Input
                  id="prod-reorder"
                  type="number"
                  min={0}
                  placeholder="3"
                  value={formData.reorderLevel || ""}
                  onChange={(e) =>
                    updateField("reorderLevel", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Available Online</Label>
                <Button
                  type="button"
                  variant={formData.availableOnline ? "default" : "outline"}
                  className="w-full"
                  onClick={() =>
                    updateField("availableOnline", !formData.availableOnline)
                  }
                >
                  {formData.availableOnline ? "Yes" : "No"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>
              {dialogMode === "add" ? "Add Product" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog (styled as AlertDialog) ─────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
