import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Biker Genome/i);
  });

  test("shop page loads products", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input")).toBeVisible();
  });

  test("health endpoint returns healthy", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("healthy");
  });

  test("API docs endpoint returns OpenAPI spec", async ({ request }) => {
    const response = await request.get("/api/docs");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.openapi).toBe("3.0.3");
    expect(body.paths).toBeDefined();
  });

  test("unauthenticated API returns 401", async ({ request }) => {
    const response = await request.get("/api/products");
    expect(response.status()).toBe(401);
  });

  test("rate limiting returns 429 after too many requests", async ({ request }) => {
    const promises = [];
    for (let i = 0; i < 25; i++) {
      promises.push(
        request.post("/api/auth", {
          data: { username: "test", password: "test" },
        })
      );
    }
    const responses = await Promise.all(promises);
    const statuses = responses.map((r) => r.status());
    expect(statuses).toContain(429);
  });
});
