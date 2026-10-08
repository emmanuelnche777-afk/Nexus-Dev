"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Check,
  ArrowRight,
  Mail,
  MessageCircle,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CTA from "@/components/CTA";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CONTACT } from "@/lib/site";
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

export default function ServiceDetailPage() {
  const { language, t } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/services/${slug}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.resolve({ service: null })))
      .then((data) => {
        if (data.service) setService(data.service);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-nexus-white px-6 py-32 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="bg-nexus-white px-6 py-32 text-center">
        <h1 className="text-3xl font-bold text-nexus-dark">
          {language === "fr" ? "Service introuvable" : "Service not found"}
        </h1>
        <p className="mt-3 text-nexus-navy/60">
          {language === "fr"
            ? "Le service que vous recherchez n'existe pas ou n'est plus disponible."
            : "The service you are looking for does not exist or is no longer available."}
        </p>
        <Link
          href="/services"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-6 py-3 font-semibold text-white"
        >
          {language === "fr" ? "Voir tous les services" : "View all services"}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={<TranslatedText>{service.title}</TranslatedText>}
        description={<TranslatedText>{service.tagline || service.description}</TranslatedText>}
        breadcrumb={[
          { label: t.nav.home, href: "/" },
          { label: "Services", href: "/services" },
          { label: <TranslatedText>{service.title}</TranslatedText>, href: `/services/${service.slug}` },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-nexus-cyan/10 text-nexus-cyan">
                {ICONS[service.iconKey] || <Code2 className="h-8 w-8" />}
              </span>
              <h2 className="text-3xl font-bold text-nexus-dark"><TranslatedText>{service.title}</TranslatedText></h2>
            </div>

            {service.imageUrl && (
              <div className="mt-8 overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="h-80 w-full object-cover"
                />
              </div>
            )}

            <div className="mt-8 leading-relaxed text-nexus-navy/75">
              {service.description.split("\n").map((paragraph, i) => (
                <p key={i} className="mb-4">
                  <TranslatedText as="span">{paragraph}</TranslatedText>
                </p>
              ))}
            </div>

            {(service.deliverables || []).length > 0 && (
              <div className="mt-10 rounded-2xl border border-nexus-navy/10 bg-white p-8">
                <h3 className="text-xl font-bold text-nexus-dark">
                  {language === "fr" ? "Ce qui est inclus" : "What's included"}
                </h3>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.deliverables.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-nexus-navy/75">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nexus-cyan/10">
                        <Check className="h-4 w-4 text-nexus-cyan" />
                      </span>
                      <TranslatedText>{item}</TranslatedText>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-nexus-navy/10 bg-white p-6">
                <h3 className="font-bold text-nexus-dark">
                  {language === "fr" ? "Prêt à démarrer ?" : "Ready to get started?"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy/65">
                  {language === "fr"
                    ? "Racontez-nous votre projet. Nous vous répondons sous 24 à 48 heures avec une proposition, un coût et un calendrier adaptés."
                    : "Tell us about your project. We'll get back within 24–48 hours with a proposal, cost, and timeline tailored to you."}
                </p>
                <Link
                  href={`/services/${service.slug}/order`}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-nexus-cyan px-6 py-3 font-semibold text-white transition hover:bg-nexus-cyan-dark"
                >
                  {language === "fr" ? "Commander ce service" : "Order this service"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="mt-4 grid gap-3">
                  <a
                    href={`https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello NEXUS! I'm interested in ${service.title}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Service inquiry: ${service.title}`)}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-nexus-navy/10 px-6 py-3 text-sm font-semibold text-nexus-navy/70 hover:bg-nexus-navy/5"
                  >
                    <Mail className="h-4 w-4" />
                    {language === "fr" ? "Email" : "Email"}
                  </a>
                </div>
              </div>

              {(service.features || []).length > 0 && (
                <div className="rounded-2xl border border-nexus-navy/10 bg-white p-6">
                  <h3 className="font-bold text-nexus-dark">
                    {language === "fr" ? "Points forts" : "Highlights"}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-nexus-navy/75">
                        <Check className="h-4 w-4 shrink-0 text-nexus-cyan" />
                        <TranslatedText>{feature}</TranslatedText>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <CTA
        title={
          language === "fr"
            ? "Prêt à construire votre projet avec NEXUS ?"
            : "Ready to build your project with NEXUS?"
        }
        description={
          language === "fr"
            ? "Soumettez une demande et recevez une proposition, le coût et la durée sous 24 à 48 heures."
            : "Submit a request and get a proposal, cost, and timeline within 24–48 hours."
        }
        primaryLabel={language === "fr" ? "Commander ce service" : "Order this service"}
        primaryHref={`/services/${service.slug}/order`}
        secondaryLabel={language === "fr" ? "Voir tous les services" : "Browse all services"}
        secondaryHref="/services"
      />
    </div>
  );
}
