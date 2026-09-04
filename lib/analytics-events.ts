/**
 * Typed analytics helper — no PII (name, email, phone, telegram, comments).
 * CustomEvent + dataLayer; optional ym reachGoal when available.
 * Cabinet goals: see docs/metrika-goals.md (EXTERNAL VERIFICATION PENDING).
 */

export type AnalyticsEventName =
  | "hero_cta_click"
  | "excursion_view"
  | "route_view"
  | "map_interaction"
  | "explore_to_commercial_click"
  | "business_cta_click"
  | "lead_form_start"
  | "lead_form_submit"
  | "lead_form_success"
  | "lead_form_error"
  | "phone_click"
  | "messenger_click"
  | "contact_click"
  | "lead_form_open"
  | "email_click"
  | "cta_click";

/** Legacy lead-form event names — still supported. */
export type LeadAnalyticsEvent =
  | "contact_click"
  | "lead_form_open"
  | "lead_form_submit"
  | "lead_form_success"
  | "lead_form_error"
  | "messenger_click"
  | "email_click"
  | "cta_click";

const PII_KEYS = new Set([
  "name",
  "email",
  "phone",
  "telegram",
  "whatsapp",
  "max",
  "contact",
  "message",
  "comment",
  "comments",
  "fio",
  "company",
]);

export type AnalyticsParams = {
  sourceType?: string;
  sourceTitle?: string;
  sourceSlug?: string;
  sourceBlock?: string;
  requestType?: string;
  pageUrl?: string;
  cta?: string;
  productType?: string;
  intent?: string;
  filter?: string;
  path?: string;
};

export type LeadAnalyticsParams = AnalyticsParams;

/** Strip accidental PII keys from analytics payloads. */
export function sanitizeAnalyticsParams(
  params: Record<string, unknown>
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (PII_KEYS.has(key.toLowerCase())) continue;
    if (value == null) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      // Guard: values that look like emails/phones
      if (typeof value === "string") {
        if (/@/.test(value) || /^\+?\d[\d\s()-]{7,}$/.test(value.trim())) continue;
        out[key] = value.slice(0, 200);
      } else {
        out[key] = value;
      }
    }
  }
  return out;
}

function pushToDataLayer(
  eventName: string,
  params: Record<string, string | number | boolean>
): void {
  const w = window as Window & {
    dataLayer?: Record<string, unknown>[];
    ym?: (id: number, method: string, goal: string, params?: object) => void;
  };

  w.dataLayer?.push({ event: eventName, ...params });

  const metrikaId = Number(
    (process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ?? "109995467").replace(/\D/g, "")
  );
  if (typeof w.ym === "function" && metrikaId > 0) {
    try {
      w.ym(metrikaId, "reachGoal", eventName, params);
    } catch {
      // Metrika absent or blocked — never throw
    }
  }
}

/**
 * Single typed helper for all conversion analytics.
 * Safe without Metrika; never throws; never sends PII.
 */
export function trackAnalyticsEvent(
  event: AnalyticsEventName,
  params: AnalyticsParams = {}
): void {
  if (typeof window === "undefined") return;

  const raw = {
    ...params,
    pageUrl: params.pageUrl ?? window.location.pathname,
  };
  const clean = sanitizeAnalyticsParams(raw as Record<string, unknown>);

  window.dispatchEvent(
    new CustomEvent("irkportal:analytics", { detail: { event, ...clean } })
  );

  // Preserve legacy lead_* dataLayer naming for existing listeners
  const leadLegacy: LeadAnalyticsEvent[] = [
    "contact_click",
    "lead_form_open",
    "lead_form_submit",
    "lead_form_success",
    "lead_form_error",
    "messenger_click",
    "email_click",
    "cta_click",
  ];
  if ((leadLegacy as string[]).includes(event)) {
    window.dispatchEvent(
      new CustomEvent("irkportal:lead", { detail: { event, ...clean } })
    );
    pushToDataLayer(`lead_${event}`, clean);
    return;
  }

  pushToDataLayer(event, clean);
}

/** @deprecated Prefer trackAnalyticsEvent — kept for existing call sites */
export function trackLeadEvent(
  event: LeadAnalyticsEvent,
  params: LeadAnalyticsParams = {}
): void {
  trackAnalyticsEvent(event, params);
}

export function leadAnalyticsProps(
  event: LeadAnalyticsEvent,
  params: LeadAnalyticsParams = {}
): Record<string, string> {
  const props: Record<string, string> = { "data-event": event };
  if (params.sourceType) props["data-source-type"] = params.sourceType;
  if (params.sourceTitle) props["data-source-title"] = params.sourceTitle;
  if (params.sourceSlug) props["data-source-slug"] = params.sourceSlug;
  if (params.sourceBlock) props["data-source-block"] = params.sourceBlock;
  if (params.requestType) props["data-request-type"] = params.requestType;
  if (params.cta) props["data-cta"] = params.cta;
  return props;
}
