import { NextResponse } from "next/server";

function legacyResponse() {
  return NextResponse.json(
    {
      error: "Partnership inquiries are managed through the Partnerships inbox.",
      inbox: "/admin/partnerships",
    },
    { status: 410 }
  );
}

export const GET = legacyResponse;
export const PUT = legacyResponse;
export const DELETE = legacyResponse;
