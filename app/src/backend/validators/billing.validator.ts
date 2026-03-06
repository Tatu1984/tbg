import { z } from "zod";

export const createInvoiceSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        discount: z.number().min(0).default(0),
      })
    )
    .min(1, "At least one item is required"),
  paymentMethod: z.enum(["cash", "upi", "credit_card", "debit_card", "split"]),
  paymentDetail: z.string().optional(),
  discount: z.number().min(0).default(0),
});
