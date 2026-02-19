import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidateHash = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(candidateHash));
  } catch {
    return false;
  }
}
