import type { NavItem } from "@/types/navigation";
import { DEFAULT_NAV_LINKS, DEFAULT_CTA } from "@/lib/navigation-constants";

export { DEFAULT_NAV_LINKS, DEFAULT_CTA };

export async function getNavigation(): Promise<{
  links: NavItem[];
  ctaLabel: string;
  ctaHref: string;
}> {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const nav = await payload.findGlobal({ slug: "navigation" });

    const links =
      Array.isArray(nav.mainNav) && nav.mainNav.length > 0
        ? (nav.mainNav as NavItem[])
        : DEFAULT_NAV_LINKS;

    return {
      links,
      ctaLabel: (nav.ctaLabel as string) || DEFAULT_CTA.label,
      ctaHref: (nav.ctaHref as string) || DEFAULT_CTA.href,
    };
  } catch {
    return {
      links: DEFAULT_NAV_LINKS,
      ctaLabel: DEFAULT_CTA.label,
      ctaHref: DEFAULT_CTA.href,
    };
  }
}
