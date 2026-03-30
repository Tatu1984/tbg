"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  User,
  Search,
  Package,
  LogIn,
  LogOut,
  UserPlus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/frontend/store/customerStore";

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      params.delete("category");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex-1 max-w-md mx-8 hidden md:block">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search helmets, jackets, gloves..."
          className="pl-9 pr-9 bg-muted/50 border-0 focus-visible:ring-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(query);
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              handleSearch("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}

const categories = [
  "All",
  "Helmets",
  "Riding Jackets",
  "Riding Gloves",
  "Riding Boots",
  "Bike Accessories",
  "Luggage & Bags",
  "Protection Gear",
];

function CategoryNav() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";

  return (
    <nav aria-label="Product categories" className="flex items-center gap-1 -mb-px overflow-x-auto pb-0">
      {categories.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <Link
            key={cat}
            href={cat === "All" ? "/shop" : `/shop?category=${encodeURIComponent(cat)}`}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {cat}
          </Link>
        );
      })}
    </nav>
  );
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { customer, token, hydrateCustomer, clearCustomerAuth } = useCustomerStore();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    hydrateCustomer();
  }, [hydrateCustomer]);

  useEffect(() => {
    if (token) {
      fetch("/api/shop/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const items = data.items || [];
          setCartCount(items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0));
        })
        .catch(() => {});
    } else {
      setCartCount(0);
    }
  }, [token, pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to content */}
      <a href="#shop-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        Skip to main content
      </a>

      {/* Top bar */}
      <div className="bg-sidebar text-sidebar-foreground text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="text-sidebar-foreground/60">
            Free shipping on orders above &#8377;2,000
          </span>
          <div className="flex items-center gap-4 text-sidebar-foreground/60">
            <Link href="/login" className="hover:text-sidebar-foreground transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b" role="banner">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/shop" className="flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center">
                <span className="text-brand-foreground font-bold">B</span>
              </div>
              <span className="text-lg font-bold tracking-tight hidden sm:inline">
                The Biker Genome
              </span>
            </Link>

            {/* Search */}
            <SearchBar />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href="/shop">
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search products">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}>
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-brand text-brand-foreground">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {customer ? (
                    <>
                      <div className="px-2 py-1.5 text-sm font-medium">{customer.name}</div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/my-orders" className="gap-2">
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-destructive"
                        onClick={() => clearCustomerAuth()}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/customer-login" className="gap-2">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register" className="gap-2">
                          <UserPlus className="h-4 w-4" />
                          Create Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/my-orders" className="gap-2">
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Category nav */}
          <Suspense fallback={null}>
            <CategoryNav />
          </Suspense>
        </div>
      </header>

      {/* Page */}
      <main id="shop-content" className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center">
                  <span className="text-brand-foreground font-bold">B</span>
                </div>
                <span className="font-bold">The Biker Genome</span>
              </div>
              <p className="text-sm text-sidebar-foreground/60">
                Your one-stop shop for premium bike accessories and riding gear.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Shop</h4>
              <div className="space-y-2 text-sm text-sidebar-foreground/60">
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Helmets</p>
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Jackets</p>
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Gloves</p>
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Boots</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Support</h4>
              <div className="space-y-2 text-sm text-sidebar-foreground/60">
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Contact Us</p>
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Returns</p>
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Shipping</p>
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">FAQ</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <div className="space-y-2 text-sm text-sidebar-foreground/60">
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Privacy Policy</p>
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Terms of Service</p>
                <p className="hover:text-sidebar-foreground cursor-pointer transition-colors">Refund Policy</p>
              </div>
            </div>
          </div>
          <div className="border-t border-sidebar-border mt-8 pt-6 text-center text-xs text-sidebar-foreground/40">
            &copy; {new Date().getFullYear()} The Biker Genome. All rights
            reserved. Powered by Infiniti Tech Partners.
          </div>
        </div>
      </footer>
    </div>
  );
}
