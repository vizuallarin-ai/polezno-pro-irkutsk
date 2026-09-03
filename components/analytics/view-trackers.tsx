"use client";

import { useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics-events";

export function RouteViewTracker({
  slug,
  title,
}: {
  slug: string;
  title?: string;
}) {
  useEffect(() => {
    trackAnalyticsEvent("route_view", {
      sourceType: "route",
      sourceSlug: slug,
      sourceTitle: title,
      sourceBlock: "route-detail",
    });
  }, [slug, title]);
  return null;
}

export function ExcursionViewTracker({
  slug,
  title,
}: {
  slug: string;
  title?: string;
}) {
  useEffect(() => {
    trackAnalyticsEvent("excursion_view", {
      sourceType: "excursion",
      sourceSlug: slug,
      sourceTitle: title,
      sourceBlock: "excursion-detail",
    });
  }, [slug, title]);
  return null;
}
