import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { teamService } from "../services/team.service.js";
import { skillService } from "../services/skill.service.js";

export const teamController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const teams = await teamService.list(req.userId!);
      res.json({ success: true, data: teams });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "TEAM_ERROR", message: err instanceof Error ? err.message : "Failed to list teams" } });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const team = await teamService.create(req.body.name, req.userId!);
      res.status(201).json({ success: true, data: team });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "TEAM_ERROR", message: err instanceof Error ? err.message : "Failed to create team" } });
    }
  },

  async getSkills(req: AuthenticatedRequest, res: Response) {
    try {
      await teamService.getById(req.params.id, req.userId!);
      const result = await skillService.list({ page: 1, pageSize: 100, teamId: req.params.id });
      res.json({ success: true, data: result.skills });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "TEAM_ERROR", message: err instanceof Error ? err.message : "Failed to get team skills" } });
    }
  },

  async addMember(req: AuthenticatedRequest, res: Response) {
    try {
      const member = await teamService.addMember(req.params.id, req.body.email, req.body.role, req.userId!);
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add member";
      const status = message === "Not authorized to add members" ? 403 : message === "User not found" ? 404 : 500;
      res.status(status).json({ success: false, error: { code: "TEAM_ERROR", message } });
    }
  },
};
