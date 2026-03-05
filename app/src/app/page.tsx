"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  LayoutDashboard,
  Receipt,
  ChevronRight,
  Shield,
  Truck,
  CreditCard,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const brands = [
  "MT Helmets", "Rynox", "LS2", "AGV", "Cramster", "Royal Enfield", "Quad Lock", "Viaterra",
];

const featuredProducts = [
  { name: "MT Thunder 3", category: "Helmets", price: 5500, image: "https://images.unsplash.com/photo-1569839333583-7375336cde4b?w=400&h=400&fit=crop" },
  { name: "Rynox Storm Evo", category: "Jackets", price: 5990, image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop" },
  { name: "Air GT Gloves", category: "Gloves", price: 1490, image: "https://images.unsplash.com/photo-1615412704911-55d589229864?w=400&h=400&fit=crop" },
  { name: "Blaster Boots", category: "Boots", price: 2990, image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/25">
              <span className="text-brand-foreground font-black text-lg">B</span>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight block leading-none">THE BIKER</span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-brand uppercase">GENOME</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/shop">
              <Button variant="ghost" size="sm" className="font-semibold">Shop</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Full width with biker image */}
      <header className="relative min-h-[100vh] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&q=80"
            alt="Motorcycle on road"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 w-full"
        >
          <Badge className="bg-brand/90 text-brand-foreground border-0 mb-6 text-xs font-bold tracking-wider uppercase px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Premium Riding Gear
          </Badge>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white mb-6 max-w-3xl">
            GEAR UP.
            <br />
            <span className="text-brand">RIDE SAFE.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-lg mb-10 leading-relaxed">
            Premium helmets, armoured jackets, riding gloves & every accessory
            your motorcycle demands. Shop online or walk in.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/shop">
              <Button size="lg" className="h-14 px-8 text-base gap-3 bg-brand hover:bg-brand/90 text-brand-foreground font-bold shadow-2xl shadow-brand/30 rounded-xl">
                <ShoppingBag className="h-5 w-5" />
                Explore Store
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pos">
              <Button size="lg" className="h-14 px-8 text-base gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-2xl shadow-emerald-600/30">
                <Receipt className="h-5 w-5" />
                POS Billing
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-6 mt-16">
            {[
              { icon: Shield, label: "100% Genuine" },
              { icon: Truck, label: "Pan India Delivery" },
              { icon: CreditCard, label: "Secure Payment" },
              { icon: Star, label: "4.8/5 Rating" },
            ].map((badge) => {
              const BIcon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-2 text-white/50">
                  <BIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </header>

      {/* Brand ticker */}
      <section className="bg-sidebar py-5 overflow-hidden">
        <div className="flex items-center gap-12 animate-scroll">
          {[...brands, ...brands].map((brand, i) => (
            <span key={i} className="text-sidebar-foreground/30 font-bold text-sm whitespace-nowrap tracking-wider uppercase">
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 text-xs font-bold tracking-wider uppercase">
            Featured
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            RIDE-READY GEAR
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Handpicked essentials from brands trusted by riders across India
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {featuredProducts.map((product) => (
            <motion.div key={product.name} variants={item}>
              <Link href="/shop" className="group block">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
                      {product.category}
                    </p>
                    <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-brand font-bold">
                      &#8377;{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-10 w-10 rounded-full bg-brand flex items-center justify-center shadow-xl">
                      <ShoppingBag className="h-5 w-5 text-brand-foreground" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Banner with image */}
      <section className="relative mx-6 rounded-3xl overflow-hidden my-12">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1920&q=80"
            alt="Biker riding"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-8 md:px-16 py-20 md:py-28">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 max-w-lg">
            WALK IN. GEAR UP. <span className="text-brand">RIDE OUT.</span>
          </h2>
          <p className="text-white/60 max-w-md mb-8">
            Visit our store for instant billing with our POS system.
            Scan, bill, print &mdash; all in under 30 seconds.
          </p>
          <Link href="/pos">
            <Button size="lg" className="gap-2 bg-brand hover:bg-brand/90 text-brand-foreground font-bold rounded-xl shadow-2xl shadow-brand/30">
              <Receipt className="h-5 w-5" />
              Start POS Billing
            </Button>
          </Link>
        </div>
      </section>

      {/* 3 Portal Cards */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          <motion.div variants={item}>
            <Link href="/shop" className="group block h-full">
              <div className="relative rounded-2xl overflow-hidden h-full min-h-[280px]">
                <Image
                  src="https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600&h=400&fit=crop"
                  alt="Motorcycle accessories"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="h-12 w-12 rounded-xl bg-brand flex items-center justify-center mb-4 shadow-lg">
                    <ShoppingBag className="h-6 w-6 text-brand-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Online Store</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Browse the full catalog. Order with secure UPI & card payment.
                  </p>
                  <div className="flex items-center text-brand text-sm font-bold gap-1 group-hover:gap-3 transition-all">
                    Shop Now <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/login" className="group block h-full">
              <div className="relative rounded-2xl overflow-hidden h-full min-h-[280px]">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
                  alt="Dashboard analytics"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg">
                    <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Admin Portal</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Inventory, reports, suppliers & RBAC dashboard.
                  </p>
                  <div className="flex items-center text-primary-foreground text-sm font-bold gap-1 group-hover:gap-3 transition-all">
                    Sign In <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/pos" className="group block h-full">
              <div className="relative rounded-2xl overflow-hidden h-full min-h-[280px]">
                <Image
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
                  alt="Point of sale"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">POS Billing</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Quick billing, barcode scan, invoice print & stock sync.
                  </p>
                  <div className="flex items-center text-emerald-400 text-sm font-bold gap-1 group-hover:gap-3 transition-all">
                    Start Billing <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center">
                  <span className="text-brand-foreground font-black text-lg">B</span>
                </div>
                <div>
                  <span className="font-black block leading-none">THE BIKER GENOME</span>
                  <span className="text-[10px] tracking-[0.2em] text-sidebar-foreground/40">PREMIUM RIDING GEAR</span>
                </div>
              </div>
              <p className="text-sm text-sidebar-foreground/50 max-w-sm mt-4">
                Your one-stop destination for motorcycle accessories, helmets, riding gear
                & everything that makes your ride safer and stylish.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Shop</h4>
              <div className="space-y-3 text-sm text-sidebar-foreground/50">
                {["Helmets", "Jackets", "Gloves", "Boots", "Accessories"].map((c) => (
                  <Link key={c} href="/shop" className="block hover:text-brand transition-colors">{c}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <div className="space-y-3 text-sm text-sidebar-foreground/50">
                {["About Us", "Contact", "Returns", "Shipping", "Privacy Policy"].map((c) => (
                  <p key={c} className="hover:text-brand transition-colors cursor-pointer">{c}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-sidebar-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-sidebar-foreground/30">
            <span>&copy; {new Date().getFullYear()} The Biker Genome. All rights reserved.</span>
            <span>Powered by Infiniti Tech Partners</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
