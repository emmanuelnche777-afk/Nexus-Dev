import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { decrypt, encrypt } from "@/lib/encryption";
import { getAdminUrl } from "@/lib/urls";
import prisma from "@/lib/db";

const STATE_COOKIE = "nexus_instagram_oauth_state";
const STATE_TTL_SECONDS = 10 * 60;
const PERMISSIONS = ["instagram_business_basic", "instagram_business_content_publish"];

type StoredInstagramConnection = {
  username: string;
  userId: string;
  encryptedAccessToken: string;
  expiresAt: string;
  connectedAt: string;
};

export function instagramRedirectUri(): string {
  return `${getAdminUrl()}/api/admin/social/instagram/callback`;
}

export function instagramStateCookieName(): string {
  return STATE_COOKIE;
}

function instagramCredentials() {
  const clientId = process.env.INSTAGRAM_APP_ID;
  const clientSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Instagram login is not configured. Set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET.");
  }
  return { clientId, clientSecret };
}

export function buildInstagramAuthorizationUrl(state: string): string {
  const { clientId } = instagramCredentials();
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", instagramRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", PERMISSIONS.join(","));
  url.searchParams.set("state", state);
  url.searchParams.set("enable_fb_login", "0");
  url.searchParams.set("force_authentication", "1");
  return url.toString();
}

export function createInstagramOAuthState(adminId: string): string {
  const secret = process.env.INSTAGRAM_APP_SECRET;
  if (!secret) throw new Error("Instagram login is not configured.");
  const payload = Buffer.from(JSON.stringify({ adminId, nonce: crypto.randomBytes(24).toString("hex"), issuedAt: Date.now() })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyInstagramOAuthState(value: string, expected: string): { adminId: string } | null {
  const secret = process.env.INSTAGRAM_APP_SECRET;
  if (!secret || !value || value !== expected) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest();
  let actualSignature: Buffer;
  try {
    actualSignature = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (actualSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(actualSignature, expectedSignature)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { adminId?: string; issuedAt?: number };
    if (!decoded.adminId || !Number.isFinite(decoded.issuedAt) || Number(decoded.issuedAt) > Date.now() + 30_000 || Date.now() - Number(decoded.issuedAt) > STATE_TTL_SECONDS * 1000) return null;
    return { adminId: decoded.adminId };
  } catch {
    return null;
  }
}

export async function exchangeInstagramCode(code: string): Promise<StoredInstagramConnection> {
  const { clientId, clientSecret } = instagramCredentials();
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: instagramRedirectUri(),
    code,
  });
  const shortResponse = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    cache: "no-store",
  });
  const shortData = await shortResponse.json() as { access_token?: string; user_id?: string | number; error_message?: string; error?: { message?: string } };
  if (!shortResponse.ok || !shortData.access_token || !shortData.user_id) {
    throw new Error(shortData.error_message || shortData.error?.message || "Instagram did not return an access token.");
  }

  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", clientSecret);
  longUrl.searchParams.set("access_token", shortData.access_token);
  const longResponse = await fetch(longUrl, { cache: "no-store" });
  const longData = await longResponse.json() as { access_token?: string; token_type?: string; expires_in?: number; error?: { message?: string } };
  if (!longResponse.ok || !longData.access_token) {
    throw new Error(longData.error?.message || "Instagram could not create a long-lived access token.");
  }

  const profileUrl = new URL(`https://graph.instagram.com/${encodeURIComponent(String(shortData.user_id))}`);
  profileUrl.searchParams.set("fields", "user_id,username");
  profileUrl.searchParams.set("access_token", longData.access_token);
  const profileResponse = await fetch(profileUrl, { cache: "no-store" });
  const profile = await profileResponse.json() as { user_id?: string | number; id?: string | number; username?: string; error?: { message?: string } };
  if (!profileResponse.ok || !profile.username) {
    throw new Error(profile.error?.message || "Instagram connected, but the account profile could not be read.");
  }

  const expiresInSeconds = Number(longData.expires_in) || 60 * 24 * 60 * 60;
  return {
    username: profile.username,
    userId: String(profile.user_id ?? profile.id ?? shortData.user_id),
    encryptedAccessToken: encrypt(longData.access_token),
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    connectedAt: new Date().toISOString(),
  };
}

export async function saveInstagramConnection(connection: StoredInstagramConnection): Promise<void> {
  const record = await prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { metadata: true } });
  const metadata = (record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
    ? record.metadata
    : {}) as Prisma.InputJsonObject;
  const updatedMetadata = { ...metadata, instagramConnection: connection } as Prisma.InputJsonObject;
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", metadata: updatedMetadata },
    update: { metadata: updatedMetadata },
  });
}

export async function getInstagramConnection(): Promise<(Omit<StoredInstagramConnection, "encryptedAccessToken"> & { accessToken: string }) | null> {
  const record = await prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { metadata: true } });
  const metadata = (record?.metadata as Record<string, unknown> | undefined) || {};
  const connection = metadata.instagramConnection as StoredInstagramConnection | undefined;
  if (!connection?.encryptedAccessToken || !connection.userId || !connection.username) return null;
  return {
    username: connection.username,
    userId: connection.userId,
    expiresAt: connection.expiresAt,
    connectedAt: connection.connectedAt,
    accessToken: decrypt(connection.encryptedAccessToken),
  };
}

export async function getUsableInstagramConnection() {
  const connection = await getInstagramConnection();
  if (!connection) return null;
  const expiresAt = new Date(connection.expiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new Error("The Instagram connection has expired. Disconnect and reconnect the account.");
  }
  if (expiresAt - Date.now() > 7 * 24 * 60 * 60 * 1000) return connection;

  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", connection.accessToken);
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json() as { access_token?: string; expires_in?: number; error?: { message?: string } };
  if (!response.ok || !data.access_token) {
    throw new Error(data.error?.message || "Instagram token refresh failed. Reconnect the account.");
  }
  const refreshed: StoredInstagramConnection = {
    username: connection.username,
    userId: connection.userId,
    encryptedAccessToken: encrypt(data.access_token),
    expiresAt: new Date(Date.now() + (Number(data.expires_in) || 60 * 24 * 60 * 60) * 1000).toISOString(),
    connectedAt: connection.connectedAt,
  };
  await saveInstagramConnection(refreshed);
  return { ...connection, accessToken: data.access_token, expiresAt: refreshed.expiresAt };
}

export async function removeInstagramConnection(): Promise<void> {
  const record = await prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { metadata: true } });
  const metadata = (record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
    ? record.metadata
    : {}) as Prisma.InputJsonObject;
  const rest = { ...metadata };
  delete rest.instagramConnection;
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", metadata: rest },
    update: { metadata: rest },
  });
}
