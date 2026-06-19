import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const type = request.nextUrl.searchParams.get("type");

  if (type === "ar-postcard") {
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }
    const targetUrl = `${SITE_URL}/ar-postcards/${encodeURIComponent(slug)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&format=png&data=${encodeURIComponent(targetUrl)}`;
    return NextResponse.redirect(qrApiUrl);
  }

  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const targetUrl = `${SITE_URL}/map#${encodeURIComponent(slug)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&format=png&data=${encodeURIComponent(targetUrl)}`;

  return NextResponse.redirect(qrApiUrl);
}
