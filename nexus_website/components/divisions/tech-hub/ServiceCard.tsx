"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ServiceCardProps = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  bgColor: string;
  href: string;
  ctaLabel: string;
  delay?: number;
};

export default function ServiceCard({
  title,
  description,
  image,
  imageAlt,
  bgColor,
  href,
  ctaLabel,
  delay = 0,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-xl p-6 text-white transition-all duration-500 md:min-h-[380px] md:p-8 ${bgColor}`}
      data-aos="fade-up-30"
      data-aos-delay={delay}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover opacity-30 transition-transform duration-500 ease-out md:group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nexus-dark/90 via-nexus-dark/70 to-nexus-dark/40" />
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold leading-tight md:text-2xl">
          {title}
        </h3>
        <p className="mt-4 text-sm leading-relaxed opacity-80 md:text-base">
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-8 flex w-full items-start justify-between">
        <div className="relative h-12 w-full overflow-hidden md:h-16">
          <div className="absolute left-0 font-mono text-xs uppercase tracking-wider text-nexus-cyan-bright transition-all duration-500 ease-in-out md:translate-y-12 md:delay-150 md:group-hover:translate-y-0">
            {ctaLabel}
          </div>
          <div className="transition-all duration-500 ease-out md:delay-200 md:group-hover:-translate-y-full md:group-hover:delay-0">
            <ArrowRight className="h-10 w-10 text-nexus-cyan-bright md:h-12 md:w-12" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}
