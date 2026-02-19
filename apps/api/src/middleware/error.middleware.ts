import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error("Unhandled error:", err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid request data", details: err.flatten().fieldErrors },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
  });
}
