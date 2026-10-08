"use client";


import type { ContentBlock } from "@/lib/blog/types";
import TranslatedText from "@/components/TranslatedText";

export default function TableOfContents({ blocks, translateHeadings = false }: { blocks: ContentBlock[]; translateHeadings?: boolean }) {
  const headings = blocks
    .filter((block) => block.type === "h2")
    .map((block) => block.content);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden lg:block sticky top-24 self-start w-64 p-4 border border-nexus-cyan/10 rounded-lg bg-nexus-white">
      <h3 className="font-bold text-nexus-dark mb-4">Table of Contents</h3>
      <ul className="space-y-2">
        {headings.map((heading, i) => (
          <li key={i}>
            <a
              href={`#section-${i}`}
              className="text-sm text-nexus-navy/70 hover:text-nexus-cyan transition"
            >
              {translateHeadings ? <TranslatedText>{heading}</TranslatedText> : heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
