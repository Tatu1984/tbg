export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  POS: "/pos",
  PRODUCTS: "/products",
  INVENTORY: "/inventory",
  SUPPLIERS: "/suppliers",
  ORDERS: "/orders",
  REPORTS: "/reports",
  USERS: "/users",
  SETTINGS: "/settings",
  SHOP: "/shop",
  CART: "/cart",
  CHECKOUT: "/checkout",
} as const;

export const API_ROUTES = {
  AUTH: "/api/auth",
  USERS: "/api/users",
  PRODUCTS: "/api/products",
  BILLING: "/api/billing",
  INVENTORY: "/api/inventory",
  SUPPLIERS: "/api/suppliers",
  REPORTS: "/api/reports",
  ORDERS: "/api/orders",
} as const;
