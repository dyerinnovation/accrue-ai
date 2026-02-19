import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { wizardService } from "../services/wizard.service.js";

export const wizardController = {
  async start(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await wizardService.start(req.userId!, req.body.intent);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "WIZARD_ERROR", message: err instanceof Error ? err.message : "Failed to start wizard" } });
    }
  },

  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await wizardService.sendMessage(req.params.sessionId, req.userId!, req.body.message);
      res.json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      const status = message === "Session not found" ? 404 : message === "Not authorized" ? 403 : 500;
      res.status(status).json({ success: false, error: { code: "WIZARD_ERROR", message } });
    }
  },

  async getSession(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await wizardService.getSession(req.params.sessionId, req.userId!);
      res.json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get session";
      const status = message === "Session not found" ? 404 : message === "Not authorized" ? 403 : 500;
      res.status(status).json({ success: false, error: { code: "WIZARD_ERROR", message } });
    }
  },
};
