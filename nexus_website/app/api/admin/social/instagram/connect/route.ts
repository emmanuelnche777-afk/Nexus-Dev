import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { buildInstagramAuthorizationUrl, createInstagramOAuthState, instagramStateCookieName } from "@/lib/instagram-login";
import { getAdminUrl } from "@/lib/urls";

export async function GET() {
  const { user, authorized } = await requirePermission("content:social-media:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const state = createInstagramOAuthState(user.id);
    const response = NextResponse.redirect(buildInstagramAuthorizationUrl(state));
    response.cookies.set(instagramStateCookieName(), state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/api/admin/social/instagram/callback",
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start Instagram authorization.";
    const url = new URL("/admin/content/social", getAdminUrl());
    url.searchParams.set("instagram", "error");
    url.searchParams.set("message", message);
    return NextResponse.redirect(url);
  }
}
