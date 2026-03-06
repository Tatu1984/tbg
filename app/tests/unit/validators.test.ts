import { describe, it, expect } from "vitest";
import { loginSchema, createUserSchema, updateUserSchema } from "@/backend/validators/auth.validator";
import { createProductSchema, updateProductSchema } from "@/backend/validators/product.validator";
import { createInvoiceSchema } from "@/backend/validators/billing.validator";

describe("Auth Validators", () => {
  describe("loginSchema", () => {
    it("accepts valid login", () => {
      const result = loginSchema.safeParse({ username: "admin", password: "pass123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty username", () => {
      const result = loginSchema.safeParse({ username: "", password: "pass123" });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({ username: "admin", password: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing fields", () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("createUserSchema", () => {
    it("accepts valid user", () => {
      const result = createUserSchema.safeParse({
        username: "testuser",
        password: "password123",
        name: "Test User",
        role: "cashier",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short username", () => {
      const result = createUserSchema.safeParse({
        username: "ab",
        password: "password123",
        name: "Test User",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = createUserSchema.safeParse({
        username: "testuser",
        password: "12345",
        name: "Test User",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid role", () => {
      const result = createUserSchema.safeParse({
        username: "testuser",
        password: "password123",
        name: "Test User",
        role: "superadmin",
      });
      expect(result.success).toBe(false);
    });

    it("defaults role to cashier", () => {
      const result = createUserSchema.safeParse({
        username: "testuser",
        password: "password123",
        name: "Test User",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("cashier");
      }
    });
  });

  describe("updateUserSchema", () => {
    it("accepts partial updates", () => {
      const result = updateUserSchema.safeParse({ name: "New Name" });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = updateUserSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe("Product Validators", () => {
  describe("createProductSchema", () => {
    it("accepts valid product", () => {
      const result = createProductSchema.safeParse({
        sku: "BG-001",
        name: "Test Helmet",
        categoryId: "cat-123",
        costPrice: 1000,
        sellingPrice: 1500,
        mrp: 2000,
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative prices", () => {
      const result = createProductSchema.safeParse({
        sku: "BG-001",
        name: "Test Helmet",
        categoryId: "cat-123",
        costPrice: -100,
        sellingPrice: 1500,
        mrp: 2000,
      });
      expect(result.success).toBe(false);
    });

    it("rejects GST over 100", () => {
      const result = createProductSchema.safeParse({
        sku: "BG-001",
        name: "Test Helmet",
        categoryId: "cat-123",
        costPrice: 1000,
        sellingPrice: 1500,
        mrp: 2000,
        gstPercentage: 150,
      });
      expect(result.success).toBe(false);
    });

    it("defaults GST to 18", () => {
      const result = createProductSchema.safeParse({
        sku: "BG-001",
        name: "Test Helmet",
        categoryId: "cat-123",
        costPrice: 1000,
        sellingPrice: 1500,
        mrp: 2000,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gstPercentage).toBe(18);
      }
    });

    it("rejects invalid image URL", () => {
      const result = createProductSchema.safeParse({
        sku: "BG-001",
        name: "Test Helmet",
        categoryId: "cat-123",
        costPrice: 1000,
        sellingPrice: 1500,
        mrp: 2000,
        imageUrl: "not-a-url",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateProductSchema", () => {
    it("accepts partial updates", () => {
      const result = updateProductSchema.safeParse({ name: "Updated Name" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid price in update", () => {
      const result = updateProductSchema.safeParse({ sellingPrice: -50 });
      expect(result.success).toBe(false);
    });
  });
});

describe("Billing Validators", () => {
  describe("createInvoiceSchema", () => {
    it("accepts valid invoice", () => {
      const result = createInvoiceSchema.safeParse({
        items: [{ productId: "prod-1", quantity: 2 }],
        paymentMethod: "cash",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty items", () => {
      const result = createInvoiceSchema.safeParse({
        items: [],
        paymentMethod: "cash",
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero quantity", () => {
      const result = createInvoiceSchema.safeParse({
        items: [{ productId: "prod-1", quantity: 0 }],
        paymentMethod: "cash",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid payment method", () => {
      const result = createInvoiceSchema.safeParse({
        items: [{ productId: "prod-1", quantity: 1 }],
        paymentMethod: "bitcoin",
      });
      expect(result.success).toBe(false);
    });

    it("defaults discount to 0", () => {
      const result = createInvoiceSchema.safeParse({
        items: [{ productId: "prod-1", quantity: 1 }],
        paymentMethod: "upi",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.discount).toBe(0);
      }
    });
  });
});
