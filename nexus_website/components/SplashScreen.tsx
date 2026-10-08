"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SplashScreen() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isAdmin = pathname.startsWith("/admin");
  const isMaintenance = pathname === "/maintenance";

  const [visible, setVisible] = useState(!isAdmin && !isMaintenance);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isAdmin || isMaintenance) {
      return;
    }

    requestAnimationFrame(() => setMounted(true));
    const seen = sessionStorage.getItem("nexus-splash-seen");
    if (seen) {
      requestAnimationFrame(() => setVisible(false));
      return;
    }
    const hideTimer = setTimeout(() => {
      setExiting(true);
      sessionStorage.setItem("nexus-splash-seen", "true");
    }, 4500);
    const removeTimer = setTimeout(() => setVisible(false), 5000);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [isAdmin, isMaintenance]);

  if (!visible || isAdmin || isMaintenance) return null;

  const madeIn = mounted ? t.splash.madeInCameroon : "Made in Cameroon";
  const builtFor = mounted ? t.splash.builtForTheWorld : "Built for the World";
  const poweredBy = mounted ? t.splash.poweredByNexus : "Powered by NEXUS";
  const initText = mounted ? t.splash.initializing : "Initialising secure environment…";

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-nexus-dark transition-opacity duration-500 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-nexus-cyan/20" />
        <span className="absolute inset-0 rounded-full border-2 border-nexus-cyan/40" />
        <Image
          src="/images/logo/nexus-logo-sm.jpg"
          alt="NEXUS logo"
          width={96}
          height={96}
          priority
          className="relative z-10 rounded-full object-cover"
          unoptimized
        />
      </div>
      <p className="mt-6 text-2xl font-bold tracking-[0.4em] text-nexus-white">
        NEXUS
      </p>
      <div className="relative mt-2 h-5 w-full text-center">
        <p className="splash-word splash-word-1">{madeIn}</p>
        <p className="splash-word splash-word-2">{builtFor}</p>
        <p className="splash-word splash-word-3">{poweredBy}</p>
        <p className="splash-word splash-word-init">{initText}</p>
      </div>
    </div>
  );
}
