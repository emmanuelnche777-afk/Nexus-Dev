"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePublicSettings } from "@/components/PublicSettingsProvider";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [divisionsOpen, setDivisionsOpen] = useState(false);
  const [mobileDivisionsOpen, setMobileDivisionsOpen] = useState(false);
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();
  const { settings, loading: settingsLoading } = usePublicSettings();

  const divisionsChildren = NAV_LINKS.find((l) => l.label === "Divisions");

  const getLabel = (label: string) => {
    switch (label) {
      case "Home": return t.nav.home;
      case "About": return t.nav.about;
      case "Divisions": return t.nav.divisions;
      case "Journey": return t.nav.journey;
      case "Blog": return t.nav.blog;
      case "Join Us": return t.nav.joinUs;
      case "Contact": return t.nav.contact;
      default: return label;
    }
  };

  const getDivisionTagline = (name: string, defaultTagline: string) => {
    if (name.includes("Academy")) return t.divisions.academy.tagline;
    if (name.includes("Tech Hub")) return t.divisions.techHub.tagline;
    if (name.includes("Foundation")) return t.divisions.foundation.tagline;
    if (name.includes("Mentorship")) return t.divisions.mentorship.tagline;
    return defaultTagline;
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isDivisionsActive = pathname.startsWith("/divisions");

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-nexus-cyan/10 bg-nexus-dark/95 backdrop-blur supports-[backdrop-filter]:bg-nexus-dark/80">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo/nexus-logo-sm.jpg"
              alt="NEXUS logo"
              width={36}
              height={36}
              className="rounded-full object-cover"
              unoptimized
            />
            <span className="text-lg font-bold tracking-widest text-nexus-white">
              {settings.siteName}
            </span>
          </Link>

          <div className="hidden h-full items-center gap-1 lg:flex">
            {NAV_LINKS.filter((link) => link.label !== "Blog" || settingsLoading || settings.blog).map((link) => {
              const displayLabel = getLabel(link.label);
              if (link.children) {
                return (
                  <div
                    key={link.label}
                    className="relative flex h-full items-center"
                    onMouseEnter={() => setDivisionsOpen(true)}
                    onMouseLeave={() => setDivisionsOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={`flex h-full items-center gap-1 border-b-2 px-3 text-sm transition ${
                        isDivisionsActive
                          ? "border-nexus-cyan-bright font-semibold text-nexus-cyan-bright"
                          : "border-transparent font-medium text-nexus-gray/90 hover:text-nexus-cyan-bright"
                      }`}
                    >
                      {displayLabel}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          divisionsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Link>
                    {divisionsOpen && (
                      <div className="absolute left-0 top-[calc(100%-4px)] w-72 rounded-lg border border-nexus-cyan/20 bg-nexus-white p-2 shadow-xl">
                        <div className="mb-1 px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-nexus-navy">
                          {t.nav.ourDivisions}
                        </div>
                        {divisionsChildren?.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setDivisionsOpen(false)}
                            className="group block rounded-md px-3 py-2.5 transition"
                          >
                            <span
                              className={`block text-sm font-semibold transition ${
                                pathname === child.href
                                  ? "text-nexus-cyan font-bold"
                                  : "text-nexus-dark group-hover:text-nexus-cyan"
                              }`}
                            >
                              {child.name}
                            </span>
                            <span className="block text-xs text-nexus-navy/70 transition group-hover:text-nexus-dark">
                              {getDivisionTagline(child.name, child.tagline)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex h-full items-center border-b-2 px-3 text-sm transition ${
                    active
                      ? "border-nexus-cyan-bright font-semibold text-nexus-cyan-bright"
                      : "border-transparent font-medium text-nexus-gray/90 hover:text-nexus-cyan-bright"
                  }`}
                >
                  {displayLabel}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={toggleLanguage}
              title={language === "en" ? "Changer en Français" : "Switch to English"}
              className="ml-2 flex items-center gap-1.5 rounded-md border border-nexus-cyan/30 px-3 py-1.5 text-xs font-semibold text-nexus-cyan-bright transition hover:bg-nexus-cyan hover:text-nexus-dark"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{language === "en" ? "FR" : "EN"}</span>
            </button>

            <Link
              href="/partner"
              className="ml-2 rounded-md bg-nexus-cyan px-4 py-2 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
            >
              {t.nav.partnerWithUs}
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md bg-nexus-navy/80 p-2.5 text-nexus-white transition hover:bg-nexus-cyan hover:text-nexus-dark lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-nexus-dark shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-nexus-cyan/10 p-6">
                <span className="text-xl font-bold tracking-widest text-nexus-white">
                  {settings.siteName}
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md p-2 text-nexus-white hover:bg-nexus-navy"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-1 p-6">
                {NAV_LINKS.filter((link) => link.label !== "Blog" || settingsLoading || settings.blog).map((link) => {
                  const displayLabel = getLabel(link.label);
                  return link.children ? (
                    <div key={link.label}>
                      <button
                        type="button"
                        onClick={() => setMobileDivisionsOpen((o) => !o)}
                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3.5 text-left text-lg transition ${
                          isDivisionsActive
                            ? "bg-nexus-navy/50 font-semibold text-nexus-cyan-bright"
                            : "font-medium text-nexus-gray/90 hover:bg-nexus-navy"
                        }`}
                      >
                        {displayLabel}
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            mobileDivisionsOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {mobileDivisionsOpen && (
                        <div className="ml-3 mt-1 flex flex-col gap-1 border-l-2 border-nexus-cyan/30 pl-4">
                          <Link
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`rounded-md px-4 py-2.5 text-base transition ${
                              pathname === link.href
                                ? "font-semibold text-nexus-cyan-bright"
                                : "font-medium text-nexus-gray/80 hover:text-nexus-cyan-bright"
                            }`}
                          >
                            {t.nav.ourDivisions}
                          </Link>
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={`rounded-md px-4 py-2.5 text-base transition ${
                                pathname === child.href
                                  ? "font-semibold text-nexus-cyan-bright"
                                  : "font-medium text-nexus-gray/80 hover:text-nexus-cyan-bright"
                              }`}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-lg px-4 py-3.5 text-lg transition ${
                        isActive(link.href)
                          ? "bg-nexus-navy/50 font-semibold text-nexus-cyan-bright"
                          : "font-medium text-nexus-gray/90 hover:bg-nexus-navy"
                      }`}
                    >
                      {displayLabel}
                    </Link>
                  );
                })}

                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-nexus-cyan/30 px-4 py-3.5 text-base font-semibold text-nexus-cyan-bright"
                >
                  <Globe className="h-5 w-5" />
                  {language === "en" ? "Passer en Français" : "Switch to English"}
                </button>

                <Link
                  href="/partner"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 rounded-lg bg-nexus-cyan px-4 py-3.5 text-center text-base font-semibold text-nexus-dark"
                >
                  {t.nav.partnerWithUs}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
