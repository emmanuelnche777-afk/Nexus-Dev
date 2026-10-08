"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Code2,
  Server,
  ShieldCheck,
  Brain,
  Palette,
  Brush,
  Rocket,
  Globe,
  Layers,
  Cpu,
  Smartphone,
  Cloud,
  ArrowRight,
  Check,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CTA from "@/components/CTA";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";

const ICONS: Record<string, React.ReactNode> = {
  Code2: <Code2 className="h-7 w-7" />,
  Server: <Server className="h-7 w-7" />,
  ShieldCheck: <ShieldCheck className="h-7 w-7" />,
  Brain: <Brain className="h-7 w-7" />,
  Palette: <Palette className="h-7 w-7" />,
  Brush: <Brush className="h-7 w-7" />,
  Rocket: <Rocket className="h-7 w-7" />,
  Globe: <Globe className="h-7 w-7" />,
  Layers: <Layers className="h-7 w-7" />,
  Cpu: <Cpu className="h-7 w-7" />,
  Smartphone: <Smartphone className="h-7 w-7" />,
  Cloud: <Cloud className="h-7 w-7" />,
};

interface Service {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  imageUrl?: string;
  iconKey: string;
  features: string[];
  deliverables: string[];
}

export default function ServicesPage() {
  const { language, t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setServices(data.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={language === "fr" ? "Nos Services" : "Our Services"}
        description={
          language === "fr"
            ? "Des solutions technologiques de bout en bout pour votre projet, votre application et votre infrastructure."
            : "End-to-end technology solutions for your project, your app, and your infrastructure."
        }
        breadcrumb={[
          { label: t.nav.home, href: "/" },
          { label: "Services", href: "/services" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-nexus-gray" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="py-16 text-center text-nexus-navy/50">
            {language === "fr"
              ? "Aucun service disponible pour le moment."
              : "No services available right now."}
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group relative flex flex-col rounded-2xl border border-nexus-navy/10 bg-white p-8 transition-all duration-300 hover:border-nexus-cyan/40 hover:shadow-xl hover:shadow-nexus-cyan/5"
              >
                {service.imageUrl && (
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="h-full w-full object-cover opacity-10"
                    />
                  </div>
                )}
                <div className="relative z-10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-nexus-cyan/10 text-nexus-cyan transition-colors group-hover:bg-nexus-cyan group-hover:text-white">
                    {ICONS[service.iconKey] || <Code2 className="h-7 w-7" />}
                  </span>
                  <h2 className="mt-5 text-2xl font-bold text-nexus-dark">
                    <TranslatedText>{service.title}</TranslatedText>
                  </h2>
                  {service.tagline && (
                    <p className="mt-1 text-sm font-medium uppercase tracking-wide text-nexus-cyan">
                      <TranslatedText>{service.tagline}</TranslatedText>
                    </p>
                  )}
                  <p className="mt-4 leading-relaxed text-nexus-navy/70">
                    <TranslatedText as="span">{service.description}</TranslatedText>
                  </p>
                  {(service.features || []).length > 0 && (
                    <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                      {service.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-nexus-navy/70">
                          <Check className="h-4 w-4 shrink-0 text-nexus-cyan" />
                          <TranslatedText>{feature}</TranslatedText>
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-nexus-cyan group-hover:gap-3 transition-all">
                    {language === "fr" ? "Voir les détails" : "View details"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CTA
        title={
          language === "fr"
            ? "Un projet en tête, mais pas sûr de la démarche ?"
            : "Have a project in mind but not sure where to start?"
        }
        description={
          language === "fr"
            ? "Parlons-en. Équipez NEXUS pour définir la bonne solution."
            : "Let's talk. Tell NEXUS and we'll shape the right solution."
        }
        primaryLabel={language === "fr" ? "Contactez-nous" : "Contact us"}
        primaryHref="/contact"
        secondaryLabel={language === "fr" ? "Devenir partenaire" : "Partner with us"}
        secondaryHref="/partner"
      />
    </div>
  );
}
