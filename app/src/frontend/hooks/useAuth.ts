"use client";

import { useAuthStore } from "@/frontend/store/authStore";

export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore();

  const isAuthenticated = !!token;
  const isOwner = user?.role === "owner";
  const isManager = user?.role === "manager";
  const isCashier = user?.role === "cashier";

  return { user, token, isAuthenticated, isOwner, isManager, isCashier, setAuth, clearAuth };
}
