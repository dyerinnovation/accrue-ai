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

  it("always includes SKILL.md as first file entry", () => {
    const result = createSkill({
      name: "File Skill",
      description: "A skill with files",
    });

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.path).toBe("SKILL.md");
    expect(result.files[0]!.contentType).toBe("text/markdown");
    expect(result.files[0]!.content).toBe(result.content);
  });

  it("appends additional files to file entries", () => {
    const result = createSkill({
      name: "Script Skill",
      description: "A skill with scripts",
      files: [
        { path: "scripts/run.py", content: "print('hello')", contentType: "text/x-python" },
        { path: "templates/output.md", content: "# Output", contentType: "text/markdown" },
      ],
    });

    expect(result.files).toHaveLength(3);
    expect(result.files[0]!.path).toBe("SKILL.md");
    expect(result.files[1]!.path).toBe("scripts/run.py");
    expect(result.files[2]!.path).toBe("templates/output.md");
  });
});
