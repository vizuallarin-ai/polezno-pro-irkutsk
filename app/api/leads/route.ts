import { NextRequest, NextResponse } from "next/server";
import { sendLeadNotification } from "@/lib/email";

const SOURCE_VALUES = new Set([
  "program_form",
  "contacts",
  "event",
  "shop",
  "map",
  "excursions",
  "direct",
  "other",
]);

function normalizeSource(referer: string | null, bodySource?: unknown): string {
  if (typeof bodySource === "string" && SOURCE_VALUES.has(bodySource)) {
    return bodySource;
  }
  if (!referer) return "direct";
  if (referer.includes("/program")) return "program_form";
  if (referer.includes("/contact")) return "contacts";
  if (referer.includes("/events")) return "event";
  if (referer.includes("/shop")) return "shop";
  if (referer.includes("/excursions")) return "excursions";
  if (referer.includes("/map")) return "map";
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
      },
    });

    // Notify admin about new lead (non-blocking)
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
