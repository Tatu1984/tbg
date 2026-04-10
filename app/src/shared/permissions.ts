/**
 * Shared permissions types and constants used by both client and server.
 * The actual storage and enforcement live in:
 *   - server: src/backend/auth/permissions.ts (DB-backed, authoritative)
 *   - client: src/frontend/hooks/useRolePermissions.ts (fetched from API)
 */

export type NavKey =
  | "dashboard"
  | "pos"
  | "invoices"
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
  invoices: "Invoice History",
  products: "Products",
  inventory: "Inventory",
  suppliers: "Suppliers",
  orders: "Orders",
  reports: "Reports",
  users: "Users",
  settings: "Settings",
};

export const ALL_PAGES: NavKey[] = [
  "dashboard",
  "pos",
  "invoices",
  "products",
  "inventory",
  "suppliers",
  "orders",
  "reports",
  "users",
  "settings",
];

/** Roles whose page-access can be configured by an owner. */
export const CONFIGURABLE_ROLES = ["manager", "cashier", "inventory_staff"] as const;
export type ConfigurableRole = (typeof CONFIGURABLE_ROLES)[number];

export const ROLE_LABELS: Record<ConfigurableRole, string> = {
  manager: "Manager",
  cashier: "Cashier",
  inventory_staff: "Inventory Staff",
};

export type RolePermissions = Record<ConfigurableRole, NavKey[]>;

/** Defaults applied when no row exists in the Setting table. */
export const DEFAULT_PERMISSIONS: RolePermissions = {
  manager: [
    "dashboard",
    "pos",
    "invoices",
    "products",
    "inventory",
    "suppliers",
    "orders",
    "reports",
    "users",
  ],
  cashier: ["dashboard", "pos", "invoices"],
  inventory_staff: ["dashboard", "products", "inventory", "suppliers"],
};

/** ID used for the singleton Setting row that stores role permissions. */
export const ROLE_PERMISSIONS_SETTING_ID = "role-permissions";

/**
 * Pure helper — given a role string and a permissions map, return the
 * pages that role is allowed to access. Owner always gets every page.
 * Customer (the storefront role) is intentionally not granted any
 * dashboard pages.
 */
export function allowedPagesFor(
  role: string,
  permissions: RolePermissions
): NavKey[] {
  if (role === "owner") return ALL_PAGES;
  if (role in permissions) {
    return permissions[role as ConfigurableRole];
  }
  return [];
}

export function canAccessPage(
  role: string,
  page: NavKey,
  permissions: RolePermissions
): boolean {
  return allowedPagesFor(role, permissions).includes(page);
}
