import { describe, it, expect } from "vitest";
import { slugify, isValidSlug, truncate, generateApiKey, parseSkillSections, formatDate } from "../utils.js";

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
  });

  it("trims whitespace", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });
});

describe("isValidSlug", () => {
  it("accepts valid slugs", () => {
    expect(isValidSlug("hello-world")).toBe(true);
    expect(isValidSlug("skill-creator")).toBe(true);
    expect(isValidSlug("abc123")).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(isValidSlug("Hello-World")).toBe(false);
    expect(isValidSlug("hello world")).toBe(false);
    expect(isValidSlug("hello_world")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("trailing-")).toBe(false);
  });
});

describe("truncate", () => {
  it("returns string unchanged if under limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings with ellipsis", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });
});

describe("generateApiKey", () => {
  it("generates keys with correct prefix", () => {
    const key = generateApiKey();
    expect(key.startsWith("ak_")).toBe(true);
  });

  it("generates keys of correct length", () => {
    const key = generateApiKey();
    expect(key.length).toBe(43); // "ak_" + 40 chars
  });

  it("generates unique keys", () => {
    const key1 = generateApiKey();
    const key2 = generateApiKey();
    expect(key1).not.toBe(key2);
  });
});

describe("parseSkillSections", () => {
  it("parses sections from markdown content", () => {
    const content = `# My Skill

## Purpose
This is the purpose.

## Instructions
Step 1: Do this.
Step 2: Do that.

## Examples
Example output here.`;

    const sections = parseSkillSections(content);
    expect(sections["purpose"]).toBe("This is the purpose.");
    expect(sections["instructions"]).toContain("Step 1");
    expect(sections["examples"]).toContain("Example output");
  });
});

describe("formatDate", () => {
  it("formats Date objects", () => {
    const date = new Date("2024-01-15T12:00:00Z");
    expect(formatDate(date)).toBe("2024-01-15");
  });

  it("formats date strings", () => {
    expect(formatDate("2024-01-15T12:00:00Z")).toBe("2024-01-15");
  });
});
