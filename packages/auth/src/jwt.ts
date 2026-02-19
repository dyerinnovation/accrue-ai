import { createHmac, randomBytes } from "crypto";
import type { AuthConfig } from "./types.js";

interface TokenPayload {
  userId: string;
  email: string;
}

interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
  type: "access" | "refresh";
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(data: string): string {
  const padded = data + "=".repeat((4 - (data.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
}

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match || !match[1] || !match[2]) throw new Error(`Invalid expiry format: ${expiry}`);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * (multipliers[unit] ?? 0);
}

function signToken(payload: object, secret: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string, secret: string): DecodedToken {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const header = parts[0]!;
  const body = parts[1]!;
  const signature = parts[2]!;
  const expectedSig = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  if (signature !== expectedSig) throw new Error("Invalid token signature");

  const payload = JSON.parse(base64UrlDecode(body)) as DecodedToken;

  if (payload.exp && Date.now() > payload.exp) {
    throw new Error("Token expired");
  }

  return payload;
}

export function generateTokens(
  payload: TokenPayload,
  config: AuthConfig
): { accessToken: string; refreshToken: string } {
  const now = Date.now();

  const accessToken = signToken(
    {
      ...payload,
      type: "access",
      iat: now,
      exp: now + parseExpiry(config.jwtExpiry),
      jti: randomBytes(8).toString("hex"),
    },
    config.jwtSecret
  );

  const refreshToken = signToken(
    {
      ...payload,
      type: "refresh",
      iat: now,
      exp: now + parseExpiry(config.refreshTokenExpiry),
      jti: randomBytes(8).toString("hex"),
    },
    config.jwtSecret
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(
  token: string,
  secret: string
): TokenPayload {
  const decoded = verifyToken(token, secret);
  if (decoded.type !== "access") throw new Error("Not an access token");
  return { userId: decoded.userId, email: decoded.email };
}

export function verifyRefreshToken(
  token: string,
  secret: string
): TokenPayload {
  const decoded = verifyToken(token, secret);
  if (decoded.type !== "refresh") throw new Error("Not a refresh token");
  return { userId: decoded.userId, email: decoded.email };
}
