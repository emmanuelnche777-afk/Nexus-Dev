"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail } from "lucide-react";
import NewsletterForm from "@/components/foundation/NewsletterForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePublicSettings } from "@/components/PublicSettingsProvider";

export default function NewsletterSection() {
  const { t } = useLanguage();
  const { settings, loading } = usePublicSettings();
  const jp = t.journeyPage;
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  if (loading || !settings.newsletter) return null;

  return (
    <section ref={ref} className="relative overflow-hidden bg-nexus-dark py-20 lg:py-28">
      {/* Gradient orbs */}
      <div className="orb absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-nexus-cyan/10" />
      <div className="orb orb-delay-1 absolute -right-24 bottom-1/3 h-64 w-64 rounded-full bg-nexus-navy/40" />

      {/* Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-nexus-cyan/15 journey-ring-drift" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full border border-nexus-cyan/10 journey-ring-drift" style={{ animationDelay: "-7s" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-nexus-cyan/30 bg-nexus-cyan/10 text-nexus-cyan-bright">
            <Mail className="h-7 w-7" />
          </div>

          <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
            {jp.newsletterEyebrow}
          </p>

          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            {jp.newsletterTitle}
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-nexus-gray/70">
            {jp.newsletterDesc}
          </p>

          <div className="mx-auto mt-8">
            <NewsletterForm
              placeholder={jp.newsletterPlaceholder}
              buttonLabel={jp.newsletterBtn}
              successMessage={jp.newsletterSuccess}
              invalidMessage={jp.newsletterInvalid}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
