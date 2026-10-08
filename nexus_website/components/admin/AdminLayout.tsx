"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission, type AdminRole } from "@/lib/permissions";
import { LayoutDashboard, GraduationCap, BookOpen, Users, UserCircle, PenLine, FileText, Map, BookOpen as OpportunitiesIcon, Brain, MessageSquare, Building2, Package, Settings, ScrollText, ClipboardList, Play, LogOut, Menu, X, ChevronDown, Handshake, Sparkles, DollarSign, UserPlus, LineChart, Mail, BriefcaseBusiness, Inbox, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ChildItem = { href: string; label: string; icon: LucideIcon };
type NavItem = { href: string; label: string; icon: LucideIcon; children?: ChildItem[] };

const NAV_PERMISSION_BY_HREF: Record<string, string> = {
  "/admin/content/blog": "content:blog:*",
  "/admin/content/faq": "content:faq:*",
  "/admin/content/journey": "content:journey:*",
  "/admin/content/opportunities": "opportunities:write",
  "/admin/content/social": "content:social-media:*",
  "/admin/ai/knowledge": "content:ai-knowledge:*",
  "/admin/ai/videos": "content:ai-videos:*",
  "/admin/ai-chat": "ai-chat:*",
  "/admin/ai/escalations": "ai-escalations:*",
  "/admin/ai/live-support": "ai-live-support:*",
  "/admin/academy": "academy:programs:*",
  "/admin/academy/programs": "academy:programs:*",
  "/admin/academy/cohorts": "academy:cohorts:*",
  "/admin/academy/students": "academy:students:*",
  "/admin/academy/registrations": "academy:registrations:*",
  "/admin/academy/payments": "academy:payments:verify",
  "/admin/academy/private-requests": "academy:registrations:*",
  "/admin/contact-inquiries": "contact:inquiries:read",
  "/admin/joiners": "joiners:pathways:read",
  "/admin/opportunity-applications": "joiners:applications:read",
  "/admin/mentorship-inquiries": "mentorship:inquiries:read",
  "/admin/mentorship-applications": "mentorship:inquiries:read",
  "/admin/partnerships": "partnerships:inquiries:read",
  "/admin/service-inquiries": "services:inquiries:read",
  "/admin/live-chat": "livechat:*",
  "/admin/messages": "inbox:messages",
  "/admin/newsletter": "newsletter:read",
  "/admin/staff": "staff:*",
  "/admin/tech-hub": "techhub:*",
  "/admin/tech-hub/messaging": "techhub:*",
  "/admin/tech-hub/contracts": "techhub:*",
  "/admin/tech-hub/orders": "techhub:*",
  "/admin/tech-hub/services": "techhub:*",
  "/admin/tech-hub/featured-work": "techhub:*",
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/academy",
    label: "Academy",
    icon: GraduationCap,
    children: [
      { href: "/admin/academy", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/academy/cohorts", label: "Cohorts", icon: Users },
      { href: "/admin/academy/payments", label: "Payments", icon: DollarSign },
      { href: "/admin/academy/private-requests", label: "Private Requests", icon: Mail },
      { href: "/admin/academy/programs", label: "Programs", icon: BookOpen },
      { href: "/admin/academy/registrations", label: "Registrations", icon: UserPlus },
      { href: "/admin/academy/students", label: "Students", icon: Users },
    ],
  },
  {
    href: "/admin/ai",
    label: "AI Management",
    icon: Brain,
    children: [
      { href: "/admin/ai", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/ai-chat", label: "AI Chat Logs", icon: Sparkles },
      { href: "/admin/ai/escalations", label: "AI Escalations", icon: Inbox },
      { href: "/admin/ai/live-support", label: "Live Support", icon: MessageSquare },
      { href: "/admin/ai/knowledge", label: "Knowledge Base", icon: BookOpen },
      { href: "/admin/ai/videos", label: "AI Videos", icon: Play },
    ],
  },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/admin/logs", label: "Audit Logs", icon: ScrollText },
  {
    href: "/admin/content",
    label: "Content",
    icon: PenLine,
    children: [
      { href: "/admin/content", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/content/blog", label: "Blog", icon: FileText },
      { href: "/admin/content/faq", label: "FAQ", icon: MessageSquare },
      { href: "/admin/content/journey", label: "Journey", icon: Map },
      { href: "/admin/content/opportunities", label: "Opportunities", icon: OpportunitiesIcon },
      { href: "/admin/content/social", label: "Social post review", icon: Share2 },
    ],
  },
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/my-profile", label: "My Profile", icon: UserCircle },
  {
    href: "/admin/requests",
    label: "Requests",
    icon: Inbox,
    children: [
      { href: "/admin/requests", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/contact-inquiries", label: "Contact Inbox", icon: Mail },
      { href: "/admin/joiners", label: "Join Us Requests", icon: Users },
      { href: "/admin/opportunity-applications", label: "Opportunity Applications", icon: ClipboardList },
      { href: "/admin/mentorship-applications", label: "Mentee Applications", icon: GraduationCap },
      { href: "/admin/mentorship-inquiries", label: "Mentor / Volunteer Applications", icon: Users },
      { href: "/admin/partnerships", label: "Partnerships", icon: Handshake },
      { href: "/admin/service-inquiries", label: "Tech Hub Service Requests", icon: Building2 },
    ],
  },
  { href: "/admin/messages", label: "Staff Messages", icon: MessageSquare },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/staff", label: "Staff", icon: Users },
  {
    href: "/admin/tech-hub",
    label: "Tech Hub",
    icon: Building2,
    children: [
      { href: "/admin/tech-hub", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/tech-hub/messaging", label: "Client Chat", icon: MessageSquare },
      { href: "/admin/tech-hub/contracts", label: "Contracts", icon: FileText },
      { href: "/admin/tech-hub/featured-work", label: "Featured Work", icon: BriefcaseBusiness },
      { href: "/admin/tech-hub/orders", label: "Services Ordered", icon: ClipboardList },
      { href: "/admin/tech-hub/services", label: "What We Build", icon: Package },
    ],
  },
];

function getActiveParentHref(pathname: string): string | null {
  const parent = NAV_ITEMS.find(
    (item) =>
      item.children &&
      item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"))
  );
  return parent?.href ?? null;
}

function canOpenOverview(role: AdminRole, href: string): boolean {
  const permissionsByOverview: Record<string, string[]> = {
    "/admin/ai": ["ai-chat:*", "ai-escalations:*", "ai-live-support:*", "content:ai-knowledge:*", "content:ai-videos:*"],
    "/admin/content": ["content:blog:*", "content:faq:*", "content:journey:*", "opportunities:write", "content:social-media:*"],
    "/admin/requests": ["contact:inquiries:read", "joiners:pathways:read", "joiners:applications:read", "mentorship:inquiries:read", "partnerships:inquiries:read", "services:inquiries:read"],
  };
  const required = permissionsByOverview[href];
  return !required || required.some((permission) => hasPermission(role, permission));
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<{ email: string; name: string; role: AdminRole } | null>(null);
  const [sessionCheckError, setSessionCheckError] = useState(false);
  const [sessionCheckAttempt, setSessionCheckAttempt] = useState(0);
  const [menuOverride, setMenuOverride] = useState<{ pathname: string; href: string | null } | null>(null);
  const activeParentHref = getActiveParentHref(pathname);
  const openMenuHref = menuOverride?.pathname === pathname ? menuOverride.href : activeParentHref;

  useEffect(() => {
    if (pathname === "/admin/login") return;

    let cancelled = false;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Session check failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setSessionCheckError(false);
          setSession(data.user);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Session check error:", err);
        setSessionCheckError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [router, pathname, sessionCheckAttempt]);

  useEffect(() => {
    const isPaymentPage = pathname === "/admin/academy/payments" || pathname.startsWith("/admin/academy/payments/");
    if (session?.role && isPaymentPage && !hasPermission(session.role, "academy:payments:verify")) {
      router.replace("/admin/academy");
    }
  }, [pathname, router, session]);

  const toggleMenu = (href: string) => {
    setMenuOverride({ pathname, href: openMenuHref === href ? null : href });
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.children) {
      return item.children.some(
        (c) => pathname === c.href || pathname.startsWith(c.href + "/")
      );
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const renderNavItem = (item: NavItem) => {
    const itemPermission = NAV_PERMISSION_BY_HREF[item.href];
    if (!item.children && itemPermission && (!session?.role || !hasPermission(session.role, itemPermission))) {
      return null;
    }
    const visibleChildren = item.children?.filter((child) => {
      if (child.href === "/admin/ai" || child.href === "/admin/content" || child.href === "/admin/requests") {
        return session?.role ? canOpenOverview(session.role, child.href) : false;
      }
      const permission = NAV_PERMISSION_BY_HREF[child.href];
      return !permission || (session?.role ? hasPermission(session.role, permission) : false);
    });
    if (item.children && visibleChildren?.length === 0) return null;
    const active = isItemActive(item);
    const hasChildren = !!visibleChildren?.length;
    const isOpen = openMenuHref === item.href;

    if (hasChildren && visibleChildren) {
      return (
        <div key={item.href}>
          <button
            type="button"
            onClick={() => toggleMenu(item.href)}
            aria-expanded={isOpen}
            className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-nexus-navy/50 text-nexus-cyan-bright"
                : "text-nexus-gray/80 hover:bg-nexus-navy hover:text-nexus-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-nexus-cyan/10 pl-3">
              {visibleChildren.map((child) => {
                const childActive =
                  pathname === child.href || pathname.startsWith(child.href + "/");
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                      childActive
                        ? "bg-nexus-navy/50 text-nexus-cyan-bright"
                        : "text-nexus-gray/70 hover:bg-nexus-navy hover:text-nexus-white"
                    }`}
                  >
                    <child.icon className="h-3.5 w-3.5" />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition ${
          active
            ? "bg-nexus-navy/50 text-nexus-cyan-bright"
            : "text-nexus-gray/80 hover:bg-nexus-navy hover:text-nexus-white"
        }`}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-nexus-gray/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-nexus-dark/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-nexus-dark transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-nexus-cyan/10 p-4">
            <Link
              href="/admin/dashboard"
              className="text-lg font-bold tracking-widest text-nexus-white"
            >
              NEXUS Admin
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1.5 text-nexus-gray/70 hover:bg-nexus-navy lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {NAV_ITEMS.map((item) => renderNavItem(item))}
          </nav>

          <div className="border-t border-nexus-cyan/10 p-4">
            {session && (
              <p className="mb-2 truncate text-xs text-nexus-gray/60">
                {session.name} ({session.email})
              </p>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-nexus-navy"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-nexus-cyan/10 bg-nexus-white px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-nexus-navy hover:bg-nexus-gray lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/" className="text-sm text-nexus-navy/70 hover:text-nexus-navy">
              View Site →
            </Link>
          </div>
        </header>

        <main className="flex-1">
          {sessionCheckError && (
            <div role="alert" className="m-4 flex items-center justify-between gap-4 rounded-md border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span>Could not verify your admin session. Check your connection and try again.</span>
              <button
                type="button"
                onClick={() => setSessionCheckAttempt((attempt) => attempt + 1)}
                className="shrink-0 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}
          {pathname === "/admin/academy/payments" || pathname.startsWith("/admin/academy/payments/") ? (
            session?.role && hasPermission(session.role, "academy:payments:verify") ? children : (
              <div className="m-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Checking access to Academy payments…
              </div>
            )
          ) : children}
        </main>
      </div>
    </div>
  );
}
