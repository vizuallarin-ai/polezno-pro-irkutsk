import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { notifySavedLead } from "@/lib/lead-notification";
import { businessLeadSchema } from "@/lib/leads-business";
import {
  makerPlacementLeadSchema,
  productOrderLeadSchema,
} from "@/lib/souvenir-constants";
import { arPostcardPreorderLeadSchema } from "@/lib/ar-postcard-constants";
import { LEAD_SOURCE_OPTIONS } from "@/payload/constants";
import { compactLeadSchema } from "@/lib/leads-schema";
import {
  buildConsentFields,
  buildTrackingFields,
  buildUnifiedLeadData,
  resolveRequestType,
} from "@/lib/leads-api-helpers";
import {
  checkHoneypot,
  checkMinFillTime,
  checkRateLimit,
  getClientIp,
  sanitizeLeadText,
} from "@/lib/lead-spam";
import { resolveLeadPriority } from "@/lib/leads-constants";
import { getSiteSettings } from "@/lib/site-settings";

const SOURCE_VALUES = new Set(LEAD_SOURCE_OPTIONS.map((o) => o.value));

const generalLeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  contact: z.string().optional(),
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
  requestType: z.string().optional(),
  consentAccepted: z.boolean().optional(),
  consentText: z.string().optional(),
  consentVersion: z.string().optional(),
});

