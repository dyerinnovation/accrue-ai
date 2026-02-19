import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../repositories/user.repository.js", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../config/env.js", () => ({
  getEnv: () => ({
    JWT_SECRET: "test-secret-key-for-testing-12345",
    JWT_EXPIRY: "15m",
    REFRESH_TOKEN_EXPIRY: "7d",
  }),
}));

import { authService } from "../../services/auth.service.js";
import { userRepository } from "../../repositories/user.repository.js";

const mockUserRepo = vi.mocked(userRepository);

describe("authService", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("register", () => {
    it("creates a new user and returns tokens", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({ id: "user-1", email: "test@test.com", name: "Test", passwordHash: "hash", createdAt: new Date(), updatedAt: new Date() });

      const result = await authService.register("test@test.com", "password123", "Test");
      expect(result.user.email).toBe("test@test.com");
      expect(result.tokens.accessToken).toBeTruthy();
      expect(result.tokens.refreshToken).toBeTruthy();
    });

    it("throws if email already exists", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: "user-1", email: "test@test.com", name: null, passwordHash: "hash", createdAt: new Date(), updatedAt: new Date() });
      await expect(authService.register("test@test.com", "password123")).rejects.toThrow("Email already registered");
    });
  });
});
