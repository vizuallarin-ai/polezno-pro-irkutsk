import type { NavItem } from "@/types/navigation";
import {
  PRIMARY_NAV_LINKS,
  MORE_NAV_LINKS,
  DEFAULT_CTA,
} from "@/lib/navigation-constants";
import { PUBLISHED_STATUS_WHERE } from "@/lib/cms-filters";

export { PRIMARY_NAV_LINKS, MORE_NAV_LINKS, DEFAULT_CTA };

export async function hasPublishedEvents(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const count = await payload.count({
      collection: "events",
      where: PUBLISHED_STATUS_WHERE,
    });
    return count.totalDocs > 0;
  } catch {
    return false;
  }
}

/**
 * Pre-launch / client-review: all secondary catalog modules stay visible
 * so stakeholders can walk every section. Empty catalogs use PrelaunchState.
 */
export async function getSecondaryCatalogFlags(): Promise<{
  showEvents: boolean;
  showPhotos: boolean;
  showAr: boolean;
  showSouvenirs: boolean;
  showGuides: boolean;
}> {
  return {
    showEvents: true,
    showPhotos: true,
    showAr: true,
    showSouvenirs: true,
    showGuides: true,
  };
}

export async function getNavigation(): Promise<{
  primaryLinks: NavItem[];
  moreLinks: NavItem[];
  ctaLabel: string;
  ctaHref: string;
}> {
  const moreLinks = MORE_NAV_LINKS;

  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const nav = await payload.findGlobal({ slug: "navigation" });

    return {
      primaryLinks: PRIMARY_NAV_LINKS,
      moreLinks,
      ctaLabel: (nav.ctaLabel as string) || DEFAULT_CTA.label,
      ctaHref: (nav.ctaHref as string) || DEFAULT_CTA.href,
    };
  } catch {
    return {
      primaryLinks: PRIMARY_NAV_LINKS,
      moreLinks,
      ctaLabel: DEFAULT_CTA.label,
      ctaHref: DEFAULT_CTA.href,
    };
  }
}
