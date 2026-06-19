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

function filterMoreLinks(links: NavItem[], showEvents: boolean): NavItem[] {
  if (showEvents) return links;
  return links.filter((link) => link.href !== "/events");
}

export async function getNavigation(): Promise<{
  primaryLinks: NavItem[];
  moreLinks: NavItem[];
  ctaLabel: string;
  ctaHref: string;
}> {
  const showEvents = await hasPublishedEvents();
  const moreLinks = filterMoreLinks(MORE_NAV_LINKS, showEvents);

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
