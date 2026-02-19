import { describe, it, expect } from "vitest";
import { generateTokens, verifyAccessToken, verifyRefreshToken } from "../jwt.js";

const config = {
  jwtSecret: "test-secret-key-for-testing-12345",
  jwtExpiry: "15m",
  refreshTokenExpiry: "7d",
};

const payload = {
  userId: "user-123",
  email: "test@example.com",
};

describe("JWT tokens", () => {
  it("generates access and refresh tokens", () => {
    const tokens = generateTokens(payload, config);
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
    expect(tokens.accessToken).not.toBe(tokens.refreshToken);
  });

  it("verifies valid access token", () => {
    const tokens = generateTokens(payload, config);
    const decoded = verifyAccessToken(tokens.accessToken, config.jwtSecret);
    expect(decoded.userId).toBe("user-123");
    expect(decoded.email).toBe("test@example.com");
  });

  it("verifies valid refresh token", () => {
    const tokens = generateTokens(payload, config);
    const decoded = verifyRefreshToken(tokens.refreshToken, config.jwtSecret);
    expect(decoded.userId).toBe("user-123");
    expect(decoded.email).toBe("test@example.com");
  });

  it("rejects access token used as refresh", () => {
    const tokens = generateTokens(payload, config);
    expect(() =>
      verifyRefreshToken(tokens.accessToken, config.jwtSecret)
    ).toThrow("Not a refresh token");
  });

  it("rejects token with wrong secret", () => {
    const tokens = generateTokens(payload, config);
    expect(() =>
      verifyAccessToken(tokens.accessToken, "wrong-secret")
    ).toThrow();
  });
});
