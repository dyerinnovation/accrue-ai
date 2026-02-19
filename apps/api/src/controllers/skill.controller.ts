import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { skillService } from "../services/skill.service.js";

export const skillController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await skillService.list({
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 20,
        search: req.query.search as string | undefined,
        tags: req.query.tags as string | undefined,
        status: req.query.status as any,
        teamId: req.query.teamId as string | undefined,
        authorId: req.userId,
      });
      res.json({ success: true, data: result.skills, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "SKILL_ERROR", message: err instanceof Error ? err.message : "Failed to list skills" } });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const skill = await skillService.getById(req.params.id);
      res.json({ success: true, data: skill });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get skill";
      res.status(message === "Skill not found" ? 404 : 500).json({ success: false, error: { code: "SKILL_ERROR", message } });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const skill = await skillService.create(req.body, req.userId!);
      res.status(201).json({ success: true, data: skill });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "SKILL_ERROR", message: err instanceof Error ? err.message : "Failed to create skill" } });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const skill = await skillService.update(req.params.id, req.body, req.userId!);
      res.json({ success: true, data: skill });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update skill";
      const status = message === "Not authorized" ? 403 : message === "Skill not found" ? 404 : 500;
      res.status(status).json({ success: false, error: { code: "SKILL_ERROR", message } });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      await skillService.delete(req.params.id, req.userId!);
      res.json({ success: true, data: { message: "Skill deleted" } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete skill";
      const status = message === "Not authorized" ? 403 : message === "Skill not found" ? 404 : 500;
      res.status(status).json({ success: false, error: { code: "SKILL_ERROR", message } });
    }
  },

  async getVersions(req: AuthenticatedRequest, res: Response) {
    try {
      const versions = await skillService.getVersions(req.params.id);
      res.json({ success: true, data: versions });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "SKILL_ERROR", message: err instanceof Error ? err.message : "Failed to get versions" } });
    }
  },

  async publish(req: AuthenticatedRequest, res: Response) {
    try {
      const skill = await skillService.publish(req.params.id, req.userId!);
      res.json({ success: true, data: skill });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish skill";
      res.status(message.includes("validation") ? 400 : 500).json({ success: false, error: { code: "SKILL_ERROR", message } });
    }
  },

  async iterate(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await skillService.iterate(req.params.id, req.body.feedback, req.userId!);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "SKILL_ERROR", message: err instanceof Error ? err.message : "Failed to iterate skill" } });
    }
  },

  async exportSkill(req: AuthenticatedRequest, res: Response) {
    try {
      const bundle = await skillService.exportSkill(req.params.id);
      res.json({ success: true, data: { bundle } });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "SKILL_ERROR", message: err instanceof Error ? err.message : "Failed to export skill" } });
    }
  },

  async importSkill(req: AuthenticatedRequest, res: Response) {
    try {
      const skill = await skillService.importSkill(req.body.bundle, req.userId!, req.body.teamId);
      res.status(201).json({ success: true, data: skill });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "SKILL_ERROR", message: err instanceof Error ? err.message : "Failed to import skill" } });
    }
  },
};
