import type { CompactLeadInput } from "@/lib/leads-schema";
import { sanitizeLeadText } from "@/lib/lead-spam";
import {
  requestTypeFromLegacy,
  resolveLeadPriority,
  type RequestType,
} from "@/lib/leads-constants";

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

export function buildUnifiedLeadData(
  data: CompactLeadInput & { consentAccepted?: boolean },
  source: string,
  referer: string | null
) {
  const requestType = resolveRequestType(data as Record<string, unknown>);
  const tracking = buildTrackingFields(data as Record<string, unknown>, referer);
  const consent = buildConsentFields(data as Record<string, unknown>);
  const message = sanitizeLeadText(data.message, 5000);
  const contact = sanitizeLeadText(data.contact) || "";
  const email =
    sanitizeLeadText(data.email) ||
    (contact.includes("@") ? contact : undefined);
  const phone = sanitizeLeadText(data.phone);
  const telegram = sanitizeLeadText(data.telegram);

  const priority = resolveLeadPriority({
    requestType,
    company: sanitizeLeadText((data as Record<string, unknown>).company),
    quantity: (data as Record<string, unknown>).quantity as number | undefined,
    message,
  });

  return {
    name: sanitizeLeadText(data.name) || "Без имени",
    contact,
    email,
    phone,
    telegram,
    preferredContactMethod: data.preferredContactMethod || undefined,
    message,
    serviceType: data.serviceType || "general",
    dates: sanitizeLeadText(data.dates),
    groupSize: data.groupSize,
    budget: sanitizeLeadText(data.budget),
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
