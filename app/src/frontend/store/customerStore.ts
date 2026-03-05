import { create } from "zustand";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface CartProduct {
  id: string;
  name: string;
  brand: string | null;
  sellingPrice: number;
  mrp: number;
  stock: number;
  imageUrl: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
}

interface CustomerState {
  customer: Customer | null;
  token: string | null;
  cart: CartItem[];
  setCustomerAuth: (customer: Customer, token: string) => void;
  clearCustomerAuth: () => void;
  hydrateCustomer: () => void;
  setCart: (items: CartItem[]) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customer: null,
  token: null,
  cart: [],
  setCustomerAuth: (customer, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("customer_token", token);
      localStorage.setItem("customer", JSON.stringify(customer));
    }
    set({ customer, token });
  },
  clearCustomerAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("customer_token");
      localStorage.removeItem("customer");
    }
    set({ customer: null, token: null, cart: [] });
  },
  hydrateCustomer: () => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("customer_token");
      const customerStr = localStorage.getItem("customer");
      if (token && customerStr) {
        set({ token, customer: JSON.parse(customerStr) });
      }
    } catch {
      // ignore
    }
  },
  setCart: (items) => set({ cart: items }),
}));
