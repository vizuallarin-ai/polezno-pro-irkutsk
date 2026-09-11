import type { CompactLeadInput } from "@/lib/leads-schema";
import { sanitizeLeadText } from "@/lib/lead-spam";
import {
  requestTypeFromLegacy,
  resolveLeadPriority,
  type RequestType,
} from "@/lib/leads-constants";
import { omitCrmInternalFields } from "@/lib/leads/crm";

export function buildTrackingFields(
  body: Record<string, unknown>,
  referer: string | null
): Partial<CompactLeadInput> {
  return {
    sourceUrl: sanitizeLeadText(body.sourceUrl),
    pageUrl: sanitizeLeadText(body.pageUrl) || referer || undefined,
    referrer: sanitizeLeadText(body.referrer) || referer || undefined,
    utmSource: sanitizeLeadText(body.utmSource),
    utmMedium: sanitizeLeadText(body.utmMedium),
    utmCampaign: sanitizeLeadText(body.utmCampaign),
    utmContent: sanitizeLeadText(body.utmContent),
    utmTerm: sanitizeLeadText(body.utmTerm),
    sourceType: sanitizeLeadText(body.sourceType),
    sourceSlug: sanitizeLeadText(body.sourceSlug),
    sourceTitle: sanitizeLeadText(body.sourceTitle),
    sourceId: sanitizeLeadText(body.sourceId),
    sourceBlock: sanitizeLeadText(body.sourceBlock),
    interestType: sanitizeLeadText(body.interestType),
    routeId: sanitizeLeadText(body.routeId),
    routeSlug: sanitizeLeadText(body.routeSlug),
    routeTitle: sanitizeLeadText(body.routeTitle),
    materialId: sanitizeLeadText(body.materialId),
    materialSlug:
      sanitizeLeadText(body.materialSlug) ||
      sanitizeLeadText(body.articleSlug),
    photoId: sanitizeLeadText(body.photoId),
    arPostcardId: sanitizeLeadText(body.arPostcardId),
    arPostcardSlug: sanitizeLeadText(body.arPostcardSlug),
    productId: sanitizeLeadText(body.productId),
    productSlug: sanitizeLeadText(body.productSlug),
    productTitle: sanitizeLeadText(body.productTitle),
    makerId: sanitizeLeadText(body.makerId),
    eventSlug: sanitizeLeadText(body.eventSlug),
    excursionSlug: sanitizeLeadText(body.excursionSlug),
    selectedFormat: sanitizeLeadText(body.selectedFormat),
  };
}

export function buildConsentFields(body: Record<string, unknown>) {
  const accepted = body.consentAccepted === true;
  return {
    consentAccepted: accepted,
    consentText: sanitizeLeadText(body.consentText),
    consentVersion: sanitizeLeadText(body.consentVersion),
    consentAcceptedAt: accepted ? new Date().toISOString() : undefined,
  };
}

export function resolveRequestType(body: Record<string, unknown>): RequestType {
  if (typeof body.requestType === "string") {
    return body.requestType as RequestType;
  }
  return requestTypeFromLegacy({
    sourceType: String(body.sourceType || ""),
    serviceType: String(body.serviceType || ""),
    taskType: String(body.taskType || ""),
    source: String(body.source || ""),
  });
}

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function looksLikeTelegramHandle(value: string): boolean {
  return value.startsWith("@") || /^t\.me\//i.test(value);
}

export function deriveEmailFromContact(
  contact: string,
  email?: string | null
): string | undefined {
  const explicit = sanitizeLeadText(email ?? undefined);
  if (explicit) return explicit;
  const c = sanitizeLeadText(contact) || "";
  return looksLikeEmail(c) ? c : undefined;
}

export function deriveTelegramFromContact(
  contact: string,
  telegram?: string | null
): string | undefined {
  const explicit = sanitizeLeadText(telegram ?? undefined);
  if (explicit) return explicit;
  const c = sanitizeLeadText(contact) || "";
  return looksLikeTelegramHandle(c) ? c : undefined;
}

export function buildUnifiedLeadData(
  data: CompactLeadInput & { consentAccepted?: boolean },
  source: string,
  referer: string | null
) {
  // Defence in depth: ignore any CRM-only keys if a client smuggles them in.
  const safe = omitCrmInternalFields(data as Record<string, unknown>);
  const requestType = resolveRequestType(safe);
  const tracking = buildTrackingFields(safe, referer);
  const consent = buildConsentFields(safe);
  const message = sanitizeLeadText(
    typeof safe.message === "string" ? safe.message : undefined,
    5000
  );
  const contact =
    sanitizeLeadText(typeof safe.contact === "string" ? safe.contact : "") ||
    "";
  const email = deriveEmailFromContact(
    contact,
    typeof safe.email === "string" ? safe.email : undefined
  );
  const phone = sanitizeLeadText(
    typeof safe.phone === "string" ? safe.phone : undefined
  );
  const telegram = deriveTelegramFromContact(
    contact,
    typeof safe.telegram === "string" ? safe.telegram : undefined
  );

  const priority = resolveLeadPriority({
    requestType,
    company: sanitizeLeadText(
      typeof safe.company === "string" ? safe.company : undefined
    ),
    quantity:
      typeof safe.quantity === "number" ? safe.quantity : undefined,
    message,
  });

  return {
    name:
      sanitizeLeadText(typeof safe.name === "string" ? safe.name : undefined) ||
      "Без имени",
    contact,
    email,
    phone,
    telegram,
    preferredContactMethod:
      typeof safe.preferredContactMethod === "string"
        ? safe.preferredContactMethod
        : undefined,
    message,
    serviceType:
      typeof safe.serviceType === "string" ? safe.serviceType : "general",
    dates: sanitizeLeadText(
      typeof safe.dates === "string" ? safe.dates : undefined
    ),
    groupSize:
      typeof safe.groupSize === "number" ? safe.groupSize : undefined,
    budget: sanitizeLeadText(
      typeof safe.budget === "string" ? safe.budget : undefined
    ),
    // Always force intake status — never from client body.
    status: "new" as const,
    source,
    sourceType: tracking.sourceType || undefined,
    sourceSlug: tracking.sourceSlug,
    sourceTitle: tracking.sourceTitle,
    sourceId: tracking.sourceId,
    sourceBlock: tracking.sourceBlock,
    sourceUrl: tracking.sourceUrl,
    pageUrl: tracking.pageUrl,
    referrer: tracking.referrer,
    utmSource: tracking.utmSource,
    utmMedium: tracking.utmMedium,
    utmCampaign: tracking.utmCampaign,
    utmContent: tracking.utmContent,
    utmTerm: tracking.utmTerm,
    requestType,
    interestType: tracking.interestType,
    routeId: tracking.routeId,
    routeSlug: tracking.routeSlug,
    routeTitle: tracking.routeTitle,
    materialId: tracking.materialId,
    materialSlug: tracking.materialSlug,
    articleSlug: tracking.materialSlug,
    photoId: tracking.photoId,
    arPostcardId: tracking.arPostcardId,
    arPostcardSlug: tracking.arPostcardSlug,
    productId: tracking.productId,
    productSlug: tracking.productSlug,
    productTitle: tracking.productTitle,
    makerId: tracking.makerId,
    eventSlug: tracking.eventSlug,
    excursionSlug: tracking.excursionSlug,
    selectedFormat: tracking.selectedFormat,
    priority,
    ...consent,
  };
}
