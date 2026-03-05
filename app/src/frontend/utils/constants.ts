export const APP_NAME = "The Biker Genome";
export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "\u20B9";
export const GST_DEFAULT = 18;

export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  CASHIER: "cashier",
  INVENTORY_STAFF: "inventory_staff",
  CUSTOMER: "customer",
} as const;

export const PAYMENT_METHODS = {
  CASH: "cash",
  UPI: "upi",
  CREDIT_CARD: "credit_card",
  DEBIT_CARD: "debit_card",
  SPLIT: "split",
} as const;

export const ORDER_STATUSES = {
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
