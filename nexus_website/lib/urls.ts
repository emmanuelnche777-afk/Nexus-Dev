const LOCAL_URL = "http://localhost:3000";

function normaliseUrl(value: string | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Public website origin, used in links sent to visitors and customers. */
export function getPublicUrl(): string {
  return (
    normaliseUrl(process.env.NEXUS_PUBLIC_URL) ||
    normaliseUrl(process.env.NEXUS_URL) ||
    LOCAL_URL
  );
}

/** Public origin used in outbound messages; production must never send localhost links. */
export function getNotificationPublicUrl(): string {
  const configured =
    normaliseUrl(process.env.NEXUS_PUBLIC_URL) ||
    normaliseUrl(process.env.NEXUS_URL);

  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXUS_PUBLIC_URL or NEXUS_URL must be configured before sending Academy notifications");
  }
  return LOCAL_URL;
}

/** Staff portal origin, used in links intended only for authorised staff. */
export function getAdminUrl(): string {
  return (
    normaliseUrl(process.env.NEXUS_ADMIN_URL) ||
    normaliseUrl(process.env.NEXUS_PUBLIC_URL) ||
    normaliseUrl(process.env.NEXUS_URL) ||
    LOCAL_URL
  );
}
