"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TerminalCtaProps = {
  command: string;
  outputLines: string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  footnote: string;
};

export default function TerminalCta({
  command,
  outputLines,
  primaryLabel,
  primaryHref,
  secondaryHref,
  secondaryLabel,
  footnote,
}: TerminalCtaProps) {
  const [typed, setTyped] = useState(0);
  const [shownLines, setShownLines] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      const deferred = setTimeout(() => {
        setTyped(command.length);
        setShownLines(outputLines.length);
      }, 0);
      return () => clearTimeout(deferred);
    }

    const lineTimers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 55;
      if (elapsed < 500) return;
      setTyped((prev) => {
        if (prev + 1 >= command.length && lineTimers.length === 0) {
          clearInterval(interval);
          outputLines.forEach((_, i) => {
            lineTimers.push(
              setTimeout(
                () => setShownLines((n) => Math.max(n, i + 1)),
                350 * (i + 1)
              )
            );
          });
        }
        return prev + 1;
      });
    }, 55);

    return () => {
      clearInterval(interval);
      lineTimers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const done = shownLines >= outputLines.length;

  return (
    <div className="overflow-hidden rounded-xl border border-nexus-cyan/20 bg-[#070a26] shadow-[0_30px_80px_-30px_rgba(15,18,63,0.9)]">
      <div className="flex items-center gap-2 border-b border-nexus-cyan/10 px-5 py-3.5">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
        <span className="h-3 w-3 rounded-full bg-green-400/80" />
        <span className="ml-3 font-mono text-xs tracking-widest text-nexus-gray/50">
          nexus:tech-hub — zsh
        </span>
      </div>

      <div className="min-h-[190px] p-6 font-mono text-sm leading-loose sm:p-8">
        <p className="text-nexus-gray/90">
          <span className="mr-2 text-nexus-cyan-bright">$</span>
          {command.slice(0, typed)}
          {typed < command.length && (
            <span className="th-caret ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-nexus-cyan-bright" />
          )}
        </p>

        {outputLines.map((line, i) => (
          <p
            key={i}
            className={`mt-1 text-nexus-cyan transition-opacity duration-500 ${
              i < shownLines ? "opacity-100" : "opacity-0"
            }`}
          >
            {line}
          </p>
        ))}

        <div
          className={`mt-7 flex flex-col gap-3 transition-all duration-700 sm:flex-row ${
            done ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <Link
            href={primaryHref}
            tabIndex={done ? 0 : -1}
            className="inline-flex items-center justify-center rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            tabIndex={done ? 0 : -1}
            className="inline-flex items-center justify-center rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>

      <p className="border-t border-nexus-cyan/10 px-6 py-3 font-mono text-xs text-nexus-gray/40">
        {footnote}
      </p>
    </div>
  );
}
