import { NextRequest, NextResponse } from "next/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://polezno.irkutsk.ru";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const targetUrl = `${SITE_URL}/map#${encodeURIComponent(slug)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&format=png&data=${encodeURIComponent(targetUrl)}`;

  return NextResponse.redirect(qrApiUrl);
}
