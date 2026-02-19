import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password.js";

describe("password hashing", () => {
  it("hashes a password", () => {
    const hash = hashPassword("mysecret");
    expect(hash).toContain(":");
    expect(hash).not.toBe("mysecret");
  });

  it("verifies correct password", () => {
    const hash = hashPassword("mysecret");
    expect(verifyPassword("mysecret", hash)).toBe(true);
  });

  it("rejects incorrect password", () => {
    const hash = hashPassword("mysecret");
    expect(verifyPassword("wrongpassword", hash)).toBe(false);
  });

  it("generates different hashes for same password", () => {
    const hash1 = hashPassword("mysecret");
    const hash2 = hashPassword("mysecret");
    expect(hash1).not.toBe(hash2);
  });
});
