"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function PublicFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname === "/maintenance") return null;
  return <Footer />;
}
