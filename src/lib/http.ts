import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "internal_error") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function jsonSuccess<T>(data: T, options?: { message?: string; status?: number }) {
  return NextResponse.json(
    {
      success: true,
      data,
      message: options?.message,
    },
    { status: options?.status ?? 200 }
  );
}

export function jsonError(error: unknown, fallbackMessage: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Dados inválidos",
        details: error.flatten(),
      },
      { status: 422 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.status }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: fallbackMessage,
    },
    { status: 500 }
  );
}
