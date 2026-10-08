"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Mail } from "lucide-react";
import { CONTACT } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Status = "idle" | "loading" | "success" | "error";

function WhatsAppLink({ label }: { label: string }) {
  const href = `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm font-medium text-nexus-cyan-bright transition hover:text-nexus-cyan"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}

export default function PartnerForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const p = t.partnerPage;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (String(fd.get("hp") ?? "").trim() !== "") {
      setStatus("success");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const payload = {
      orgName: String(fd.get("orgName") ?? "").trim(),
      contactName: String(fd.get("contactName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      orgType: String(fd.get("orgType") ?? ""),
      website: String(fd.get("website") ?? "").trim(),
      interest: String(fd.get("interest") ?? ""),
      message: String(fd.get("message") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "request_failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg(p.formError);
    }
  }

  const inputClass =
    "w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan";
  const labelClass = "mb-1 block text-sm font-medium text-nexus-dark";

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        {status === "success" ? (
          <div className="flex h-full flex-col items-start justify-center rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-8">
            <CheckCircle2 className="h-10 w-10 text-nexus-cyan" />
            <h3 className="mt-4 text-xl font-bold text-nexus-dark">{p.sentSuccess}</h3>
            <p className="mt-2 text-sm leading-relaxed text-nexus-navy/70">
              {p.formSideText}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="orgName" className={labelClass}>
                  {p.orgNameLabel} *
                </label>
                <input id="orgName" name="orgName" placeholder={p.orgPlaceholder} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="contactName" className={labelClass}>
                  {p.contactNameLabel} *
                </label>
                <input id="contactName" name="contactName" placeholder={p.contactPlaceholder} required className={inputClass} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelClass}>
                  {p.emailLabel} *
                </label>
                <input id="email" name="email" type="email" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="website" className={labelClass}>
                  {p.formWebsiteLabel}
                </label>
                <input id="website" name="website" type="url" placeholder="https://" className={inputClass} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="orgType" className={labelClass}>
                  {p.typeLabel} *
                </label>
                <select id="orgType" name="orgType" required className={inputClass} defaultValue="">
                  <option value="" disabled>
                    {p.typeSelect}
                  </option>
                  <option value="corporate">{p.tCorporate}</option>
                  <option value="ngo">{p.tNgo}</option>
                  <option value="government">{p.tGovernment}</option>
                  <option value="education">{p.tEducational}</option>
                  <option value="individual">{p.tIndividual}</option>
                </select>
              </div>
              <div>
                <label htmlFor="interest" className={labelClass}>
                  {p.formInterestLabel} *
                </label>
                <select id="interest" name="interest" required className={inputClass} defaultValue="">
                  <option value="" disabled>
                    {p.interestSelect}
                  </option>
                  <option value="sponsorship">{p.interestSponsorship}</option>
                  <option value="tech">{p.interestTech}</option>
                  <option value="talent">{p.interestTalent}</option>
                  <option value="community">{p.interestCommunity}</option>
                  <option value="research">{p.interestResearch}</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className={labelClass}>
                {p.messageLabel} *
              </label>
              <textarea
                id="message"
                name="message"
                placeholder={p.messagePlaceholder}
                required
                rows={4}
                className={inputClass}
              />
            </div>

            <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            {status === "error" && (
              <p className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-nexus-navy px-6 py-3 text-sm font-semibold text-nexus-white transition hover:bg-nexus-navy-deep disabled:opacity-60"
            >
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {p.submitBtn}
            </button>
          </form>
        )}
      </div>

      <aside className="lg:col-span-2">
        <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-dark p-6 text-nexus-white">
          <h3 className="text-lg font-bold">{p.formSideTitle}</h3>
          <p className="mt-3 text-sm leading-relaxed text-nexus-gray/80">{p.formSideText}</p>
          <div className="mt-6 space-y-3 border-t border-nexus-cyan/10 pt-6">
            <WhatsAppLink label={p.whatsappAlt} />
            <p className="flex items-center gap-2 text-sm text-nexus-gray/80">
              <Mail className="h-4 w-4 text-nexus-cyan-bright" />
              {p.emailAlt}{" "}
              <a href={`mailto:${CONTACT.email}`} className="font-medium text-nexus-cyan-bright hover:text-nexus-cyan">
                {CONTACT.email}
              </a>
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
