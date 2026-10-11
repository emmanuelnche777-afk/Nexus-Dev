import { randomBytes } from "crypto";
import { createHash } from "node:crypto";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSigningToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getSignedUrl(contractId: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexus.cm";
  return `${baseUrl}/contract/sign/${contractId}?token=${encodeURIComponent(token)}`;
}

export function isTokenValid(token: string | null): boolean {
  return !!token && token.length >= 32;
}
