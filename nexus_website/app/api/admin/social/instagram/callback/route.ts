import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/permissions";
import { getAdminUrl } from "@/lib/urls";
import { exchangeInstagramCode, instagramStateCookieName, saveInstagramConnection, verifyInstagramOAuthState } from "@/lib/instagram-login";

function redirectToQueue(result: "connected" | "error", message?: string) {
  const url = new URL("/admin/content/social", getAdminUrl());
  url.searchParams.set("instagram", result);
  if (message) url.searchParams.set("message", message.slice(0, 240));
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const code = query.get("code");
  const state = query.get("state");
  const providerError = query.get("error_description") || query.get("error_message") || query.get("error");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(instagramStateCookieName())?.value || "";
  const response = async (result: "connected" | "error", message?: string) => {
    const res = redirectToQueue(result, message);
    res.cookies.set(instagramStateCookieName(), "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/api/admin/social/instagram/callback",
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  };

  if (providerError) return response("error", "Instagram authorization was cancelled or denied.");
  const statePayload = verifyInstagramOAuthState(savedState, state || "");
  if (!statePayload || !code) return response("error", "Instagram authorization expired. Please try connecting again.");

  const session = await getSession();
  if (!session || session.id !== statePayload.adminId || !hasPermission(session.role, "content:social-media:*")) {
    return response("error", "Your admin access changed. Sign in with a permitted account and connect Instagram again.");
  }

  try {
    const connection = await exchangeInstagramCode(code);
    await saveInstagramConnection(connection);
    return response("connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Instagram could not be connected.";
    console.error("Instagram OAuth callback failed:", message);
    return response("error", message);
  }
}
