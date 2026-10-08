import prisma from "@/lib/db";

export async function isMaintenanceModeEnabled(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    return true;
  }

  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    return settings?.maintenanceMode === true;
  } catch {
    return false;
  }
}

export async function getMaintenanceMessage(language = "en"): Promise<string> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    if (settings?.maintenanceMode) {
      return language === "fr"
        ? settings.maintenanceMessageFr ||
            "Nous serons de retour bientôt !"
        : settings.maintenanceMessage || "We'll be back soon!";
    }
  } catch {
    // ignore
  }
  return language === "fr" ? "Nous serons de retour bientôt !" : "We'll be back soon!";
}