import type { NavItem } from "@/types/navigation";
import {
  PRIMARY_NAV_LINKS,
  MORE_NAV_LINKS,
  DEFAULT_CTA,
} from "@/lib/navigation-constants";
import {
  AR_POSTCARD_PUBLISHED_WHERE,
  PHOTO_PUBLISHED_WHERE,
  PUBLISHED_STATUS_WHERE,
} from "@/lib/cms-filters";

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

export async function getSecondaryCatalogFlags(): Promise<{
  showEvents: boolean;
  showPhotos: boolean;
  showAr: boolean;
  showSouvenirs: boolean;
  showGuides: boolean;
}> {
  if (!process.env.DATABASE_URL) {
    return {
      showEvents: false,
      showPhotos: false,
      showAr: false,
      showSouvenirs: false,
      showGuides: false,
    };
  }

  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const [events, photos, ar, products, guides] = await Promise.all([
      payload.count({ collection: "events", where: PUBLISHED_STATUS_WHERE }),
      payload.count({ collection: "photos", where: PHOTO_PUBLISHED_WHERE }),
      payload.count({
        collection: "ar-postcards",
        where: AR_POSTCARD_PUBLISHED_WHERE,
      }),
      payload.count({ collection: "products", where: PUBLISHED_STATUS_WHERE }),
      payload.count({
        collection: "guides",
        where: { isActive: { equals: true } },
      }),
    ]);

    return {
      showEvents: events.totalDocs > 0,
      showPhotos: photos.totalDocs > 0,
      showAr: ar.totalDocs > 0,
      showSouvenirs: products.totalDocs > 0,
      showGuides: guides.totalDocs > 0,
    };
  } catch {
    return {
      showEvents: false,
      showPhotos: false,
      showAr: false,
      showSouvenirs: false,
      showGuides: false,
    };
  }
}

function filterMoreLinks(
  links: NavItem[],
  flags: {
    showEvents: boolean;
    showPhotos: boolean;
    showAr: boolean;
    showSouvenirs: boolean;
  }
): NavItem[] {
  return links.filter((link) => {
    if (link.href === "/events") return flags.showEvents;
    if (link.href === "/explore/photos") return flags.showPhotos;
    if (link.href === "/ar-postcards") return flags.showAr;
    if (link.href === "/souvenirs") return flags.showSouvenirs;
    return true;
  });
}

export async function getNavigation(): Promise<{
  primaryLinks: NavItem[];
  moreLinks: NavItem[];
  ctaLabel: string;
  ctaHref: string;
}> {
  const flags = await getSecondaryCatalogFlags();
  const moreLinks = filterMoreLinks(MORE_NAV_LINKS, flags);

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
