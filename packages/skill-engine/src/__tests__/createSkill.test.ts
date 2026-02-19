import { describe, it, expect } from "vitest";
import { createSkill } from "../createSkill.js";

describe("createSkill", () => {
  it("creates a skill with correct name and slug", () => {
    const result = createSkill({
      name: "Test Skill",
      description: "A test skill",
    });

    expect(result.name).toBe("Test Skill");
    expect(result.slug).toBe("test-skill");
    expect(result.description).toBe("A test skill");
  });

  it("generates valid SKILL.md content", () => {
    const result = createSkill({
      name: "Code Review",
      description: "Reviews code for quality issues",
      tags: ["code", "review"],
      purpose: "Help review code",
      instructions: "Step 1: Read the code\nStep 2: Find issues",
    });

    expect(result.content).toContain("name: Code Review");
    expect(result.content).toContain("Reviews code for quality issues");
    expect(result.content).toContain("## Purpose");
    expect(result.content).toContain("Help review code");
    expect(result.content).toContain("## Instructions");
    expect(result.tags).toEqual(["code", "review"]);
  });

  it("uses defaults for optional fields", () => {
    const result = createSkill({
      name: "Simple Skill",
      description: "A simple one",
    });

    expect(result.content).toContain("## Purpose");
    expect(result.content).toContain("Describe the purpose");
    expect(result.tags).toEqual([]);
  });
});
