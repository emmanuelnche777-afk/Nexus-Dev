import { NextResponse } from "next/server";
import { DEFAULT_PUBLIC_SITE_SETTINGS } from "@/lib/public-settings";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function GET() {
  try {
    const settings = await getPublicSiteSettings();

    return NextResponse.json(
      { settings },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { settings: DEFAULT_PUBLIC_SITE_SETTINGS },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  }
}
