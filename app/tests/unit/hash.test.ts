import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/backend/utils/hash.util";

describe("Hash Utility", () => {
  it("hashes a password", async () => {
    const hash = await hashPassword("test123");
    expect(hash).toBeDefined();
    expect(hash).not.toBe("test123");
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("verifies correct password", async () => {
    const hash = await hashPassword("test123");
    const result = await verifyPassword("test123", hash);
    expect(result).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("test123");
    const result = await verifyPassword("wrong", hash);
    expect(result).toBe(false);
  });

  it("produces different hashes for same password", async () => {
    const hash1 = await hashPassword("test123");
    const hash2 = await hashPassword("test123");
    expect(hash1).not.toBe(hash2);
  });
});
