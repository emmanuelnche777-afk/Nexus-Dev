"use client";

import PageHeader from "@/components/PageHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  const p = t.legalPage;

  const sections = [
    { title: p.pCollectTitle, text: p.pCollectText },
    { title: p.pAutoTitle, text: p.pAutoText },
    { title: p.pUseTitle, text: p.pUseText },
    { title: p.pLegalTitle, text: p.pLegalText },
    { title: p.pEnrollTitle, text: p.pEnrollText },
    { title: p.pSecurityTitle, text: p.pSecurityText },
    { title: p.pRetentionTitle, text: p.pRetentionText },
    { title: p.pSharingTitle, text: p.pSharingText },
    { title: p.pRightsTitle, text: p.pRightsText },
    { title: p.pThirdTitle, text: p.pThirdText },
    { title: p.pChildrenTitle, text: p.pChildrenText },
    { title: p.pChangesTitle, text: p.pChangesText },
    { title: p.pContactTitle, text: p.pContactText },
  ];

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={p.privacyTitle}
        description={p.privacySubtitle}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-4 text-base leading-relaxed text-nexus-navy/80 sm:px-6 lg:px-8">
          <p className="text-sm text-nexus-navy/60">{p.lastUpdated}</p>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-bold text-nexus-dark">{s.title}</h2>
              <p className="mt-3">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}