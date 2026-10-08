"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2, Code2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";

interface Service {
  slug: string;
  title: string;
}

const TIMELINE_OPTIONS = [
  { value: "asap", en: "As soon as possible", fr: "Dès que possible" },
  { value: "1-month", en: "Within a month", fr: "Dans un mois" },
  { value: "2-3-months", en: "2 to 3 months", fr: "2 à 3 mois" },
  { value: "flexible", en: "Flexible — you advise me", fr: "Flexible — vous me conseillez" },
];

export default function OrderPage() {
  const { language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    description: "",
    examples: "",
    desiredTimeline: "flexible",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/services/${slug}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.resolve({ service: null })))
      .then((data) => setService(data.service || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          description: [
            form.description,
            form.examples ? `Examples / links:\n${form.examples}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
          desiredTimeline: form.desiredTimeline,
          serviceType: service?.title || "General Inquiry",
          serviceTypeKey: service?.slug || "general",
          source: "web",
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={language === "fr" ? "Commander ce service" : "Order this service"}
        description={service?.title || (language === "fr" ? "Service" : "Service")}
        breadcrumb={[
          { label: language === "fr" ? "Accueil" : "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service?.title || "…", href: `/services/${slug}` },
          { label: language === "fr" ? "Commander" : "Order", href: `/services/${slug}/order` },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link
          href={`/services/${slug}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-nexus-navy/60 hover:text-nexus-cyan"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === "fr" ? "Retour au service" : "Back to service"}
        </Link>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h2 className="mt-5 text-2xl font-bold text-nexus-dark">
              {language === "fr" ? "Demande envoyée !" : "Request sent!"}
            </h2>
            <p className="mt-3 leading-relaxed text-nexus-navy/70">
              {language === "fr"
                ? "Merci ! Notre équipe a été notifiée et vous répondra sous 24 à 48 heures avec une proposition, le coût et la durée de réalisation."
                : "Thank you! Our team has been notified and will reply within 24–48 hours with a proposal, cost, and how long it will take."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/services"
                className="rounded-lg bg-nexus-cyan px-6 py-3 font-semibold text-white hover:bg-nexus-cyan-dark"
              >
                {language === "fr" ? "Voir les services" : "View services"}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-nexus-cyan" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-nexus-navy/10 bg-white p-8">
                {service && (
                  <div className="flex items-center gap-3 rounded-xl bg-nexus-cyan/5 px-4 py-3">
                    <Code2 className="h-5 w-5 text-nexus-cyan" />
                    <p className="text-sm font-semibold text-nexus-dark">
                      {language === "fr" ? "Service sélectionné :" : "Selected service:"}{" "}
                      <TranslatedText>{service.title}</TranslatedText>
                    </p>
                  </div>
                )}

                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-nexus-dark">
                      {language === "fr" ? "Nom complet *" : "Full name *"}
                    </label>
                    <input
                      required
                      minLength={2}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-4 py-2.5 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-dark">
                      {language === "fr" ? "Email *" : "Email *"}
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-4 py-2.5 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-nexus-dark">
                      {language === "fr" ? "Téléphone" : "Phone"}
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+237 ..."
                      className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-4 py-2.5 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-dark">
                      {language === "fr" ? "Entreprise / Organisation" : "Company / Organization"}
                    </label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-4 py-2.5 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-dark">
                    {language === "fr"
                      ? "Décrivez ce que vous souhaitez que nous construisions *"
                      : "Tell us what you want us to build/do *"}
                  </label>
                  <textarea
                    required
                    minLength={10}
                    rows={5}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={
                      language === "fr"
                        ? "Décrivez votre projet, son objectif, vos exigences..."
                        : "Describe your project, its goal, your requirements..."
                    }
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-4 py-2.5 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-dark">
                    {language === "fr"
                      ? "Exemples / liens (optionnel)"
                      : "Examples / links (optional)"}
                  </label>
                  <input
                    value={form.examples}
                    onChange={(e) => setForm({ ...form, examples: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-4 py-2.5 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-dark">
                    {language === "fr"
                      ? "Votre échéance souhaitée"
                      : "Your desired timeline"}
                  </label>
                  <select
                    value={form.desiredTimeline}
                    onChange={(e) => setForm({ ...form, desiredTimeline: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-4 py-2.5 text-sm focus:border-nexus-cyan focus:outline-none"
                  >
                    {TIMELINE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {language === "fr" ? opt.fr : opt.en}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-nexus-navy/50">
                    {language === "fr"
                      ? "Nous confirmerons le coût et la durée après évaluation de votre projet."
                      : "We'll confirm the cost and duration after evaluating your project."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-nexus-cyan px-6 py-3.5 font-semibold text-white transition hover:bg-nexus-cyan-dark disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === "fr" ? "Envoi..." : "Sending..."}
                    </>
                  ) : (
                    <>
                      {language === "fr" ? "Envoyer la demande" : "Submit request"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-nexus-navy/50">
                  {language === "fr"
                    ? "Soumettre cette demande nous notifie immédiatement. Un conseiller vous répondra avec le coût et la durée de réalisation."
                    : "Submitting this order notifies our team immediately. An advisor will reply with the cost and duration."}
                </p>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
}
