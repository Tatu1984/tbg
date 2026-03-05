"use client";

import { useState } from "react";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const shopProducts = [
  { id: 1, name: "MT Thunder 3 Helmet", brand: "MT Helmets", category: "Helmets", price: 5500, mrp: 6200, rating: 4.5, reviews: 128, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop", badge: "Bestseller", desc: "Full-face helmet with aerodynamic design. DOT & ISI certified. Anti-scratch visor with quick-release mechanism." },
  { id: 2, name: "LS2 FF800 Storm Helmet", brand: "LS2", category: "Helmets", price: 8900, mrp: 9500, rating: 4.7, reviews: 89, image: "https://images.unsplash.com/photo-1621265010240-ace7a3502dd3?w=400&h=400&fit=crop", badge: null, desc: "Premium full-face touring helmet with HPFC shell. Pinlock ready with multi-density EPS liner." },
  { id: 3, name: "Rynox Storm Evo Jacket", brand: "Rynox", category: "Riding Jackets", price: 5990, mrp: 6490, rating: 4.6, reviews: 204, image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop", badge: "Popular", desc: "All-weather riding jacket with CE Level 2 armour. Waterproof outer shell with thermal liner." },
  { id: 4, name: "Rynox Air GT Gloves", brand: "Rynox", category: "Riding Gloves", price: 1490, mrp: 1690, rating: 4.3, reviews: 312, image: "https://images.unsplash.com/photo-1615412704911-55d589229864?w=400&h=400&fit=crop", badge: null, desc: "Summer mesh riding gloves with knuckle protection. Touchscreen compatible fingertips." },
  { id: 5, name: "Cramster Blaster Boots", brand: "Cramster", category: "Riding Boots", price: 2990, mrp: 3490, rating: 4.4, reviews: 76, image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop", badge: null, desc: "Ankle-length riding boots with shift pad. Oil-resistant sole with waterproof construction." },
  { id: 6, name: "Royal Enfield Saddle Bag", brand: "Royal Enfield", category: "Luggage & Bags", price: 2990, mrp: 3490, rating: 4.2, reviews: 156, image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=400&h=400&fit=crop", badge: "New", desc: "Genuine leather saddle bag with quick-mount system. 15L capacity with rain cover." },
  { id: 7, name: "Quad Lock Phone Mount", brand: "Quad Lock", category: "Accessories", price: 3200, mrp: 3500, rating: 4.8, reviews: 421, image: "https://images.unsplash.com/photo-1558981033-7c2a5e9e7d30?w=400&h=400&fit=crop", badge: "Top Rated", desc: "Vibration dampened phone mount. 360-degree rotation with one-click release system." },
  { id: 8, name: "Rynox Knee Guard Pro", brand: "Rynox", category: "Protection Gear", price: 1890, mrp: 2190, rating: 4.5, reviews: 93, image: "https://images.unsplash.com/photo-1616697869778-772a01471820?w=400&h=400&fit=crop", badge: null, desc: "CE Level 2 knee protectors with 3D mesh panels. Adjustable velcro straps for secure fit." },
  { id: 9, name: "AGV K3 SV Helmet", brand: "AGV", category: "Helmets", price: 14500, mrp: 16000, rating: 4.9, reviews: 67, image: "https://images.unsplash.com/photo-1569839333583-7375336cde4b?w=400&h=400&fit=crop", badge: "Premium", desc: "Race-grade helmet with advanced ventilation. Carbon-fibreglass shell with Integrated Ventilation System." },
  { id: 10, name: "Viaterra Claw Mini", brand: "Viaterra", category: "Luggage & Bags", price: 1990, mrp: 2290, rating: 4.1, reviews: 198, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", badge: null, desc: "Compact tail bag with expandable design. Reflective accents and rain cover included." },
  { id: 11, name: "BBG Waterproof Jacket", brand: "BBG", category: "Riding Jackets", price: 4490, mrp: 4990, rating: 4.3, reviews: 145, image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?w=400&h=400&fit=crop", badge: null, desc: "3-layer waterproof touring jacket with CE armour pockets. Hi-vis reflective panels." },
  { id: 12, name: "Cramster Flux Gloves", brand: "Cramster", category: "Riding Gloves", price: 2490, mrp: 2890, rating: 4.6, reviews: 87, image: "https://images.unsplash.com/photo-1594938328870-9623159c8c99?w=400&h=400&fit=crop", badge: null, desc: "Full gauntlet riding gloves with carbon fibre knuckle guard. Goatskin leather palm." },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type Product = (typeof shopProducts)[number];

export default function ShopPage() {
  const [sortBy, setSortBy] = useState("popular");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setQty(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero banner with image */}
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
          <Button className="w-fit bg-brand hover:bg-brand/90 text-brand-foreground font-bold rounded-xl">
            Shop New Arrivals
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-bold text-foreground">{shopProducts.length}</span> products
        </p>
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
      >
        {shopProducts.map((product) => {
          const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

          return (
            <motion.div key={product.id} variants={itemVariant}>
              <Card
                className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
                onClick={() => openProduct(product)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {product.badge && (
                    <Badge className="absolute top-3 left-3 bg-brand text-brand-foreground text-[10px] border-0 font-bold">
                      {product.badge}
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] border-0 font-bold">
                      {discount}% OFF
                    </Badge>
                  )}
                  {/* Quick add overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      className="gap-2 bg-white text-foreground hover:bg-white shadow-xl font-semibold rounded-full px-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`${product.name} added to cart`);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                  {/* Wishlist */}
                  <button
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
                    style={{ display: discount > 0 ? "none" : undefined }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toast("Added to wishlist");
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                    {product.brand}
                  </p>
                  <h3 className="text-sm font-semibold line-clamp-1 mb-2 group-hover:text-brand transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center gap-0.5 bg-emerald-600/10 px-1.5 py-0.5 rounded">
                      <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700">{product.rating}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black">
                      &#8377;{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.mrp > product.price && (
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

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedProduct && (
            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square md:aspect-auto md:min-h-[500px] bg-muted">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
                {selectedProduct.badge && (
                  <Badge className="absolute top-4 left-4 bg-brand text-brand-foreground border-0 font-bold">
                    {selectedProduct.badge}
                  </Badge>
                )}
              </div>
              {/* Details */}
              <div className="p-6 md:p-8 flex flex-col">
                <DialogHeader className="text-left">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    {selectedProduct.brand} / {selectedProduct.category}
                  </p>
                  <DialogTitle className="text-xl font-black tracking-tight mt-1">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(selectedProduct.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-3xl font-black">
                    &#8377;{selectedProduct.price.toLocaleString("en-IN")}
                  </span>
                  {selectedProduct.mrp > selectedProduct.price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        &#8377;{selectedProduct.mrp.toLocaleString("en-IN")}
                      </span>
                      <Badge className="bg-emerald-600 text-white border-0 text-xs">
                        {Math.round(((selectedProduct.mrp - selectedProduct.price) / selectedProduct.mrp) * 100)}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>

                <Separator className="my-5" />

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedProduct.desc}
                </p>

                <div className="mt-auto pt-6">
                  {/* Quantity */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium">Qty:</span>
                    <div className="flex items-center border rounded-lg">
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(Math.max(1, qty - 1))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-bold">{qty}</span>
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(qty + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 h-12 gap-2 bg-brand hover:bg-brand/90 text-brand-foreground font-bold rounded-xl"
                      onClick={() => {
                        toast.success(`${qty}x ${selectedProduct.name} added to cart`);
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

                  {/* Trust */}
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
