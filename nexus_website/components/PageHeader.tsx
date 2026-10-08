import Link from "next/link";
import type { ReactNode } from "react";

type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  subtitle?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  subtitle,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-nexus-cyan/10 bg-nexus-dark">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-nexus-navy/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-nexus-cyan/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-6 flex items-center gap-2 text-sm text-nexus-gray/60">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-nexus-cyan/40">›</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="transition hover:text-nexus-cyan-bright"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-nexus-gray/80">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <p className="mb-3 rounded-full border border-nexus-cyan/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-nexus-cyan-bright">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-nexus-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-xl font-medium leading-relaxed text-nexus-cyan-bright">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-nexus-gray/80">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
