import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendLeadNotification } from "@/lib/email";
import { businessLeadSchema } from "@/lib/leads-business";
import { LEAD_SOURCE_OPTIONS } from "@/payload/constants";

const SOURCE_VALUES = new Set(LEAD_SOURCE_OPTIONS.map((o) => o.value));

const generalLeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  serviceType: z.string().optional(),
  dates: z.string().optional(),
  groupSize: z.coerce.number().optional(),
  interests: z.array(z.string()).optional(),
  budget: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  routeSlug: z.string().optional(),
  articleSlug: z.string().optional(),
  eventSlug: z.string().optional(),
  excursionSlug: z.string().optional(),
  productSlug: z.string().optional(),
  selectedFormat: z.string().optional(),
  sourceTitle: z.string().optional(),
});

function normalizeSource(referer: string | null, bodySource?: unknown): string {
  if (typeof bodySource === "string" && SOURCE_VALUES.has(bodySource as never)) {
    return bodySource;
  }
  if (!referer) return "direct";
  if (referer.includes("/business")) return "business";
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

function isBusinessLead(body: Record<string, unknown>): boolean {
  return (
    body.source === "business" ||
    body.sourceType === "business" ||
    Boolean(body.company && body.taskType)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "CMS unavailable" }, { status: 503 });
    }

    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const referer = request.headers.get("referer");
    const source = normalizeSource(referer, body.source);

    if (isBusinessLead(body)) {
      const parsed = businessLeadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const data = parsed.data;
      const lead = await payload.create({
        collection: "leads",
        data: {
          name: data.name,
          company: data.company,
          contact: data.contact,
          email: data.email || undefined,
          phone: data.phone || undefined,
          telegram: data.telegram || undefined,
          max: data.max || undefined,
          websiteUrl: data.websiteUrl || undefined,
          taskType: data.taskType,
          businessFormat: data.businessFormat || undefined,
          serviceType: "corporate",
          dates: data.dates || undefined,
          groupSize: data.peopleCount || undefined,
          budget: data.budgetRange || undefined,
          message: data.message,
          status: "new",
          source: source === "business" ? "business" : source,
          sourceType: "business",
          sourceTitle: data.sourceTitle || "Для бизнеса",
          sourceBlock: data.sourceBlock || body.sourceBlock
            ? String(body.sourceBlock)
            : undefined,
          routeSlug: data.routeSlug || body.routeSlug
            ? String(body.routeSlug)
            : undefined,
          excursionSlug: data.excursionSlug || body.excursionSlug
            ? String(body.excursionSlug)
            : undefined,
          selectedFormat: data.selectedFormat || body.selectedFormat
            ? String(body.selectedFormat)
            : undefined,
        },
      });

      sendLeadNotification({
        name: data.name,
        email: data.email || data.contact,
        serviceType: `B2B: ${data.taskType}`,
        message: `[${data.company}] ${data.message}`,
      }).catch((err) => console.error("Lead notification error:", err));

      return NextResponse.json({ ok: true, id: lead.id });
    }

    const parsed = generalLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const lead = await payload.create({
      collection: "leads",
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        serviceType: data.serviceType || "general",
        dates: data.dates || undefined,
        groupSize: data.groupSize || undefined,
        interests: Array.isArray(data.interests)
          ? data.interests.map((i) => ({ interest: String(i) }))
          : [],
        budget: data.budget || undefined,
        message: data.message || undefined,
        status: "new",
        source,
        routeSlug: data.routeSlug || undefined,
        articleSlug: data.articleSlug || undefined,
        eventSlug: data.eventSlug || undefined,
        excursionSlug: data.excursionSlug || undefined,
        productSlug: data.productSlug || undefined,
        selectedFormat: data.selectedFormat || undefined,
        sourceTitle: data.sourceTitle || undefined,
      },
    });

    sendLeadNotification({
      name: data.name,
      email: data.email,
      serviceType: data.serviceType,
      message: data.message,
    }).catch((err) => console.error("Lead notification error:", err));

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
