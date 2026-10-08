"use client";

import type { ElementType, ReactNode } from "react";

export default function TranslatedText({
  children,
  as: Tag = "span",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return <Tag data-browser-translate="true" className={className}>{children}</Tag>;
}
