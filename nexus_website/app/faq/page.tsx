"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import CTA from "@/components/CTA";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [faqResult, setFaqResult] = useState<{ language: string; faqs: FAQ[]; error: string | null }>({
    language: "",
    faqs: [],
    error: null,
  });
  const [retryCount, setRetryCount] = useState(0);
  const { t, language } = useLanguage();
  const loading = faqResult.language !== language;
  const loadError = loading ? "" : faqResult.error;
  const faqs = loading ? [] : faqResult.faqs;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/faq", { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "FAQs are temporarily unavailable.");
        return data;
      })
      .then((data) => {
        if (!Array.isArray(data.faqs)) throw new Error("The FAQ response was invalid.");
        setFaqResult({ language, faqs: data.faqs, error: null });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFaqResult({
          language,
          faqs: [],
          error: error instanceof Error ? error.message : "FAQs are temporarily unavailable.",
        });
      });
    return () => controller.abort();
  }, [language, retryCount]);

  const displayFaqs = faqs.length > 0
    ? faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      }))
    : [
        {
          question: t.faqPage.q1Question,
          answer: t.home.heroSubtitle,
        },
        {
          question: t.faqPage.q2Question,
          answer: t.academyPage.description,
        },
        {
          question: t.faqPage.q3Question,
          answer: t.techHubPage.description,
        },
        {
          question: t.faqPage.q4Question,
          answer: t.foundationPage.description,
        },
        {
          question: t.faqPage.q5Question,
          answer: t.mentorshipPage.description,
        },
        {
          question: t.faqPage.q6Question,
          answer: t.verifyPage.description,
        },
        {
          question: t.faqPage.q7Question,
          answer: t.partnerPage.description,
        },
      ];

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={t.faqPage.title}
        description={t.faqPage.description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={t.faqPage.eyebrow} title={t.faqPage.title} />
          {loading ? (
            <p className="mt-12 py-8 text-center text-sm text-nexus-navy/55" role="status">{language === "fr" ? "Chargement des questions…" : "Loading questions…"}</p>
          ) : loadError ? (
            <div className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center" role="alert">
              <p className="text-sm text-amber-900">{language === "fr" ? "Les questions fréquentes sont temporairement indisponibles." : "FAQs are temporarily unavailable."}</p>
              <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-3 rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900">{language === "fr" ? "Réessayer" : "Retry"}</button>
            </div>
          ) : <div className="mt-12 space-y-4">
            {displayFaqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-lg border border-nexus-cyan/20 bg-nexus-gray"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className="font-semibold text-nexus-dark">
                      {faqs.length > 0 ? <TranslatedText>{faq.question}</TranslatedText> : faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-nexus-cyan transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="border-t border-nexus-cyan/15 px-6 py-4 text-sm leading-relaxed text-nexus-navy/75">
                      {faqs.length > 0 ? <TranslatedText as="span">{faq.answer}</TranslatedText> : faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>}
          <p className="mt-10 rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-6 text-center text-sm leading-relaxed text-nexus-navy/70">
            {t.faqPage.stillQuestions} {t.faqPage.contactSupport}
          </p>
        </div>
      </section>

        <CTA
        title={t.faqPage.stillQuestions}
        description={t.faqPage.contactSupport}
        primaryLabel={t.home.partnerBtn}
        primaryHref="/partner"
        secondaryLabel={t.home.joinBtn}
        secondaryHref="/join-us?division=general"
      />
    </div>
  );
}
