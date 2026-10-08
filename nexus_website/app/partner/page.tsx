"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import {
  Users,
  Building2,
  HeartHandshake,
  Globe2,
  Landmark,
  GraduationCap,
  UserRound,
  Handshake,
  ShieldCheck,
  Wrench,
  Award,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import CTA from "@/components/CTA";
import PartnerForm from "@/components/partner/PartnerForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SITE_STATS } from "@/lib/site";

const reveal = {
  variants: {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  },
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, margin: "-80px" },
};

const container = {
  variants: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, margin: "-80px" },
};

const item = {
  variants: {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  },
};

const iconBoxClass =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright";
const cardClass =
  "rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-6 transition hover:border-nexus-cyan hover:bg-nexus-white";

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

export default function Partner() {
  const { t } = useLanguage();
  const p = t.partnerPage;

  const stats = [
    { value: SITE_STATS.divisions, label: p.statDivisionsLabel },
    { value: SITE_STATS.programs, label: p.statProgramsLabel },
    { value: SITE_STATS.trained, label: p.statTrainedLabel },
    { value: SITE_STATS.communities, label: p.statCommunitiesLabel },
  ];

  const benefits = [
    { icon: Users, title: p.benefit1Title, text: p.benefit1Text },
    { icon: Building2, title: p.benefit2Title, text: p.benefit2Text },
    { icon: HeartHandshake, title: p.benefit3Title, text: p.benefit3Text },
    { icon: Globe2, title: p.benefit4Title, text: p.benefit4Text },
  ];

  const types = [
    { icon: Building2, title: p.typeCorporateTitle, text: p.typeCorporateText },
    { icon: HeartHandshake, title: p.typeNgoTitle, text: p.typeNgoText },
    { icon: Landmark, title: p.typeGovernmentTitle, text: p.typeGovernmentText },
    { icon: GraduationCap, title: p.typeEducationTitle, text: p.typeEducationText },
    { icon: UserRound, title: p.typeIndividualTitle, text: p.typeIndividualText },
  ];

  const models = [
    { icon: Handshake, title: p.w1Title, text: p.w1Text },
    { icon: ShieldCheck, title: p.w2Title, text: p.w2Text },
    { icon: Wrench, title: p.w3Title, text: p.w3Text },
    { icon: Award, title: p.model4Title, text: p.model4Text },
    { icon: BookOpen, title: p.model5Title, text: p.model5Text },
  ];

  const steps = [
    { n: "01", title: p.step1Title, text: p.step1Text },
    { n: "02", title: p.step2Title, text: p.step2Text },
    { n: "03", title: p.step3Title, text: p.step3Text },
    { n: "04", title: p.step4Title, text: p.step4Text },
  ];

  return (
    <div className="bg-nexus-white">
      <PageHeader
        eyebrow={p.eyebrow}
        title={p.title}
        description={p.description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Partner" }]}
      />

      {/* Stats band */}
      <motion.section {...reveal} className="border-b border-nexus-navy/10 bg-nexus-gray py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.statsEyebrow} title={p.statsTitle} description={p.statsDesc} />
          <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-extrabold text-nexus-cyan">
                  <CountUp value={s.value} />
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wide text-nexus-navy">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why partner — divided feature list (no cards) */}
      <motion.section {...reveal} className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.benefitEyebrow} title={p.benefitTitle} description={p.benefitDesc} />
           <motion.div {...container} className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
             {benefits.map((b) => (
               <motion.div
                 {...item}
                 key={`${b.title}-${b.text}`}
                 className="flex gap-4 border-t border-nexus-navy/10 pt-6"
               >
                 <div className={iconBoxClass}>
                   <b.icon className="h-6 w-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-nexus-dark">{b.title}</h3>
                   <p className="mt-2 text-sm leading-relaxed text-nexus-navy">{b.text}</p>
                 </div>
               </motion.div>
             ))}
           </motion.div>
        </div>
      </motion.section>

      {/* Partner types — cards */}
      <motion.section {...reveal} className="bg-nexus-gray py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.typesEyebrow} title={p.typesTitle} description={p.typesDesc} />
          <motion.div {...container} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {types.map((ty) => (
              <motion.div
                {...item}
                key={ty.title}
                whileHover={{ y: -4 }}
                className={cardClass}
              >
                <div className={iconBoxClass}>
                  <ty.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-nexus-dark">{ty.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy">{ty.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Partnership models — numbered list (no cards) */}
      <motion.section {...reveal} className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.modelEyebrow} title={p.modelTitle} description={p.modelDesc} />
           <motion.ol {...container} className="mt-12 grid gap-6 md:grid-cols-2">
             {models.map((m, i) => (
               <motion.li {...item} key={`${m.title}-${m.text}`} className="flex items-start gap-4">
                 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexus-navy text-base font-bold text-nexus-cyan-bright">
                   {i + 1}
                 </span>
                 <div>
                   <h3 className="text-lg font-bold text-nexus-dark">{m.title}</h3>
                   <p className="mt-2 text-sm leading-relaxed text-nexus-navy">{m.text}</p>
                 </div>
               </motion.li>
             ))}
           </motion.ol>
        </div>
      </motion.section>

      {/* How it works — connected stepper (no cards) */}
      <motion.section
        {...reveal}
        className="relative overflow-hidden bg-nexus-dark py-16 lg:py-24"
      >
        <span
          className="orb absolute -right-20 -top-24 h-72 w-72 rounded-full"
          style={{ background: "rgba(69,175,225,0.12)" }}
        />
        <span
          className="orb orb-delay-1 absolute -bottom-24 -left-20 h-72 w-72 rounded-full"
          style={{ background: "rgba(46,49,146,0.35)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow={p.processEyebrow}
            title={p.processTitle}
            description={p.processDesc}
          />
          <motion.div {...container} className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div {...item} key={s.n} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-nexus-cyan/40 bg-nexus-navy text-sm font-bold text-nexus-cyan-bright">
                    {s.n}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="hidden h-px flex-1 bg-nexus-cyan/20 lg:block" />
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold text-nexus-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-gray/75">{s.text}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-10 text-center">
            <Link
              href="#partner-form"
              className="inline-flex items-center gap-2 rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
            >
              {p.processCtaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Application form */}
      <section id="partner-form" className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.eyebrow} title={p.formTitle} description={p.formSideText} />
          <div className="mt-12">
            <PartnerForm />
          </div>
        </div>
      </section>

      <CTA
        title={t.home.ctaTitle}
        description={t.home.ctaDesc}
        primaryLabel={t.home.joinBtn}
        primaryHref="/join-us?division=partner"
        secondaryLabel={t.footer.contactUs}
        secondaryHref="/contact?department=partnership"
        tertiaryLabel={t.home.explorePrograms}
        tertiaryHref="/academy"
      />
    </div>
  );
}
