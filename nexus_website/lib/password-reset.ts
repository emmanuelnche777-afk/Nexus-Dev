import crypto from "node:crypto";

/** HMAC prevents a database reader from brute-forcing six-digit reset codes. */
export function hashPasswordResetToken(token: string): string {
  const encodedKey = process.env.ENCRYPTION_KEY;
  if (!encodedKey) throw new Error("ENCRYPTION_KEY environment variable is not set");
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes");
  return crypto.createHmac("sha256", key).update(token).digest("hex");
}
