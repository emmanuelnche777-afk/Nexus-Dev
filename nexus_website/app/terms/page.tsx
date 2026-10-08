"use client";

import PageHeader from "@/components/PageHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Terms() {
  const { t } = useLanguage();
  const p = t.legalPage;

  const sections = [
    { title: p.termsScopeTitle, text: p.termsScopeText },
    { title: p.termsAcceptanceTitle, text: p.termsAcceptanceText },
    { title: p.termsUseTitle, text: p.termsUseText },
    { title: p.termsIpTitle, text: p.termsIpText },
    { title: p.termsAccuracyTitle, text: p.termsAccuracyText },
    { title: p.termsLinksTitle, text: p.termsLinksText },
    { title: p.termsLiabilityTitle, text: p.termsLiabilityText },
    { title: p.termsWarrantyTitle, text: p.termsWarrantyText },
    { title: p.termsPrivacyTitle, text: p.termsPrivacyText },
    { title: p.termsGoverningTitle, text: p.termsGoverningText },
    { title: p.termsEnrollmentTitle, text: p.termsEnrollmentText },
    { title: p.termsResponsibilityTitle, text: p.termsResponsibilityText },
    { title: p.termsChangesTitle, text: p.termsChangesText },
    { title: p.termsContactTitle, text: p.termsContactText },
  ];

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={p.termsTitle}
        description={p.termsIntro}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Terms of Use" }]}
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