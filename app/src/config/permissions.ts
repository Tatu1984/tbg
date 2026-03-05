export type NavKey =
  | "dashboard"
  | "pos"
  | "products"
  | "inventory"
  | "suppliers"
  | "orders"
  | "reports"
  | "users"
  | "settings";

export const NAV_LABELS: Record<NavKey, string> = {
  dashboard: "Dashboard",
  pos: "POS Billing",
  products: "Products",
  inventory: "Inventory",
  suppliers: "Suppliers",
  orders: "Orders",
  reports: "Reports",
  users: "Users",
  settings: "Settings",
};

export const CONFIGURABLE_ROLES = ["manager", "cashier", "inventory_staff"] as const;
export type ConfigurableRole = (typeof CONFIGURABLE_ROLES)[number];

export const ROLE_LABELS: Record<ConfigurableRole, string> = {
  manager: "Manager",
  cashier: "Cashier",
  inventory_staff: "Inventory Staff",
};

// Pages that can be toggled per role (owner always has full access)
export const CONFIGURABLE_PAGES: NavKey[] = [
  "dashboard",
  "pos",
  "products",
  "inventory",
  "suppliers",
  "orders",
  "reports",
  "users",
  "settings",
];

export type RolePermissions = Record<ConfigurableRole, NavKey[]>;

const DEFAULT_PERMISSIONS: RolePermissions = {
  manager: ["dashboard", "pos", "products", "inventory", "suppliers", "orders", "reports", "users"],
  cashier: ["dashboard", "pos"],
  inventory_staff: ["dashboard", "products", "inventory", "suppliers"],
};

const STORAGE_KEY = "tbg-role-permissions";

export function getRolePermissions(): RolePermissions {
  if (typeof window === "undefined") return DEFAULT_PERMISSIONS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PERMISSIONS, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_PERMISSIONS;
}

export function saveRolePermissions(perms: RolePermissions): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
}

export function getAllowedPages(role: string): NavKey[] {
  if (role === "owner") return CONFIGURABLE_PAGES;
  const perms = getRolePermissions();
  return perms[role as ConfigurableRole] ?? ["dashboard"];
}

export function canAccessPage(role: string, page: NavKey): boolean {
  return getAllowedPages(role).includes(page);
}
