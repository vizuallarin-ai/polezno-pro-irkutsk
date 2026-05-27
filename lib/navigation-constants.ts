import type { NavItem } from "@/types/navigation";

export const DEFAULT_NAV_LINKS: NavItem[] = [
  { href: "/map", label: "Маршруты" },
  { href: "/explore", label: "Исследовать" },
  { href: "/events", label: "События" },
  { href: "/about", label: "О проекте" },
];

export const DEFAULT_CTA = { label: "Создать тур", href: "/program" };
