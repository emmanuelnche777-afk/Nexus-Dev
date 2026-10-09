import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkOrigin } from "@/lib/csrf";
import { getPublicSiteSettings } from "@/lib/site-settings";
import type { PublicSiteSettings } from "@/lib/public-settings";

const AUTH_PAGES = [
  "/admin/login",
  "/admin/setup",
  "/admin/2fa",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/accept-invite",
];

const ADMIN_API_EXCEPTIONS = new Set([
  "/api/programs",
]);

function hostnameFromUrl(value: string | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/")
  );
}

function notFoundResponse(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404 | Page not found</title><style>html,body{min-height:100%;margin:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}body{display:grid;place-items:center}.error{text-align:center;padding:2rem}.error h1{margin:0 0 .75rem;font-size:3rem;font-weight:600}.error p{margin:0;color:#555;font-size:1rem}</style></head><body><main class="error"><h1>404</h1><p>Page not found</p></main></body></html>`,
    {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

function applyDomainBoundary(request: NextRequest): NextResponse | null {
  const publicHost = hostnameFromUrl(process.env.NEXUS_PUBLIC_URL);
  const adminHost = hostnameFromUrl(process.env.NEXUS_ADMIN_URL);
  const hostname = request.headers.get("host")?.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // Preview deployments may serve the public site for review, but never expose
  // staff pages or APIs. Staff should use the production deployment.
  if (process.env.VERCEL_ENV === "preview") {
    if (isAdminPath(pathname)) return notFoundResponse(request);
    return null;
  }

  // Keep local development convenient. Production deployments must declare at
  // least the public host so an unset or invalid configuration fails closed.
  if (!publicHost) {
    if (process.env.NODE_ENV === "production") return notFoundResponse(request);
    return null;
  }

  if (!hostname) return notFoundResponse(request);

  // Single-host mode is used with Vercel's assigned production domain. The
  // normal session/permission checks below still protect /admin and /api/admin.
  // It also supports the future case where both configured hosts are identical.
  if (!adminHost || adminHost === publicHost) {
    return hostname === publicHost ? null : notFoundResponse(request);
  }

  if (hostname === publicHost) {
    return isAdminPath(pathname) ? notFoundResponse(request) : null;
  }

  if (hostname === adminHost) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (isAdminPath(pathname) || ADMIN_API_EXCEPTIONS.has(pathname)) {
      return null;
    }

    return notFoundResponse(request);
  }

  return notFoundResponse(request);
}

function isPublicPage(pathname: string): boolean {
  return AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isPublicApi(pathname: string): boolean {
  if (pathname === "/api/admin/setup") return true;
  return (
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/logout") ||
    pathname.startsWith("/api/admin/session") ||
    pathname.startsWith("/api/admin/2fa/verify-login") ||
    pathname.startsWith("/api/admin/accept-invite") ||
    pathname.startsWith("/api/admin/forgot-password") ||
    pathname.startsWith("/api/admin/reset-password")
  );
}

function isWriteMethod(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
}

function featureForPath(pathname: string): "blog" | "certificateVerification" | "aiAssistant" | null {
  if (pathname === "/blog" || pathname.startsWith("/blog/") || pathname === "/api/blog" || pathname.startsWith("/api/blog/")) {
    return "blog";
  }
  if (pathname === "/academy/verify" || pathname.startsWith("/academy/verify/") || pathname === "/api/academy/verify") {
    return "certificateVerification";
  }
  if (pathname === "/academy/ask-question" || pathname.startsWith("/academy/ask-question/") || pathname === "/api/chat") {
    return "aiAssistant";
  }
  return null;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const domainBoundary = applyDomainBoundary(req);
  if (domainBoundary) return domainBoundary;

  const maintenanceExempt =
    isAdminPath(pathname) ||
    isPublicPage(pathname) ||
    pathname === "/maintenance" ||
    pathname.startsWith("/maintenance/");

  const feature = featureForPath(pathname);
  const newsletterEndpoint = pathname === "/api/newsletter";
  let siteSettings: PublicSiteSettings | null = null;
  if (!maintenanceExempt || feature || newsletterEndpoint) {
    try {
      siteSettings = await getPublicSiteSettings();
    } catch (error) {
      console.error("[proxy] Could not load public settings:", error);
    }
  }

  const maintenanceEnabled =
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" ||
    siteSettings?.maintenanceMode === true;

  if (!maintenanceExempt && maintenanceEnabled) {
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
    return NextResponse.json({ error: "Site is under maintenance" }, { status: 503 });
  }

  if (feature && siteSettings?.[feature] === false) {
    return notFoundResponse(req);
  }

  if (newsletterEndpoint && siteSettings?.newsletter === false) {
    return NextResponse.json({ error: "Newsletter subscriptions are currently disabled." }, { status: 404 });
  }

  if (isPublicPage(pathname) || isPublicApi(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return validateSession(req);
  }

  if (pathname.startsWith("/api/admin")) {
    if (isWriteMethod(req.method)) {
      const origin = req.headers.get("origin");
      if (!checkOrigin(origin)) {
        return NextResponse.json({ error: "CSRF check failed" }, { status: 403 });
      }
    }
    return validateSession(req);
  }

  if (pathname.startsWith("/api/settings") || pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

async function validateSession(req: NextRequest): Promise<NextResponse> {
  try {
    const sessionRes = await fetch(new URL("/api/admin/session", req.url), {
      headers: { cookie: req.headers.get("cookie") || "" },
      cache: "no-store",
    });

    if (!sessionRes.ok) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const data = await sessionRes.json();
    if (!data.authenticated) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|_next/data|public/|images/|uploads/|videos/|logo/|api/).*)",
    "/api/:path*",
  ],
};
