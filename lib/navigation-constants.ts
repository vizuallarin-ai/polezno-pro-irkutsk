import type { NavItem } from "@/types/navigation";
import { BOOSTY_URL } from "@/lib/site-links";
import { CTA } from "@/lib/cta-constants";

/**
 * Primary destinations — tasks, not every section.
 * Contacts live in «Связаться» dropdown (not a peer primary link).
 */
export const PRIMARY_NAV_LINKS: NavItem[] = [
  { href: "/map", label: "Маршруты" },
  { href: "/explore", label: "Исследовать" },
  { href: CTA.b2bNav.href, label: CTA.b2bNav.label },
  { href: "/about", label: "О проекте" },
];

/**
 * Secondary architecture — always listed (pre-launch / client review).
 * Empty catalogs show editorial PrelaunchState on their pages.
 */
export const MORE_NAV_LINKS: NavItem[] = [
  { href: "/events", label: "События" },
  { href: "/explore/photos", label: "Фото Иркутска" },
  { href: "/ar-postcards", label: "AR-открытки" },
  { href: BOOSTY_URL, label: "Клуб" },
  { href: "/souvenirs", label: "Сувениры" },
  { href: "/about/guides", label: "Гайды" },
];

/** @deprecated Use PRIMARY_NAV_LINKS — kept for CMS fallback compatibility */
export const DEFAULT_NAV_LINKS = PRIMARY_NAV_LINKS;

/** Header primary CTA — B2C discovery browse */
export const DEFAULT_CTA = {
  label: CTA.discovery.label,
  href: CTA.discovery.href,
};
