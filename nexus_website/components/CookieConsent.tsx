"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ConsentState = "idle" | "accepted" | "denied";

const COOKIE_NAME = "nexus_cookie_consent";
const COOKIE_DAYS = 365;

function setCookie(value: ConsentState) {
  const expires = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return match[2] as ConsentState;
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(() => getCookie() || "idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleAction = (value: ConsentState) => {
    setCookie(value);
    setConsent(value);
  };

  if (!mounted || consent !== "idle") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 rounded-lg border border-nexus-cyan/20 bg-nexus-dark p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-sm leading-relaxed text-nexus-gray/80">
            🍪 We use essential cookies to make this site work. We do not use tracking or advertising cookies.{" "}
            <Link href="/privacy-policy" className="font-medium text-nexus-cyan-bright transition hover:text-nexus-cyan">
              Privacy Policy
            </Link>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => handleAction("denied")}
              className="rounded-md border border-nexus-cyan/40 px-4 py-2 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
            >
              Deny
            </button>
            <button
              type="button"
              onClick={() => handleAction("accepted")}
              className="rounded-md bg-nexus-cyan px-4 py-2 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
