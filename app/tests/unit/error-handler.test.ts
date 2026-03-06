import { describe, it, expect } from "vitest";
import { AppError, handleError } from "@/backend/utils/error-handler.util";

describe("Error Handler", () => {
  describe("AppError", () => {
    it("creates error with message and status", () => {
      const err = new AppError("Not found", 404);
      expect(err.message).toBe("Not found");
      expect(err.statusCode).toBe(404);
      expect(err).toBeInstanceOf(Error);
    });

    it("defaults to 500 status", () => {
      const err = new AppError("Server error");
      expect(err.statusCode).toBe(500);
    });
  });

  describe("handleError", () => {
    it("returns proper response for AppError", async () => {
      const response = handleError(new AppError("Bad request", 400));
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Bad request");
    });

    it("returns 500 for unknown errors", async () => {
      const response = handleError(new Error("unexpected"));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Internal server error");
    });

    it("returns 500 for non-Error objects", async () => {
      const response = handleError("string error");
      expect(response.status).toBe(500);
    });
  });
});
