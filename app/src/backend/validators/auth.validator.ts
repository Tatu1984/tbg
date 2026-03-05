import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["owner", "manager", "cashier", "inventory_staff"]).default("cashier"),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(2).optional(),
  role: z.enum(["owner", "manager", "cashier", "inventory_staff"]).optional(),
  active: z.boolean().optional(),
});
