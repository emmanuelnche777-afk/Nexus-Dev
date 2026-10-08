import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MessageCircle, ShieldCheck, HelpCircle } from "lucide-react";
import { SITE_NAME, CONTACT, NAV_LINKS, SOCIAL_LINKS } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePublicSettings } from "@/components/PublicSettingsProvider";

export default function Footer() {
  const { t } = useLanguage();
  const { settings: publicSettings } = usePublicSettings();
  const mainLinks = NAV_LINKS.filter((l) =>
    l.label !== "Divisions" && (l.label !== "Blog" || publicSettings.blog)
  );
  const p = t.footer;
  const settings = {
    contactEmail: publicSettings.contactEmail || CONTACT.email,
    supportEmail: publicSettings.supportEmail,
    phone: publicSettings.phone || CONTACT.phone,
    whatsapp: CONTACT.whatsapp,
  };

  const getLabel = (label: string) => {
    switch (label) {
      case "Home": return t.nav.home;
      case "About": return t.nav.about;
      case "Divisions": return t.nav.divisions;
      case "Journey": return t.nav.journey;
      case "Blog": return t.nav.blog;
      case "Join Us": return t.nav.joinUs;
      case "Contact": return t.nav.contact;
      default: return label;
    }
  };

  return (
    <footer className="border-t border-nexus-cyan/20 bg-nexus-dark text-nexus-gray">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logo/nexus-logo-sm.jpg"
                alt="NEXUS logo"
                width={36}
                height={36}
                className="rounded-full object-cover"
                unoptimized
              />
              <span className="text-lg font-bold tracking-widest text-nexus-white">
                {publicSettings.siteName || SITE_NAME}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-nexus-gray/70">
              {publicSettings.siteDescription || p.tagline}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-1.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="truncate rounded-md bg-nexus-navy px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-nexus-white transition hover:bg-nexus-cyan hover:text-nexus-dark"
                >
                  {social.label}
                </a>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-nexus-gray/60">
              <span className="mt-0.5 inline-flex h-2 w-2 rounded-full bg-nexus-cyan" />
              <span>{publicSettings.address || p.locationText}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-nexus-cyan-bright">
              {p.site}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-nexus-gray/70 transition hover:text-nexus-cyan-bright"
                  >
                    {getLabel(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-nexus-cyan-bright">
              {p.resources}
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/faq"
                  className="flex items-center gap-1.5 text-sm text-nexus-gray/70 transition hover:text-nexus-cyan-bright"
                >
                  <HelpCircle className="h-4 w-4 text-nexus-cyan" />
                  {p.faq}
                </Link>
              </li>
              {publicSettings.certificateVerification && <li>
                <Link
                  href="/academy/verify"
                  className="flex items-center gap-1.5 text-sm text-nexus-gray/70 transition hover:text-nexus-cyan-bright"
                >
                  <ShieldCheck className="h-4 w-4 text-nexus-cyan" />
                  {p.verifyRegistration}
                </Link>
              </li>}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-nexus-cyan-bright">
              {p.legal}
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-nexus-gray/70 transition hover:text-nexus-cyan-bright"
                >
                  {p.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-nexus-gray/70 transition hover:text-nexus-cyan-bright"
                >
                  {p.termsOfUse}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-nexus-gray/70 transition hover:text-nexus-cyan-bright"
                >
                  {p.contactUs}
                </Link>
              </li>
            </ul>
            <div className="mt-5 rounded-md border border-nexus-cyan/20 bg-nexus-navy/40 p-3 text-xs leading-relaxed text-nexus-gray/70">
              {p.governanceNote}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-nexus-cyan-bright">
              {p.contactTitle}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-2 text-sm text-nexus-gray/70 transition hover:text-nexus-cyan-bright"
                >
                  <Phone className="h-4 w-4 text-nexus-cyan" />
                  <div>
                    <p className="font-medium text-nexus-gray/90">{settings.phone}</p>
                    <p className="text-xs text-nexus-gray/50">{p.contactPhoneLabel}</p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                  className="flex items-center gap-2 text-sm text-nexus-gray/70 transition hover:text-nexus-cyan-bright"
                >
                  <MessageCircle className="h-4 w-4 text-nexus-cyan" />
                  <div>
                    <p className="font-medium text-nexus-gray/90">{settings.whatsapp}</p>
                    <p className="text-xs text-nexus-gray/50">{p.contactWhatsappLabel}</p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-center gap-2 text-sm text-nexus-gray/70 transition hover:text-nexus-cyan-bright"
                >
                  <Mail className="h-4 w-4 text-nexus-cyan" />
                  <div>
                    <p className="font-medium text-nexus-gray/90">{settings.contactEmail}</p>
                    <p className="text-xs text-nexus-gray/50">{p.contactEmailLabel}</p>
                  </div>
                </a>
                {settings.supportEmail && (
                  <p className="mt-1 text-xs text-nexus-gray/60">
                    Support: {settings.supportEmail}
                  </p>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-nexus-cyan/10 pt-6 sm:flex-row">
          <p className="text-xs text-nexus-gray/60">
            © {new Date().getFullYear()} {publicSettings.siteName || SITE_NAME}. {p.copyright}
          </p>
          <p className="text-xs text-nexus-gray/60">
            {p.builtWith}
          </p>
        </div>
      </div>
    </footer>
  );
}
