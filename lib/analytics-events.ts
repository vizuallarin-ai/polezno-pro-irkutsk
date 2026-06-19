export type LeadAnalyticsEvent =
  | "contact_click"
  | "lead_form_open"
  | "lead_form_submit"
  | "lead_form_success"
  | "lead_form_error"
  | "messenger_click"
  | "email_click"
  | "cta_click";

export type LeadAnalyticsParams = {
  sourceType?: string;
  sourceTitle?: string;
  sourceSlug?: string;
  sourceBlock?: string;
  requestType?: string;
  pageUrl?: string;
  cta?: string;
};

export function trackLeadEvent(
  event: LeadAnalyticsEvent,
  params: LeadAnalyticsParams = {}
): void {
  if (typeof window === "undefined") return;

  const detail = { event, ...params, pageUrl: params.pageUrl ?? window.location.href };

  window.dispatchEvent(new CustomEvent("irkportal:lead", { detail }));

  const w = window as Window & {
    dataLayer?: Record<string, unknown>[];
    ym?: (id: number, method: string, goal: string, params?: object) => void;
  };

  const { event: eventName, ...rest } = detail;
  w.dataLayer?.push({ event: `lead_${eventName}`, ...rest });
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
