import { hashPassword, verifyPassword, generateTokens, verifyRefreshToken } from "@accrue-ai/auth";
import type { AuthConfig } from "@accrue-ai/auth";
import { userRepository } from "../repositories/user.repository.js";
import { getEnv } from "../config/env.js";

function getAuthConfig(): AuthConfig {
  const env = getEnv();
  return { jwtSecret: env.JWT_SECRET, jwtExpiry: env.JWT_EXPIRY, refreshTokenExpiry: env.REFRESH_TOKEN_EXPIRY };
}

export const authService = {
  async register(email: string, password: string, name?: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("Email already registered");

    const passwordHash = hashPassword(password);
    const user = await userRepository.create({ email, name, passwordHash });
    const tokens = generateTokens({ userId: user.id, email: user.email }, getAuthConfig());

    return { user: { id: user.id, email: user.email, name: user.name }, tokens };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const tokens = generateTokens({ userId: user.id, email: user.email }, getAuthConfig());
    return { user: { id: user.id, email: user.email, name: user.name }, tokens };
  },

  async refresh(refreshToken: string) {
    const env = getEnv();
    const payload = verifyRefreshToken(refreshToken, env.JWT_SECRET);
    const user = await userRepository.findById(payload.userId);
    if (!user) throw new Error("User not found");

    const tokens = generateTokens({ userId: user.id, email: user.email }, getAuthConfig());
    return { tokens };
  },
};
