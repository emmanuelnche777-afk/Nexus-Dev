import Link from "next/link";
import Image from "next/image";
import { getMaintenanceTranslations } from "@/lib/i18n/maintenance";
import { DEFAULT_PUBLIC_SITE_SETTINGS } from "@/lib/public-settings";
import { getPublicSiteSettings } from "@/lib/site-settings";

export default async function MaintenancePage() {
  const siteSettings = await getPublicSiteSettings().catch(() => DEFAULT_PUBLIC_SITE_SETTINGS);
  const environmentMaintenanceEnabled =
    process.env.MAINTENANCE_MODE === "true" || process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const enabled = environmentMaintenanceEnabled || siteSettings.maintenanceMode;
  const t = getMaintenanceTranslations();

  const message = enabled ? siteSettings.maintenanceMessage : t.message;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-nexus-dark px-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo/nexus-logo-sm.jpg"
            alt="NEXUS logo"
            width={36}
            height={36}
            className="rounded-full object-cover"
            unoptimized
          />
          <span className="text-2xl font-bold text-nexus-white">
            {siteSettings.siteName || "NEXUS"}
          </span>
        </Link>
      </div>

      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-nexus-cyan/10">
          <svg
            className="h-8 w-8 text-nexus-cyan"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-nexus-white">{t.title}</h1>
        <p className="mt-4 text-nexus-gray">{t.description}</p>
        <p className="mt-2 text-sm text-nexus-gray/70">{message}</p>
      </div>

      <p className="mt-10 text-xs text-nexus-gray/50">
        {enabled ? "Site is currently under maintenance." : "Maintenance page preview."}
      </p>
    </div>
  );
}
