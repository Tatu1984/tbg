import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
