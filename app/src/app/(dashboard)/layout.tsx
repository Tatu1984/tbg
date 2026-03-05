"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  Receipt,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/frontend/hooks/useAuth";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pos", icon: Receipt, label: "POS Billing" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/suppliers", icon: Truck, label: "Suppliers" },
  { href: "/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/users", icon: Users, label: "Users" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth, hydrate } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Redirect to login if not authenticated (after hydration attempt)
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

  function handleSignOut() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
            <span className="text-brand-foreground font-bold">B</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight truncate">
              The Biker Genome
            </span>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Nav */}
        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-1 px-2">
            {navItems.map((navItem) => {
              const isActive = pathname === navItem.href;
              const NavIcon = navItem.icon;

              const linkContent = (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <NavIcon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive && "text-brand"
                    )}
                  />
                  {!collapsed && <span>{navItem.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={navItem.href} delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {navItem.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>
        </ScrollArea>

        {/* Collapse btn */}
        <div className="px-2 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          collapsed ? "ml-[68px]" : "ml-[240px]"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b bg-background/80 backdrop-blur-sm">
          <h2 className="text-lg font-semibold capitalize">
            {pathname.split("/").pop() || "Dashboard"}
          </h2>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="p-4 border-b">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <p className="text-xs text-muted-foreground">You have 3 unread alerts</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {[
                    { title: "Low Stock Alert", desc: "Rynox Air GT Gloves - only 2 left", time: "5 min ago", type: "warning" },
                    { title: "New Online Order", desc: "ORD-2041 - Rahul Sharma (Rs 17,890)", time: "12 min ago", type: "info" },
                    { title: "Out of Stock", desc: "AGV K3 SV Helmet - stock depleted", time: "1 hour ago", type: "error" },
                    { title: "Payment Received", desc: "INV-1042 - Rs 6,200 via UPI", time: "2 hours ago", type: "success" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                        </div>
                        {i < 3 && <span className="h-2 w-2 rounded-full bg-brand shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t">
                  <Button variant="ghost" className="w-full text-xs h-8">View all notifications</Button>
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 pl-2 pr-3 h-9"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">
                    {user?.name || "User"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
