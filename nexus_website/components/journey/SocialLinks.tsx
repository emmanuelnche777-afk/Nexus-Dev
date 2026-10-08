"use client";

import { MessageCircle, ExternalLink } from "lucide-react";
import Reveal from "@/components/divisions/tech-hub/Reveal";
import TiltCard from "@/components/divisions/tech-hub/TiltCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CONTACT } from "@/lib/site";

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  hoverBg: string;
}

const InstagramIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TiktokIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.2a8.16 8.16 0 005.58 2.17V12a4.83 4.83 0 01-3.77-1.28V6.69h3.77z" />
  </svg>
);

export default function SocialLinks() {
  const { t } = useLanguage();
  const jp = t.journeyPage;

  const platforms: SocialPlatform[] = [
    {
      name: "Instagram",
      icon: <InstagramIcon />,
      href: "https://www.instagram.com/nexu.s06?igsi=N3ZtOXh2Y3A3YWcw",
      color: "#E4405F",
      hoverBg: "hover:border-[#E4405F]/40",
    },
    {
      name: "LinkedIn",
      icon: <LinkedinIcon />,
      href: "https://www.linkedin.com/in/nexus-group-600611423",
      color: "#0A66C2",
      hoverBg: "hover:border-[#0A66C2]/40",
    },
    {
      name: "YouTube",
      icon: <YoutubeIcon />,
      href: "https://www.youtube.com/channel/UC5EPNwhG-1OyqSW7YrzzX_A",
      color: "#FF0000",
      hoverBg: "hover:border-[#FF0000]/40",
    },
    {
      name: "TikTok",
      icon: <TiktokIcon />,
      href: "https://vm.tiktok.com/ZS9BMsLQxxB5Y-asRce/",
      color: "#000000",
      hoverBg: "hover:border-white/40",
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-6 w-6" />,
      href: `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`,
      color: "#25D366",
      hoverBg: "hover:border-[#25D366]/40",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-nexus-navy-deep py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
            {jp.socialEyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {jp.socialTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-nexus-gray/70">
            {jp.socialDesc}
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {platforms.map((platform, i) => (
            <Reveal key={platform.name} variant="flat" delay={i * 60}>
              <TiltCard className="h-full">
                <a
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex h-full flex-col items-center gap-4 rounded-xl border border-nexus-cyan/15 bg-nexus-dark/60 p-6 text-center transition-all duration-300 hover:bg-nexus-dark hover:shadow-xl ${platform.hoverBg}`}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ color: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white transition group-hover:text-nexus-cyan-bright">
                      {platform.name}
                    </h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-nexus-gray/50 transition group-hover:text-nexus-cyan">
                      {jp.socialFollow} <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
