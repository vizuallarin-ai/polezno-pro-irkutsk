import type { NavItem } from "@/types/navigation";
import {
  PRIMARY_NAV_LINKS,
  MORE_NAV_LINKS,
  DEFAULT_CTA,
} from "@/lib/navigation-constants";

export { PRIMARY_NAV_LINKS, MORE_NAV_LINKS, DEFAULT_CTA };

export async function getNavigation(): Promise<{
  primaryLinks: NavItem[];
  moreLinks: NavItem[];
  ctaLabel: string;
  ctaHref: string;
}> {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const nav = await payload.findGlobal({ slug: "navigation" });

    return {
      primaryLinks: PRIMARY_NAV_LINKS,
      moreLinks: MORE_NAV_LINKS,
      ctaLabel: (nav.ctaLabel as string) || DEFAULT_CTA.label,
      ctaHref: (nav.ctaHref as string) || DEFAULT_CTA.href,
    };
  } catch {
    return {
      primaryLinks: PRIMARY_NAV_LINKS,
      moreLinks: MORE_NAV_LINKS,
      ctaLabel: DEFAULT_CTA.label,
      ctaHref: DEFAULT_CTA.href,
    };
  }
}
