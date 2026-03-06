import { NextResponse } from "next/server";
import { logger } from "./logger";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error("AppError", { message: error.message, statusCode: error.statusCode });
    }
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  logger.error("Unhandled error", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack:
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.stack
        : undefined,
  });

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
