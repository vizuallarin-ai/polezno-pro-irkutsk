import { NextRequest, NextResponse } from "next/server";
import { sendLeadNotification } from "@/lib/email";
import { LEAD_SOURCE_OPTIONS } from "@/payload/constants";

const SOURCE_VALUES = new Set(LEAD_SOURCE_OPTIONS.map((o) => o.value));

function normalizeSource(referer: string | null, bodySource?: unknown): string {
  if (typeof bodySource === "string" && SOURCE_VALUES.has(bodySource as never)) {
    return bodySource;
  }
  if (!referer) return "direct";
  if (referer.includes("/program")) return "program";
  if (referer.includes("/contact")) return "contacts";
  if (referer.match(/\/explore\/[^/]+/)) return "article";
  if (referer.includes("/explore")) return "article";
  if (referer.match(/\/events\/[^/]+/)) return "event";
  if (referer.includes("/events")) return "event";
  if (referer.match(/\/shop\/[^/]+/)) return "product";
  if (referer.includes("/shop")) return "shop";
  if (referer.match(/\/excursions\/[^/]+/)) return "excursion";
  if (referer.includes("/excursions")) return "excursions";
  if (referer.match(/\/map\/[^/]+/)) return "route";
  if (referer.includes("/map")) return "route";
  if (referer.endsWith("/") || referer.match(/\/$/)) return "home";
  return "other";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "CMS unavailable" },
        { status: 503 }
      );
    }

    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const referer = request.headers.get("referer");
    const source = normalizeSource(referer, body.source);

    const lead = await payload.create({
      collection: "leads",
      data: {
        name: String(body.name || ""),
        email: String(body.email || ""),
        phone: body.phone ? String(body.phone) : undefined,
        serviceType: body.serviceType ? String(body.serviceType) : "general",
        dates: body.dates ? String(body.dates) : undefined,
        groupSize: body.groupSize ? Number(body.groupSize) : undefined,
        interests: Array.isArray(body.interests)
          ? body.interests.map((i: unknown) => ({ interest: String(i) }))
          : [],
        budget: body.budget ? String(body.budget) : undefined,
        message: body.message ? String(body.message) : undefined,
        status: "new",
        source,
        routeSlug: body.routeSlug ? String(body.routeSlug) : undefined,
        articleSlug: body.articleSlug ? String(body.articleSlug) : undefined,
        eventSlug: body.eventSlug ? String(body.eventSlug) : undefined,
        excursionSlug: body.excursionSlug ? String(body.excursionSlug) : undefined,
        productSlug: body.productSlug ? String(body.productSlug) : undefined,
        selectedFormat: body.selectedFormat
          ? String(body.selectedFormat)
          : undefined,
        sourceTitle: body.sourceTitle ? String(body.sourceTitle) : undefined,
      },
    });

    sendLeadNotification({
      name: String(body.name || ""),
      email: String(body.email || ""),
      serviceType: body.serviceType ? String(body.serviceType) : undefined,
      message: body.message ? String(body.message) : undefined,
    }).catch((err) => console.error("Lead notification error:", err));

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    );
  }
}
