import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  dark?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-widest ${
          dark ? "text-nexus-cyan-bright" : "text-nexus-cyan"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`text-3xl font-bold leading-tight sm:text-4xl ${
          dark ? "text-nexus-white" : "text-nexus-dark"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            dark ? "text-nexus-gray/75" : "text-nexus-navy/70"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
