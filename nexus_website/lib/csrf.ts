import { getAdminUrl } from "@/lib/urls";

export function getAllowedOrigin(): string | null {
  return getAdminUrl();
}

export function checkOrigin(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigin = getAllowedOrigin();
  if (!allowedOrigin) return false;

  try {
    const allowedUrl = new URL(allowedOrigin);
    const requestOrigin = new URL(origin);

    const allowedHostname = allowedUrl.hostname;
    const requestHostname = requestOrigin.hostname;

    // Allow localhost/127.0.0.1 equivalence for local development
    const isLocalhost =
      (allowedHostname === "localhost" || allowedHostname === "127.0.0.1") &&
      (requestHostname === "localhost" || requestHostname === "127.0.0.1");

    return isLocalhost || requestOrigin.origin === allowedUrl.origin;
  } catch {
    return false;
  }
}
