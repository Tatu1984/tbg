export const ERRORS = {
  UNAUTHORIZED: "You must be logged in to access this resource",
  FORBIDDEN: "You do not have permission to access this resource",
  NOT_FOUND: "Resource not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_EXISTS: "An account with this email already exists",
  INSUFFICIENT_STOCK: "Insufficient stock for this product",
  INVALID_INPUT: "Invalid input data",
} as const;
