import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { evalService } from "../services/eval.service.js";

export const evalController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await evalService.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "EVAL_ERROR", message: err instanceof Error ? err.message : "Failed to create eval" } });
    }
  },

  async run(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await evalService.run(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "EVAL_ERROR", message: err instanceof Error ? err.message : "Failed to run eval" } });
    }
  },

  async getResults(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await evalService.getResults(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "EVAL_ERROR", message: err instanceof Error ? err.message : "Failed to get eval results" } });
    }
  },
};
