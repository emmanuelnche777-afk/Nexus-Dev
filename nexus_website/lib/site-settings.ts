import prisma from "@/lib/db";
import { DEFAULT_PUBLIC_SITE_SETTINGS, type PublicSiteSettings } from "@/lib/public-settings";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

const SETTINGS_CACHE_TTL_MS = 5_000;
let cachedSettings: PublicSiteSettings | null = null;
let cachedSettingsUntil = 0;
let pendingSettingsRead: Promise<PublicSiteSettings> | null = null;

/** Loads only fields intended for public display; never spreads raw metadata. */
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  if (cachedSettings && Date.now() < cachedSettingsUntil) return cachedSettings;
  if (pendingSettingsRead) return pendingSettingsRead;

  pendingSettingsRead = readPublicSiteSettings();
  try {
    const settings = await pendingSettingsRead;
    cachedSettings = settings;
    cachedSettingsUntil = Date.now() + SETTINGS_CACHE_TTL_MS;
    return settings;
  } finally {
    pendingSettingsRead = null;
  }
}

/** Call after an admin save so the next public request observes it immediately. */
export function invalidatePublicSiteSettingsCache(): void {
  cachedSettings = null;
  cachedSettingsUntil = 0;
}

async function readPublicSiteSettings(): Promise<PublicSiteSettings> {
  const record = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: {
      siteName: true,
      contactEmail: true,
      maintenanceMode: true,
      maintenanceMessage: true,
      maintenanceMessageFr: true,
      academyOverviewVideoUrl: true,
      academyOverviewVideoPoster: true,
      metadata: true,
    },
  });
  const metadata = isRecord(record?.metadata) ? record.metadata : {};
  const rawPaymentInfo = isRecord(metadata.paymentInfo) ? metadata.paymentInfo : {};
  const defaultPaymentInfo = DEFAULT_PUBLIC_SITE_SETTINGS.paymentInfo;

  return {
    siteName: stringValue(record?.siteName, DEFAULT_PUBLIC_SITE_SETTINGS.siteName),
    siteDescription: stringValue(metadata.siteDescription, DEFAULT_PUBLIC_SITE_SETTINGS.siteDescription),
    contactEmail: stringValue(record?.contactEmail, DEFAULT_PUBLIC_SITE_SETTINGS.contactEmail),
    supportEmail: stringValue(metadata.supportEmail, DEFAULT_PUBLIC_SITE_SETTINGS.supportEmail),
    phone: stringValue(metadata.phone, DEFAULT_PUBLIC_SITE_SETTINGS.phone),
    address: stringValue(metadata.address, DEFAULT_PUBLIC_SITE_SETTINGS.address),
    newsletter: booleanValue(metadata.newsletter, true),
    blog: booleanValue(metadata.blog, true),
    aiAssistant: booleanValue(metadata.aiAssistant, true),
    certificateVerification: booleanValue(metadata.certificateVerification, true),
    maintenanceMode: record?.maintenanceMode ?? false,
    maintenanceMessage: stringValue(record?.maintenanceMessage, DEFAULT_PUBLIC_SITE_SETTINGS.maintenanceMessage),
    maintenanceMessageFr: stringValue(record?.maintenanceMessageFr, DEFAULT_PUBLIC_SITE_SETTINGS.maintenanceMessageFr),
    academyOverviewVideoUrl: stringValue(record?.academyOverviewVideoUrl, ""),
    academyOverviewVideoPoster: stringValue(record?.academyOverviewVideoPoster, ""),
    paymentInfo: {
      mtnNumber: stringValue(rawPaymentInfo.mtnNumber, defaultPaymentInfo.mtnNumber),
      mtnLabel: stringValue(rawPaymentInfo.mtnLabel, defaultPaymentInfo.mtnLabel),
      orangeNumber: stringValue(rawPaymentInfo.orangeNumber, defaultPaymentInfo.orangeNumber),
      orangeLabel: stringValue(rawPaymentInfo.orangeLabel, defaultPaymentInfo.orangeLabel),
      instructions: stringValue(rawPaymentInfo.instructions, defaultPaymentInfo.instructions),
      instructionsFr: stringValue(rawPaymentInfo.instructionsFr, defaultPaymentInfo.instructionsFr),
    },
  };
}

export async function isMaintenanceModeEnabled(): Promise<boolean> {
  if (process.env.MAINTENANCE_MODE === "true" || process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    return true;
  }

  try {
    const settings = await getPublicSiteSettings();
    return settings.maintenanceMode;
  } catch (error) {
    console.error("[site-settings] Failed to read maintenance setting:", error);
    return false;
  }
}
