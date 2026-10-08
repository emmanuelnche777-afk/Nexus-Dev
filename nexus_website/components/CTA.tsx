import Link from "next/link";

type CTAProps = {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  tertiaryLabel?: string;
  tertiaryHref?: string;
};

export default function CTA({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  tertiaryLabel,
  tertiaryHref,
}: CTAProps) {
  return (
    <section className="relative overflow-hidden bg-nexus-dark">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-nexus-cyan/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-nexus-navy/60 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold text-nexus-white sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-nexus-gray/75">
            {description}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
          >
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
            >
              {secondaryLabel}
            </Link>
          )}
          {tertiaryLabel && tertiaryHref && (
            <Link
              href={tertiaryHref}
              className="rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
            >
              {tertiaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
