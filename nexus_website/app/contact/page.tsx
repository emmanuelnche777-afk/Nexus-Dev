"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { CONTACT } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePublicSettings } from "@/components/PublicSettingsProvider";
import { isContactDepartment } from "@/lib/contact-routing";

export default function Contact() {
  const { settings: publicSettings } = usePublicSettings();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "general",
    subject: "General Inquiry",
    message: "",
  });
  const { t, language } = useLanguage();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requestedDepartment = new URLSearchParams(window.location.search).get("department");
      if (isContactDepartment(requestedDepartment)) {
        setFormData((current) => ({ ...current, department: requestedDepartment }));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send message. Please try again.");
        return;
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", department: "general", subject: "General Inquiry", message: "" });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={t.contactPage.title}
        description={t.contactPage.description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-nexus-dark">
                {t.contactPage.directTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-nexus-navy">
                {t.contactPage.getInTouchDesc}
              </p>
              <div className="mt-8 space-y-4">
                <a
                  href={`https://wa.me/${CONTACT.whatsapp.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-4 transition hover:border-nexus-cyan"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-nexus-dark">
                      {t.contactPage.whatsapp}
                    </span>
                    <span className="block text-sm text-nexus-navy">
                      {CONTACT.whatsapp}
                    </span>
                  </span>
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-4 rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-4 transition hover:border-nexus-cyan"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-nexus-dark">
                      {t.contactPage.email}
                    </span>
                    <span className="block text-sm text-nexus-navy">
                      {CONTACT.email}
                    </span>
                  </span>
                </a>
                <a
                  href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-4 rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-4 transition hover:border-nexus-cyan"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-nexus-dark">
                      {t.contactPage.phone}
                    </span>
                    <span className="block text-sm text-nexus-navy">
                      {CONTACT.phone}
                    </span>
                  </span>
                </a>
              </div>

              {publicSettings.certificateVerification && <div className="mt-8 rounded-lg border border-nexus-cyan/20 bg-nexus-gray/50 p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-nexus-cyan" />
                  <h3 className="text-sm font-semibold text-nexus-dark">
                    {t.footer.verifyRegistration}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-nexus-gray/75">
                  {t.academyPage.verifyText}
                </p>
                <Link
                  href="/academy/verify"
                  className="mt-4 inline-block rounded-md border border-nexus-cyan/40 px-5 py-2.5 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
                >
                  {t.footer.verifyRegistration}
                </Link>
              </div>}
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-8">
                <h2 className="text-2xl font-bold text-nexus-dark">
                  {t.contactPage.formTitle}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                  {t.contactPage.getInTouchDesc}
                </p>

                {submitted ? (
                  <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    <h4 className="mt-3 text-lg font-bold text-nexus-dark">
                      {t.contactPage.sentSuccess}
                    </h4>
                    <p className="mt-2 text-sm text-nexus-navy">
                      {language === "fr"
                        ? "Nous vous répondrons dans les 24-48 heures ouvrables."
                        : "We'll get back to you within 24-48 business hours."}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setError("");
                        }}
                        className="rounded-md border border-nexus-cyan/40 px-5 py-2.5 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
                      >
                        {language === "fr" ? "Envoyer un autre message" : "Send another message"}
                      </button>
                      <a
                        href={`https://wa.me/${CONTACT.whatsapp.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-nexus-cyan px-5 py-2.5 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
                      >
                        {t.contactPage.chatOnWhatsApp}
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {error && (
                      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="cname"
                          className="mb-1 block text-sm font-medium text-nexus-dark"
                        >
                          {t.contactPage.nameLabel} *
                        </label>
                        <input
                          id="cname"
                          placeholder={t.contactPage.namePlaceholder}
                          required
                          minLength={2}
                          maxLength={100}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={submitting}
                          className="w-full rounded-md border border-nexus-navy/20 bg-nexus-white px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="cemail"
                          className="mb-1 block text-sm font-medium text-nexus-dark"
                        >
                          {t.contactPage.emailLabel} *
                        </label>
                        <input
                          id="cemail"
                          type="email"
                          placeholder={t.contactPage.emailPlaceholder}
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={submitting}
                          className="w-full rounded-md border border-nexus-navy/20 bg-nexus-white px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="cphone"
                          className="mb-1 block text-sm font-medium text-nexus-dark"
                        >
                          {language === "fr" ? "Téléphone (optionnel)" : "Phone (optional)"}
                        </label>
                        <input
                          id="cphone"
                          type="tel"
                          placeholder="+237 6XX XXX XXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={submitting}
                          className="w-full rounded-md border border-nexus-navy/20 bg-nexus-white px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="cdepartment"
                          className="mb-1 block text-sm font-medium text-nexus-dark"
                        >
                          {language === "fr" ? "Équipe concernée" : "Which team would you like to contact?"} *
                        </label>
                        <select
                          id="cdepartment"
                          required
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          disabled={submitting}
                          className="w-full rounded-md border border-nexus-navy/20 bg-nexus-white px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan disabled:opacity-50"
                        >
                          <option value="general">{language === "fr" ? "Général / Je ne sais pas" : "General / Not sure"}</option>
                          <option value="academy">Academy</option>
                          <option value="tech_hub">Tech Hub</option>
                          <option value="mentorship">{language === "fr" ? "Mentorat" : "Mentorship"}</option>
                          <option value="partnership">{language === "fr" ? "Partenariat" : "Partnership"}</option>
                          <option value="foundation">Foundation</option>
                        </select>
                        <p className="mt-1 text-xs text-nexus-navy/60">
                          {language === "fr" ? "Votre message sera transmis à l’équipe choisie." : "Your message will be sent to the selected team."}
                        </p>
                      </div>
                      <div>
                        <label
                          htmlFor="csubject"
                          className="mb-1 block text-sm font-medium text-nexus-dark"
                        >
                          {language === "fr" ? "Sujet" : "Subject"}
                        </label>
                        <select
                          id="csubject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          disabled={submitting}
                          className="w-full rounded-md border border-nexus-navy/20 bg-nexus-white px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan disabled:opacity-50"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Press / Media">Press / Media</option>
                          <option value="Career">Career</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="cmessage"
                        className="mb-1 block text-sm font-medium text-nexus-dark"
                      >
                        {t.contactPage.messageLabel} *
                      </label>
                      <textarea
                        id="cmessage"
                        placeholder={t.contactPage.messagePlaceholder}
                        required
                        rows={6}
                        minLength={10}
                        maxLength={2000}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        disabled={submitting}
                        className="w-full rounded-md border border-nexus-navy/20 bg-nexus-white px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-nexus-navy/60">
                        {formData.message.length}/2000
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-nexus-navy px-6 py-3 text-sm font-semibold text-nexus-white transition hover:bg-nexus-navy-deep disabled:opacity-50"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {submitting
                        ? language === "fr" ? "Envoi en cours..." : "Sending..."
                        : t.contactPage.sendBtn}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-nexus-cyan/10 bg-nexus-gray py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-nexus-dark mb-4">
            {t.home.explorePrograms}
          </h2>
          <p className="text-base text-nexus-navy mb-8 max-w-2xl mx-auto">
            {language === "fr"
              ? "Découvrez nos programmes de formation en développement, design et intelligence artificielle."
              : "Discover our training programs in development, design, and artificial intelligence."}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/academy"
              className="rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
            >
              {t.home.explorePrograms}
            </Link>
            <Link
              href="/academy/curriculum"
              className="rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
            >
              {language === "fr" ? "Voir le curriculum" : "View Curriculum"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
