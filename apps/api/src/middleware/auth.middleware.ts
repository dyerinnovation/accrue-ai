import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@accrue-ai/auth";
import { getEnv } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization header" } });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token, getEnv().JWT_SECRET);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
  }
}
