import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .default("file:./dev.db"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters in production")
    .default("dev-secret-change-in-production-32chars!!"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment validation failed:", parsed.error.format());
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variables for production");
  }
}

export const env = parsed.success
  ? parsed.data
  : (envSchema.parse({
      ...process.env,
      JWT_SECRET:
        process.env.JWT_SECRET || "dev-secret-change-in-production-32chars!!",
    }) as z.infer<typeof envSchema>);
