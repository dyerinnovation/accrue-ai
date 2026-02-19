import { describe, it, expect } from "vitest";
import { parseSkill } from "../parseSkill.js";

const SAMPLE_SKILL = `---
name: test-skill
description: A test skill for unit tests
tags:
  - test
  - sample
version: 1
---

# Test Skill

## Purpose
This skill is for testing the parser.

## When to Use
Use this when running tests.

## Instructions
Step 1: Parse the skill
Step 2: Validate the output

## Examples
Input: raw markdown
Output: parsed skill object

## References
See the test suite for more details.
`;

describe("parseSkill", () => {
  it("parses frontmatter correctly", () => {
    const result = parseSkill(SAMPLE_SKILL);

    expect(result.frontmatter.name).toBe("test-skill");
    expect(result.frontmatter.description).toBe("A test skill for unit tests");
    expect(result.frontmatter.tags).toEqual(["test", "sample"]);
    expect(result.frontmatter.version).toBe(1);
  });

  it("extracts sections", () => {
    const result = parseSkill(SAMPLE_SKILL);

    expect(result.sections.purpose).toContain("testing the parser");
    expect(result.sections.whenToUse).toContain("running tests");
    expect(result.sections.instructions).toContain("Step 1");
    expect(result.sections.examples).toContain("Input:");
    expect(result.sections.references).toContain("test suite");
  });

  it("handles missing optional sections", () => {
    const minimal = `---
name: minimal
description: Minimal skill
version: 1
---

# Minimal Skill

## Purpose
Just a purpose.

## Instructions
Do the thing.
`;
    const result = parseSkill(minimal);

    expect(result.sections.purpose).toContain("Just a purpose");
    expect(result.sections.instructions).toContain("Do the thing");
    expect(result.sections.whenToUse).toBeUndefined();
    expect(result.sections.examples).toBeUndefined();
  });
});