function normalizeSource(referer: string | null, bodySource?: unknown): string {
  if (typeof bodySource === "string" && SOURCE_VALUES.has(bodySource as never)) {
    return bodySource;
  }
  if (!referer) return "direct";
  if (referer.includes("/business")) return "business";
  if (referer.includes("/program")) return "program";
  if (referer.includes("/contact")) return "contacts";
  if (referer.match(/\/explore\/photos/)) return "photos";
  if (referer.match(/\/explore\/[^/]+/)) return "article";
  if (referer.includes("/explore")) return "article";
  if (referer.match(/\/events\/[^/]+/)) return "event";
  if (referer.includes("/events")) return "event";
  if (referer.match(/\/ar-postcards\/[^/]+/)) return "ar_postcard_preorder";
  if (referer.includes("/ar-postcards")) return "ar_postcards";
  if (referer.match(/\/souvenirs\/[^/]+/)) return "product_order";
  if (referer.includes("/souvenirs")) return "souvenirs";
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

function isArPostcardLead(body: Record<string, unknown>): boolean {
  const st = body.sourceType;
  return st === "ar_postcard_preorder" || st === "ar_postcard_question";
}

function isSouvenirLead(body: Record<string, unknown>): boolean {
  const st = body.sourceType;
  return (
    st === "product_order" ||
    st === "product_question" ||
    st === "maker_placement" ||
    st === "souvenir_general"
  );
}

function isUnifiedLead(body: Record<string, unknown>): boolean {
  return typeof body.contact === "string" && body.contact.length > 0;
}

async function notifyLead(lead: { id: unknown; createdAt?: unknown }, sourceType?: string) {
  try {
    const settings = await getSiteSettings();
    if (!settings.leadSettings.leadNotificationEnabled) return;
    await notifySavedLead({
      leadId: String(lead.id),
      createdAt:
        typeof lead.createdAt === "string" || lead.createdAt instanceof Date
          ? lead.createdAt
          : new Date().toISOString(),
      sourceType,
      trustedRecipient: settings.leadSettings.leadNotificationEmail,
    });
  } catch {
    // Email must never fail the saved lead or return a false client error.
  }
}

function withTracking(
  data: Record<string, unknown>,
  body: Record<string, unknown>,
  referer: string | null
) {
  const tracking = buildTrackingFields(body, referer);
  const consent = buildConsentFields(body);
  const requestType = resolveRequestType(body);
  const priority = resolveLeadPriority({
    requestType,
    company: sanitizeLeadText(body.company),
    quantity: body.quantity as number | undefined,
    message: sanitizeLeadText(body.message, 5000),
  });
  return { ...data, ...tracking, ...consent, requestType, priority };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (checkHoneypot(body)) {
      return NextResponse.json({ ok: true, id: "ignored" });
    }
    if (!checkMinFillTime(body)) {
      return NextResponse.json({ error: "Слишком быстро" }, { status: 429 });
    }
    const ip = getClientIp(request.headers);
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
    }

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
        overrideAccess: true,
        data: withTracking(
          {
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
            message: sanitizeLeadText(data.message, 5000),
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
          body,
          referer
        ),
      });

      await notifyLead(lead, "business");

      return NextResponse.json({ ok: true, id: lead.id });
    }

    if (isArPostcardLead(body)) {
      const parsed = arPostcardPreorderLeadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const data = parsed.data;
      const leadSource =
        data.sourceType === "ar_postcard_question"
          ? "ar_postcard_question"
          : "ar_postcard_preorder";

      const lead = await payload.create({
        collection: "leads",
        overrideAccess: true,
        data: withTracking(
          {
            name: data.name,
            contact: data.contact,
            email:
              data.email ||
              (data.contact.includes("@") ? data.contact : undefined),
            phone: data.phone || undefined,
            telegram: data.telegram || undefined,
            message: sanitizeLeadText(data.message, 5000),
            quantity: data.quantity || undefined,
            status: "new",
            source: leadSource,
            sourceType: data.sourceType,
            sourceBlock: data.sourceBlock || undefined,
            arPostcardSlug: data.arPostcardSlug,
            arPostcardTitle: data.arPostcardTitle,
            arPostcardId: sanitizeLeadText(body.arPostcardId),
            productId: data.relatedProductId || undefined,
            productSlug: data.productSlug || undefined,
            productTitle: data.productTitle || undefined,
            serviceType: "general",
          },
          body,
          referer
        ),
      });

      await notifyLead(lead, leadSource);

      return NextResponse.json({ ok: true, id: lead.id });
    }

    if (isSouvenirLead(body)) {
      if (body.sourceType === "maker_placement") {
        const parsed = makerPlacementLeadSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
          );
        }
        const data = parsed.data;
        const lead = await payload.create({
          collection: "leads",
          overrideAccess: true,
          data: withTracking(
            {
              name: data.name,
              contact: data.contact,
              email: data.email || undefined,
              telegram: data.telegram || undefined,
              websiteUrl: data.websiteUrl || undefined,
              message: sanitizeLeadText(
                [data.shortDescription, data.message].filter(Boolean).join("\n\n"),
                5000
              ),
              status: "new",
              source: source === "maker_placement" ? "maker_placement" : source,
              sourceType: "maker_placement",
              sourceBlock: data.sourceBlock || "submit-maker",
              craftType: data.craftType,
              placementType: data.placementType || "catalog",
              serviceType: "general",
            },
            body,
            referer
          ),
        });

        await notifyLead(lead, "maker_placement");

        return NextResponse.json({ ok: true, id: lead.id });
      }

      const parsed = productOrderLeadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const data = parsed.data;
      const leadSource =
        data.sourceType === "product_question"
          ? "product_question"
          : data.sourceType === "souvenir_general"
            ? "souvenir_general"
            : "product_order";

      const lead = await payload.create({
        collection: "leads",
        overrideAccess: true,
        data: withTracking(
          {
            name: data.name,
            contact: data.contact,
            email:
              data.email ||
              (data.contact.includes("@") ? data.contact : undefined),
            phone: data.phone || undefined,
            telegram: data.telegram || undefined,
            message: sanitizeLeadText(data.message, 5000),
            quantity: data.quantity || undefined,
            status: "new",
            source: leadSource,
            sourceType: data.sourceType,
            sourceBlock: data.sourceBlock || undefined,
            productId: data.productId || undefined,
            productSlug: data.productSlug || undefined,
            productTitle: data.productTitle || undefined,
            productCategory: data.productCategory || undefined,
            makerId: data.makerId || undefined,
            makerSlug: data.makerSlug || undefined,
            makerTitle: data.makerTitle || undefined,
            serviceType: "general",
          },
          body,
          referer
        ),
      });

      await notifyLead(lead, leadSource);

      return NextResponse.json({ ok: true, id: lead.id });
    }

    if (isUnifiedLead(body)) {
      const parsed = compactLeadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const leadData = buildUnifiedLeadData(parsed.data, source, referer);
      const lead = await payload.create({
        collection: "leads",
        overrideAccess: true,
        data: leadData,
      });

      await notifyLead(lead, leadData.sourceType || leadData.requestType || source);

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
      overrideAccess: true,
      data: withTracking(
        {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          contact: data.contact || data.email,
          serviceType: data.serviceType || "general",
          dates: data.dates || undefined,
          groupSize: data.groupSize || undefined,
          interests: Array.isArray(data.interests)
            ? data.interests.map((i) => ({ interest: String(i) }))
            : [],
          budget: data.budget || undefined,
          message: sanitizeLeadText(data.message, 5000),
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
        body,
        referer
      ),
    });

    await notifyLead(lead, source);

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
