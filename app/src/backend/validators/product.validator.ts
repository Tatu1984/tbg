import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string(),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  costPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  mrp: z.number().positive(),
  gstPercentage: z.number().min(0).max(100).default(18),
  stock: z.number().int().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(5),
  availableOnline: z.boolean().default(false),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
});
