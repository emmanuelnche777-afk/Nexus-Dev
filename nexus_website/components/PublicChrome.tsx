"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import CookieConsent from "@/components/CookieConsent";
import { usePublicSettings } from "@/components/PublicSettingsProvider";
import BrowserContentTranslator from "@/components/BrowserContentTranslator";

export default function PublicChrome() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { settings, loading } = usePublicSettings();

  if (isAdmin || pathname === "/maintenance") return null;

  return (
    <>
      <BrowserContentTranslator />
      <Navbar />
      {!loading && settings.aiAssistant ? <ChatWidget /> : null}
      <CookieConsent />
    </>
  );
}
