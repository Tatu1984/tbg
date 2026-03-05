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

  console.error("Unhandled error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
