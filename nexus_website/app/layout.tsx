import type { Metadata } from "next";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import PublicChrome from "@/components/PublicChrome";
import PublicFooter from "@/components/PublicFooter";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { PublicSettingsProvider } from "@/components/PublicSettingsProvider";
import { DEFAULT_PUBLIC_SITE_SETTINGS } from "@/lib/public-settings";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getPublicSiteSettings();
    return {
      title: {
        default: `${settings.siteName}: Building Digital Trust in Cameroon`,
        template: `%s | ${settings.siteName}`,
      },
      description: settings.siteDescription,
      icons: { icon: "/images/logo/nexus-watermark.png" },
    };
  } catch {
    return {
      title: {
        default: `${DEFAULT_PUBLIC_SITE_SETTINGS.siteName}: Building Digital Trust in Cameroon`,
        template: `%s | ${DEFAULT_PUBLIC_SITE_SETTINGS.siteName}`,
      },
      description: DEFAULT_PUBLIC_SITE_SETTINGS.siteDescription,
      icons: { icon: "/images/logo/nexus-watermark.png" },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <PublicSettingsProvider>
            <SplashScreen />
            <PublicChrome />
            <main className="flex-1">{children}</main>
            <PublicFooter />
          </PublicSettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
