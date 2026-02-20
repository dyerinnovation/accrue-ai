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
      const result = await skillService.exportSkill(req.params.id);
      if (result.type === "archive") {
        res.set("Content-Type", "application/gzip");
        res.set("Content-Disposition", `attachment; filename="skill.tar.gz"`);
        res.send(result.archive);
      } else {
        res.json({ success: true, data: { bundle: result.bundle } });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "SKILL_ERROR", message: err instanceof Error ? err.message : "Failed to export skill" } });
    }
  },

  async importSkill(req: AuthenticatedRequest, res: Response) {
    try {
      // Support both JSON bundle and file upload
      if (req.file) {
        const skill = await skillService.importSkillFromArchive(req.file.buffer, req.userId!, req.body.teamId);
        res.status(201).json({ success: true, data: skill });
      } else if (req.body.bundle) {
        const skill = await skillService.importSkillFromJson(req.body.bundle, req.userId!, req.body.teamId);
        res.status(201).json({ success: true, data: skill });
      } else {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Provide a bundle JSON string or upload a tar.gz file" } });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "SKILL_ERROR", message: err instanceof Error ? err.message : "Failed to import skill" } });
    }
  },

  // File management endpoints
  async uploadFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      if (files.length === 0) {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "No files provided" } });
        return;
      }

      const fileEntries = files.map((f) => ({
        path: f.originalname,
        buffer: f.buffer,
        mimetype: f.mimetype,
      }));

      const result = await skillService.uploadFiles(req.params.id, req.userId!, fileEntries);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload files";
      const status = message === "Not authorized" ? 403 : message === "Skill not found" ? 404 : 500;
      res.status(status).json({ success: false, error: { code: "SKILL_ERROR", message } });
    }
  },

  async listFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const files = await skillService.listFiles(req.params.id);
      res.json({ success: true, data: files });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "SKILL_ERROR", message: err instanceof Error ? err.message : "Failed to list files" } });
    }
  },

  async getFile(req: AuthenticatedRequest, res: Response) {
    try {
      const filePath = req.params[0]; // Express wildcard param
      if (!filePath) {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "File path required" } });
        return;
      }
      const data = await skillService.getFile(req.params.id, filePath);
      res.set("Content-Type", "application/octet-stream");
      res.send(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get file";
      const status = message === "File not found" ? 404 : message === "Skill not found" ? 404 : 500;
      res.status(status).json({ success: false, error: { code: "SKILL_ERROR", message } });
    }
  },

  async downloadSkill(req: AuthenticatedRequest, res: Response) {
    try {
      const { archive, filename } = await skillService.downloadSkill(req.params.id);
      res.set("Content-Type", "application/gzip");
      res.set("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(archive);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to download skill";
      res.status(message === "Skill not found" ? 404 : 500).json({ success: false, error: { code: "SKILL_ERROR", message } });
    }
  },
};
