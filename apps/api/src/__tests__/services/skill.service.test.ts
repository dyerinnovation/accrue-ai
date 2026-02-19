import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../repositories/skill.repository.js", () => ({
  skillRepository: {
    findById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getVersions: vi.fn(),
    createVersion: vi.fn(),
  },
}));

vi.mock("../../config/env.js", () => ({
  getEnv: () => ({
    ANTHROPIC_API_KEY: "sk-ant-test",
    CLAUDE_MODEL: "claude-sonnet-4-20250514",
  }),
}));

import { skillService } from "../../services/skill.service.js";
import { skillRepository } from "../../repositories/skill.repository.js";

const mockSkillRepo = vi.mocked(skillRepository);

describe("skillService", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("create", () => {
    it("creates a skill with generated content", async () => {
      mockSkillRepo.create.mockResolvedValue({
        id: "skill-1", name: "Test Skill", slug: "test-skill", description: "A test", content: "content",
        version: 1, status: "DRAFT", authorId: "user-1", teamId: null, tags: [], isPublic: false,
        metadata: null, createdAt: new Date(), updatedAt: new Date(),
      });
      mockSkillRepo.createVersion.mockResolvedValue({
        id: "ver-1", skillId: "skill-1", version: 1, content: "content", changelog: "Initial version",
        metrics: null, createdAt: new Date(),
      });

      const result = await skillService.create({ name: "Test Skill", description: "A test" }, "user-1");
      expect(result.name).toBe("Test Skill");
      expect(mockSkillRepo.create).toHaveBeenCalled();
      expect(mockSkillRepo.createVersion).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("throws if skill not found", async () => {
      mockSkillRepo.findById.mockResolvedValue(null);
      await expect(skillService.getById("missing")).rejects.toThrow("Skill not found");
    });
  });

  describe("delete", () => {
    it("throws if not author", async () => {
      mockSkillRepo.findById.mockResolvedValue({
        id: "skill-1", name: "Test", slug: "test", description: "t", content: "c",
        version: 1, status: "DRAFT", authorId: "other-user", teamId: null, tags: [], isPublic: false,
        metadata: null, createdAt: new Date(), updatedAt: new Date(),
        author: { id: "other-user", email: "other@test.com", name: "Other" }, team: null,
      } as any);
      await expect(skillService.delete("skill-1", "user-1")).rejects.toThrow("Not authorized");
    });
  });
});
