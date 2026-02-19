import { describe, it, expect } from "vitest";
import { validateSkill } from "../validateSkill.js";

describe("validateSkill", () => {
  it("validates a complete skill as valid", () => {
    const content = `---
name: valid-skill
description: A valid skill
tags: [test]
version: 1
---

# Valid Skill

## Purpose
This skill does something useful.

## When to Use
Use when you need it.

## Instructions
Step 1: Do this.
Step 2: Then do that.
This ensures everything works properly and correctly.

## Examples
Input: hello
Output: world
`;

    const result = validateSkill(content);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("reports errors for missing required sections", () => {
    const content = `---
name: incomplete-skill
description: Missing stuff
version: 1
---

# Incomplete Skill

Some content without proper sections.
`;

    const result = validateSkill(content);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("reports warnings for missing optional sections", () => {
    const content = `---
name: minimal-skill
description: Minimal valid skill
version: 1
---

# Minimal Skill

## Purpose
It does something important and useful.

## Instructions
Step 1: Do the thing correctly.
Step 2: Verify it worked. Check that outputs match expectations.
`;

    const result = validateSkill(content);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("rejects invalid frontmatter", () => {
    const content = `---
notafield: true
---

# Bad Skill
`;

    const result = validateSkill(content);
    expect(result.valid).toBe(false);
  });
});
