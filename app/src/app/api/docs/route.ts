import { NextResponse } from "next/server";

const apiDocs = {
  openapi: "3.0.3",
  info: {
    title: "The Biker Genome API",
    version: "1.0.0",
    description: "REST API for TBG billing, inventory, and e-commerce platform",
  },
  servers: [
    { url: "/api", description: "Current server" },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["System"],
        responses: {
          200: { description: "Healthy" },
          503: { description: "Unhealthy - database connection failed" },
        },
      },
    },
    "/auth": {
      post: {
        summary: "Staff login",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful, returns JWT token" },
          401: { description: "Invalid credentials" },
          429: { description: "Rate limited" },
        },
      },
    },
    "/products": {
      get: {
        summary: "List products",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Product list" } },
      },
      post: {
        summary: "Create product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Product created" } },
      },
      put: {
        summary: "Update product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Product updated" } },
      },
      delete: {
        summary: "Soft delete product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "query", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Product deactivated" } },
      },
    },
    "/billing": {
      get: {
        summary: "List invoices",
        tags: ["Billing"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: { 200: { description: "Invoice list with total count" } },
      },
      post: {
        summary: "Create invoice",
        tags: ["Billing"],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Invoice created (atomic with stock update)" } },
      },
    },
    "/inventory": {
      get: {
        summary: "List stock transactions",
        tags: ["Inventory"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Transaction list" } },
      },
      post: {
        summary: "Create stock transaction",
        tags: ["Inventory"],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Stock updated" } },
      },
    },
    "/suppliers": {
      get: { summary: "List suppliers", tags: ["Suppliers"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Supplier list" } } },
      post: { summary: "Create supplier", tags: ["Suppliers"], security: [{ bearerAuth: [] }], responses: { 201: { description: "Supplier created" } } },
      put: { summary: "Update supplier", tags: ["Suppliers"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Supplier updated" } } },
    },
    "/orders": {
      get: {
        summary: "List orders (admin)",
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Order list with total count" } },
      },
      put: { summary: "Update order status", tags: ["Orders"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Order updated" } } },
    },
    "/users": {
      get: { summary: "List users", tags: ["Users"], security: [{ bearerAuth: [] }], responses: { 200: { description: "User list (owner/manager only)" } } },
      post: { summary: "Create user", tags: ["Users"], security: [{ bearerAuth: [] }], responses: { 201: { description: "User created (owner only)" } } },
      put: { summary: "Update user", tags: ["Users"], security: [{ bearerAuth: [] }], responses: { 200: { description: "User updated (owner only)" } } },
    },
    "/reports": {
      get: {
        summary: "Get reports",
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "type", in: "query", schema: { type: "string", enum: ["summary", "low-stock"] } }],
        responses: { 200: { description: "Report data" } },
      },
    },
    "/shop/auth": {
      post: {
        summary: "Customer login/register",
        tags: ["Shop"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  action: { type: "string", enum: ["login", "register"] },
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                  name: { type: "string" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          201: { description: "Registration successful" },
          429: { description: "Rate limited" },
        },
      },
    },
    "/shop/products": {
      get: {
        summary: "Public product listing",
        tags: ["Shop"],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "price-low", "price-high"] } },
        ],
        responses: { 200: { description: "Product catalog" } },
      },
    },
    "/shop/cart": {
      get: { summary: "Get cart", tags: ["Shop"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Cart items" } } },
      post: { summary: "Add to cart", tags: ["Shop"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Item added/updated" } } },
      delete: {
        summary: "Remove from cart",
        tags: ["Shop"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "productId", in: "query", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Item removed" } },
      },
    },
    "/shop/orders": {
      get: { summary: "Customer orders", tags: ["Shop"], security: [{ bearerAuth: [] }], responses: { 200: { description: "Order history" } } },
      post: { summary: "Place order", tags: ["Shop"], security: [{ bearerAuth: [] }], responses: { 201: { description: "Order placed (atomic transaction)" } } },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(apiDocs);
}
