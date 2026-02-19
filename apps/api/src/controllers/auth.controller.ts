import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      const status = message === "Email already registered" ? 409 : 500;
      res.status(status).json({ success: false, error: { code: "AUTH_ERROR", message } });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(401).json({ success: false, error: { code: "AUTH_ERROR", message: "Invalid credentials" } });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(401).json({ success: false, error: { code: "AUTH_ERROR", message: "Invalid refresh token" } });
    }
  },

  async logout(_req: Request, res: Response) {
    res.json({ success: true, data: { message: "Logged out successfully" } });
  },
};
