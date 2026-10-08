"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_PUBLIC_SITE_SETTINGS, type PublicSiteSettings } from "@/lib/public-settings";

type PublicSettingsContextValue = {
  settings: PublicSiteSettings;
  loading: boolean;
};

const PublicSettingsContext = createContext<PublicSettingsContextValue>({
  settings: DEFAULT_PUBLIC_SITE_SETTINGS,
  loading: true,
});

export function PublicSettingsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState(DEFAULT_PUBLIC_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (pathname.startsWith("/admin")) {
      return () => {
        cancelled = true;
      };
    }

    fetch("/api/settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Settings request failed (${response.status})`);
        return response.json();
      })
      .then((data) => {
        if (!cancelled && data?.settings) {
          setSettings({ ...DEFAULT_PUBLIC_SITE_SETTINGS, ...data.settings });
        }
      })
      .catch((error) => console.error("Failed to load public settings:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const value = useMemo(() => ({ settings, loading }), [settings, loading]);
  return <PublicSettingsContext.Provider value={value}>{children}</PublicSettingsContext.Provider>;
}

export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}
