"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
  Zap,
  Loader2,
  PackageX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCustomerStore } from "@/frontend/store/customerStore";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  sellingPrice: number;
  mrp: number;
  stock: number;
  imageUrl: string | null;
  description: string | null;
  category: { name: string };
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop";

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const { token } = useCustomerStore();

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock">("all");

  useEffect(() => {
    fetchProducts();
  }, [sortBy, category, searchQuery]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: sortBy });
      if (category) params.set("category", category);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/shop/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // Extract unique brands from loaded products
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  // Client-side filtering for price range, brand, stock
  const filteredProducts = useMemo(() => {
    let result = products;

    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    if (!isNaN(min)) {
      result = result.filter((p) => p.sellingPrice >= min);
    }
    if (!isNaN(max)) {
      result = result.filter((p) => p.sellingPrice <= max);
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }

    if (stockFilter === "in-stock") {
      result = result.filter((p) => p.stock > 0);
    }

    return result;
  }, [products, priceMin, priceMax, selectedBrands, stockFilter]);

  const hasActiveFilters = priceMin || priceMax || selectedBrands.length > 0 || stockFilter !== "all";

  function clearFilters() {
    setPriceMin("");
    setPriceMax("");
    setSelectedBrands([]);
    setStockFilter("all");
  }

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  async function addToCart(productId: string, quantity: number, productName: string) {
    if (!token) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    try {
      const res = await fetch("/api/shop/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add to cart");
      }
      toast.success(`${productName} added to cart`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    }
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setQty(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero banner */}
      {!searchQuery && (
        <div className="relative rounded-2xl overflow-hidden mb-8 min-h-[240px] md:min-h-[320px]">
          <Image
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=400&fit=crop"
            alt="Motorcycle riding gear"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="relative p-8 md:p-12 flex flex-col justify-center h-full min-h-[240px] md:min-h-[320px]">
            <Badge className="bg-brand text-brand-foreground border-0 w-fit mb-4 font-bold tracking-wider uppercase text-[10px]">
              <Zap className="h-3 w-3 mr-1" />
              New Season Collection
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 max-w-lg">
              PREMIUM RIDING GEAR
            </h1>
            <p className="text-white/60 max-w-md mb-6 text-sm md:text-base">
              Top brands. Certified protection. Style that rides with you.
            </p>
          </div>
        </div>
      )}

      {/* Search results header */}
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Search results for &ldquo;{searchQuery}&rdquo;
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>
      )}

      {/* Filters bar */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                !
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={clearFilters}>
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          )}
          <p className="text-sm text-muted-foreground hidden sm:block">
            Showing <span className="font-bold text-foreground">{filteredProducts.length}</span> products
          </p>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        {showFilters && (
          <div className="w-60 shrink-0 space-y-6">
            {/* Price Range */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                Price Range
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Min"
                  className="h-9 text-sm"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
                <span className="text-muted-foreground text-sm">–</span>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max"
                  className="h-9 text-sm"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </div>

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Brand
                </Label>
                <div className="space-y-2">
                  {availableBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground"
                    >
                      <Checkbox
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Filter */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                Availability
              </Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={stockFilter === "in-stock"}
                    onCheckedChange={(checked) =>
                      setStockFilter(checked ? "in-stock" : "all")
                    }
                  />
                  In Stock Only
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <PackageX className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "Try adjusting your filters."
                  : "Check back soon for new arrivals."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
            >
              {filteredProducts.map((product) => {
                const discount = product.mrp > product.sellingPrice
                  ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
                  : 0;

                return (
                  <motion.div key={product.id} variants={itemVariant}>
                    <Card
                      className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
                      onClick={() => openProduct(product)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Image
                          src={product.imageUrl || PLACEHOLDER_IMG}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {discount > 0 && (
                          <Badge className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] border-0 font-bold">
                            {discount}% OFF
                          </Badge>
                        )}
                        {product.stock <= 3 && product.stock > 0 && (
                          <Badge className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] border-0">
                            Only {product.stock} left
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                          <Button
                            size="sm"
                            className="gap-2 bg-white text-foreground hover:bg-white shadow-xl font-semibold rounded-full px-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product.id, 1, product.name);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                          {product.brand || product.category.name}
                        </p>
                        <h3 className="text-sm font-semibold line-clamp-1 mb-2 group-hover:text-brand transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black">
                            &#8377;{product.sellingPrice.toLocaleString("en-IN")}
                          </span>
                          {product.mrp > product.sellingPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              &#8377;{product.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedProduct && (
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-square md:aspect-auto md:min-h-[500px] bg-muted">
                <Image
                  src={selectedProduct.imageUrl || PLACEHOLDER_IMG}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col">
                <DialogHeader className="text-left">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    {selectedProduct.brand} / {selectedProduct.category.name}
                  </p>
                  <DialogTitle className="text-xl font-black tracking-tight mt-1">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-3xl font-black">
                    &#8377;{selectedProduct.sellingPrice.toLocaleString("en-IN")}
                  </span>
                  {selectedProduct.mrp > selectedProduct.sellingPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        &#8377;{selectedProduct.mrp.toLocaleString("en-IN")}
                      </span>
                      <Badge className="bg-emerald-600 text-white border-0 text-xs">
                        {Math.round(((selectedProduct.mrp - selectedProduct.sellingPrice) / selectedProduct.mrp) * 100)}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>

                {selectedProduct.stock <= 5 && (
                  <p className="text-xs text-amber-600 font-medium mt-2">
                    Only {selectedProduct.stock} left in stock
                  </p>
                )}

                <Separator className="my-5" />

                {selectedProduct.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedProduct.description}
                  </p>
                )}

                <div className="mt-auto pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium">Qty:</span>
                    <div className="flex items-center border rounded-lg">
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(Math.max(1, qty - 1))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-bold">{qty}</span>
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(Math.min(qty + 1, selectedProduct.stock))}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 h-12 gap-2 bg-brand hover:bg-brand/90 text-brand-foreground font-bold rounded-xl"
                      onClick={() => {
                        addToCart(selectedProduct.id, qty, selectedProduct.name);
                        setSelectedProduct(null);
                      }}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-xl"
                      onClick={() => toast("Added to wishlist")}
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Genuine</div>
                    <div className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Free Shipping</div>
                    <div className="flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" /> Easy Returns</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
