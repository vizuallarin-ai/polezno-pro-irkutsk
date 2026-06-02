import type { NavItem } from "@/types/navigation";
import { BOOSTY_URL } from "@/lib/site-links";

export const DEFAULT_NAV_LINKS: NavItem[] = [
  { href: "/map", label: "Маршруты" },
  { href: "/program", label: "Экскурсии" },
  { href: "/program", label: "Для компаний" },
  { href: "/explore", label: "Исследовать" },
  { href: "/events", label: "События" },
  { href: "/shop", label: "Магазин" },
  { href: BOOSTY_URL, label: "Клуб" },
  { href: "/about", label: "О проекте" },
  { href: "/contact", label: "Контакты" },
];

export const DEFAULT_CTA = { label: "Спланировать", href: "/program" };
