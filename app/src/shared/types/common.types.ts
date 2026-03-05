export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type Role = "owner" | "manager" | "cashier" | "inventory_staff" | "customer";

export type PaymentMethod = "cash" | "upi" | "credit_card" | "debit_card" | "split";

export type OrderStatus = "confirmed" | "shipped" | "delivered" | "cancelled";

export type StockTransactionType =
  | "sale"
  | "purchase"
  | "return"
  | "adjustment"
  | "damaged"
  | "cash_sale";
