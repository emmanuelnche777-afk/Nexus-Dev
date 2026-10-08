import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import { invalidatePublicSiteSettingsCache } from "@/lib/site-settings";
import { validateVideoUrl } from "@/lib/video-url";
import { deleteCloudinaryVideoIfUnused, managedCloudinaryVideoPublicId } from "@/lib/cloudinary-video";
import type { SiteSettings } from "@prisma/client";

const DEFAULT_SETTINGS = {
  siteName: "NEXUS",
  siteDescription: "Empowering the next generation of Cameroonian technologists",
  contactEmail: "contact@nexus.cm",
  supportEmail: "support@nexus.cm",
  phone: "+237 6XX XXX XXX",
  address: "Douala, Cameroon",
  newsletter: true,
  blog: true,
  aiAssistant: true,
  certificateVerification: true,
  maintenanceMode: false,
  maintenanceMessage: "We'll be back soon!",
  maintenanceMessageFr: "Nous serons de retour bientôt !",
  paymentInfo: {
    mtnNumber: "+237673746047",
    mtnLabel: "MTN Mobile Money",
    orangeNumber: "",
    orangeLabel: "Orange Money",
    instructions: "Pay via Mobile Money to the number above, then submit your payment proof during registration. Keep your transaction ID handy.",
    instructionsFr: "Payer via Mobile Money au numéro ci-dessous, puis soumettez votre preuve de paiement lors de l'inscription. Conservez votre ID de transaction.",
  },
};

function mergeWithDefaults(record: SiteSettings | null) {
  const meta = (record?.metadata as Record<string, unknown>) || {};
  return {
    ...DEFAULT_SETTINGS,
    siteName: record?.siteName ?? DEFAULT_SETTINGS.siteName,
    contactEmail: record?.contactEmail ?? DEFAULT_SETTINGS.contactEmail,
    maintenanceMode: record?.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode,
    maintenanceMessage: record?.maintenanceMessage ?? DEFAULT_SETTINGS.maintenanceMessage,
    maintenanceMessageFr: record?.maintenanceMessageFr ?? DEFAULT_SETTINGS.maintenanceMessageFr,
    academyOverviewVideoUrl: record?.academyOverviewVideoUrl ?? null,
    academyOverviewVideoPublicId: record?.academyOverviewVideoPublicId ?? null,
    academyOverviewVideoPoster: record?.academyOverviewVideoPoster ?? null,
    newsletter: meta.newsletter ?? DEFAULT_SETTINGS.newsletter,
    blog: meta.blog ?? DEFAULT_SETTINGS.blog,
    aiAssistant: meta.aiAssistant ?? DEFAULT_SETTINGS.aiAssistant,
    certificateVerification: meta.certificateVerification ?? DEFAULT_SETTINGS.certificateVerification,
    paymentInfo: meta.paymentInfo ?? DEFAULT_SETTINGS.paymentInfo,
    siteDescription: meta.siteDescription ?? DEFAULT_SETTINGS.siteDescription,
    supportEmail: meta.supportEmail ?? DEFAULT_SETTINGS.supportEmail,
    phone: meta.phone ?? DEFAULT_SETTINGS.phone,
    address: meta.address ?? DEFAULT_SETTINGS.address,
  };
}

export async function GET() {
  const { user, authorized } = await requirePermission("*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const record = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    const settings = mergeWithDefaults(record);
    return NextResponse.json({
      settings,
      maintenance: {
        enabled: settings.maintenanceMode,
        message: settings.maintenanceMessage,
        messageFr: settings.maintenanceMessageFr,
      },
    });
  } catch {
    return NextResponse.json({
      settings: { ...DEFAULT_SETTINGS },
      maintenance: { enabled: false },
    });
  }
}

export async function PUT(request: NextRequest) {
  const { user, authorized } = await requirePermission("*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const s = body.settings || body;
    const maintenance = body.maintenance || {};
    const academyOverviewVideoUrl = validateVideoUrl(s.academyOverviewVideoUrl);
    const academyOverviewVideoPublicId = managedCloudinaryVideoPublicId(academyOverviewVideoUrl);

    const existing = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    const prevMeta = (existing?.metadata as Record<string, unknown>) || {};

    const maintenanceMode =
      typeof s.maintenanceMode === "boolean" ? s.maintenanceMode : maintenance.enabled ?? prevMeta.maintenanceMode ?? false;

    const metadata = {
      ...prevMeta,
      newsletter: s.newsletter ?? prevMeta.newsletter,
      blog: s.blog ?? prevMeta.blog,
      aiAssistant: s.aiAssistant ?? prevMeta.aiAssistant,
      certificateVerification: s.certificateVerification ?? prevMeta.certificateVerification,
      paymentInfo: s.paymentInfo ?? prevMeta.paymentInfo,
      siteDescription: s.siteDescription ?? prevMeta.siteDescription,
      supportEmail: s.supportEmail ?? prevMeta.supportEmail,
      phone: s.phone ?? prevMeta.phone,
      address: s.address ?? prevMeta.address,
    };

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        siteName: s.siteName || DEFAULT_SETTINGS.siteName,
        contactEmail: s.contactEmail || DEFAULT_SETTINGS.contactEmail,
        maintenanceMode,
        maintenanceMessage: s.maintenanceMessage ?? maintenance.message ?? null,
        maintenanceMessageFr: s.maintenanceMessageFr ?? maintenance.messageFr ?? null,
        academyOverviewVideoUrl,
        academyOverviewVideoPublicId,
        academyOverviewVideoPoster: s.academyOverviewVideoPoster || null,
        metadata,
      },
      update: {
        siteName: s.siteName,
        contactEmail: s.contactEmail,
        maintenanceMode,
        maintenanceMessage: s.maintenanceMessage ?? maintenance.message,
        maintenanceMessageFr: s.maintenanceMessageFr ?? maintenance.messageFr,
        academyOverviewVideoUrl,
        academyOverviewVideoPublicId,
        academyOverviewVideoPoster: s.academyOverviewVideoPoster,
        metadata,
      },
    });
    invalidatePublicSiteSettingsCache();
    const previousVideoId = existing?.academyOverviewVideoPublicId || managedCloudinaryVideoPublicId(existing?.academyOverviewVideoUrl);
    if (previousVideoId && previousVideoId !== academyOverviewVideoPublicId) {
      await deleteCloudinaryVideoIfUnused(previousVideoId).catch((error) => {
        console.error("Failed to clean up replaced Academy overview video:", error);
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message.startsWith("Enter a YouTube") || err.message.startsWith("Localhost video"))) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Settings PUT error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}
