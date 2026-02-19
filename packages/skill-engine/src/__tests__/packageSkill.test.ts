import { describe, it, expect } from "vitest";
import { packageSkill } from "../packageSkill.js";
import { importSkill } from "../importSkill.js";

const SAMPLE_SKILL = `---
name: packaged-skill
description: A skill to package
tags: [test]
version: 2
---

# Packaged Skill

## Purpose
Testing packaging.

## Instructions
Package this skill.
`;

describe("packageSkill", () => {
  it("creates a valid JSON bundle", () => {
    const bundle = packageSkill(SAMPLE_SKILL);
    const parsed = JSON.parse(bundle);

    expect(parsed.metadata.name).toBe("packaged-skill");
    expect(parsed.metadata.version).toBe(2);
    expect(parsed.content).toBe(SAMPLE_SKILL);
    expect(parsed.exportedAt).toBeTruthy();
  });

  it("includes assets when provided", () => {
    const bundle = packageSkill(SAMPLE_SKILL, { "ref.md": "# Reference" });
    const parsed = JSON.parse(bundle);

    expect(parsed.assets["ref.md"]).toBe("# Reference");
  });
});

describe("importSkill", () => {
  it("imports a valid bundle", () => {
    const bundle = packageSkill(SAMPLE_SKILL);
    const result = importSkill(bundle);

    expect(result.skill.name).toBe("packaged-skill");
    expect(result.skill.slug).toBe("packaged-skill");
    expect(result.skill.version).toBe(2);
    expect(result.skill.content).toBe(SAMPLE_SKILL);
  });

  it("throws on invalid bundle", () => {
    expect(() => importSkill("not json")).toThrow();
  });
});
