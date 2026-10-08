"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center bg-nexus-dark px-4 py-32 text-center">
      <p className="text-7xl font-extrabold text-nexus-cyan-bright">404</p>
      <h1 className="mt-4 text-3xl font-bold text-nexus-white">
        {t.notFoundPage.title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-nexus-gray/75">
        {t.notFoundPage.subtitle}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
        >
          <Home className="h-4 w-4" /> {t.notFoundPage.backBtn}
        </Link>
        <Link
          href="/faq"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
        >
          <Search className="h-4 w-4" /> {t.faqPage.eyebrow}
        </Link>
      </div>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1 text-sm text-nexus-gray/60 transition hover:text-nexus-cyan-bright"
      >
        <ArrowLeft className="h-4 w-4" /> {t.common.backToHome}
      </Link>
    </div>
  );
}