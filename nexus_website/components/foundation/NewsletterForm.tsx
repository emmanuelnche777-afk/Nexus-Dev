"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { usePublicSettings } from "@/components/PublicSettingsProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type NewsletterFormProps = {
  placeholder: string;
  buttonLabel: string;
  successMessage: string;
  invalidMessage: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm({
  placeholder,
  buttonLabel,
  successMessage,
  invalidMessage,
}: NewsletterFormProps) {
  const { settings, loading } = usePublicSettings();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setEmail("");
      } else if (data.error === "invalid_email") {
        setStatus("error");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (loading || !settings.newsletter) return null;

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-nexus-cyan/40 bg-white/5 px-6 py-5 backdrop-blur-sm">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-nexus-cyan" />
        <p className="text-sm font-medium text-white">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row"
        noValidate
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`h-13 flex-1 rounded-full border bg-white/95 px-6 py-3.5 text-sm text-nexus-dark outline-none transition placeholder:text-nexus-dark/40 focus:ring-2 ${
            status === "error"
              ? "border-nexus-navy focus:ring-nexus-navy/30"
              : "border-transparent focus:border-nexus-cyan focus:ring-nexus-cyan/25"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-cyan px-7 py-3.5 text-sm font-bold text-nexus-dark shadow-lg shadow-black/20 transition hover:bg-nexus-cyan-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      <p className="mt-3 px-2 text-xs text-white/60">
        {language === "fr"
          ? "En vous abonnant, vous acceptez de recevoir des actualités de NEXUS par e-mail. Vous pouvez vous désabonner à tout moment."
          : "By subscribing, you agree to receive occasional NEXUS email updates. You can unsubscribe at any time."}
      </p>
      {status === "error" && (
        <p className="mt-3 pl-2 text-sm font-medium text-nexus-cyan-bright">
          {invalidMessage}
        </p>
      )}
    </div>
  );
}
