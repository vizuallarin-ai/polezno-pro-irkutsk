import type { NavItem } from "@/types/navigation";
import { BOOSTY_URL } from "@/lib/site-links";

export const PRIMARY_NAV_LINKS: NavItem[] = [
  { href: "/map", label: "Маршруты" },
  { href: "/explore", label: "Исследовать" },
  { href: "/program", label: "Для бизнеса" },
  { href: "/about", label: "О проекте" },
  { href: "/contact", label: "Контакты" },
];

export const MORE_NAV_LINKS: NavItem[] = [
  { href: "/events", label: "События" },
  { href: BOOSTY_URL, label: "Клуб" },
  { href: "/shop", label: "Сувениры" },
];

/** @deprecated Use PRIMARY_NAV_LINKS — kept for CMS fallback compatibility */
export const DEFAULT_NAV_LINKS = PRIMARY_NAV_LINKS;

export const DEFAULT_CTA = { label: "Спланировать визит", href: "/program" };
