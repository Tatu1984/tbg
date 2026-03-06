import { NextResponse } from "next/server";

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
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Structured error logging
  const errorInfo = {
    message: error instanceof Error ? error.message : "Unknown error",
    stack:
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.stack
        : undefined,
    timestamp: new Date().toISOString(),
  };
  console.error("[API Error]", JSON.stringify(errorInfo));

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
