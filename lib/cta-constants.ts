/**
 * Canonical CTA destinations for B2C / B2B separation.
 * Product type + slug context only — never PII in URLs.
 *
 * Vocabulary (UX.B):
 * - Discovery:        Смотреть маршруты → /map
 * - Assisted choice:  Подобрать мне прогулку → /contact
 * - High intent:      Пройти с Алёной → route-aware contact
 * - B2B:              Обсудить программу → /business
 */

export const CTA = {
  /** Primary discovery — browse catalog */
  discovery: {
    label: "Смотреть маршруты",
    href: "/map",
  },
  /** Assisted choice — help me pick */
  assist: {
    label: "Подобрать мне прогулку",
    href: "/contact",
  },
  /** High-intent guided walk */
  guided: {
    label: "Пройти с Алёной",
  },
  /** Header / global primary browse (alias of discovery) */
  b2cPrimary: {
    label: "Смотреть маршруты",
    href: "/map",
  },
  /** Compact B2B discuss */
  b2bPrimary: {
    label: "Обсудить программу",
    href: "/business",
  },
  b2bNav: {
    label: "Для бизнеса",
    href: "/business",
  },
  exploreFallback: {
    label: "Подобрать мне прогулку",
    href: "/contact",
  },
  routeRequest: {
    label: "Пройти с Алёной",
  },
  excursionRequest: {
    label: "Пройти с Алёной",
  },
  mapExplore: {
    label: "Исследовать Иркутск",
    href: "/explore",
  },
  souvenirPrelaunch: {
    label: "Написать о коллекции",
    href: "/contact",
  },
  prelaunchContact: {
    label: "Связаться",
    href: "/contact",
  },
  contactSecondary: {
    label: "Связаться",
    href: "/contact",
  },
} as const;

export type ContactIntent =
  | "walk"
  | "route"
  | "excursion"
  | "souvenir"
  | "ar"
  | "photo"
  | "explore"
  | "general";

export type ContactContextInput = {
  intent?: ContactIntent;
  productType?: string;
  slug?: string;
  articleSlug?: string;
  sourceBlock?: string;
  hash?: string;
};

/** Build /contact URL with non-PII context query params. */
export function buildContactHref(input: ContactContextInput = {}): string {
  const params = new URLSearchParams();
  if (input.intent) params.set("intent", input.intent);
  if (input.productType) params.set("productType", input.productType);
  if (input.slug) params.set("slug", input.slug);
  if (input.articleSlug) params.set("article", input.articleSlug);
  if (input.sourceBlock) params.set("sourceBlock", input.sourceBlock);
  const qs = params.toString();
  const hash = input.hash ?? "#lead-form";
  return qs ? `/contact?${qs}${hash}` : `/contact${hash}`;
}

export function assistWalkHref(sourceBlock = "assist"): string {
  return buildContactHref({
    intent: "walk",
    sourceBlock,
  });
}

export function routeContactHref(slug: string, sourceBlock = "route"): string {
  return buildContactHref({
    intent: "route",
    productType: "route",
    slug,
    sourceBlock,
  });
}

export function excursionContactHref(
  slug: string,
  sourceBlock = "excursion"
): string {
  return buildContactHref({
    intent: "excursion",
    productType: "excursion",
    slug,
    sourceBlock,
  });
}

/**
 * Header/global primary CTA must stay B2C discovery.
 * If CMS still stores legacy /business or old contact-first CTA, remap.
 */
export function resolvePublicMainCta(input: {
  label?: string | null;
  href?: string | null;
  description?: string | null;
}): { label: string; href: string; description?: string } {
  const raw = (input.href ?? "").trim() || CTA.discovery.href;
  const unsafe =
    /^javascript:/i.test(raw) ||
    /^data:/i.test(raw) ||
    /^vbscript:/i.test(raw);
  const href = unsafe ? CTA.discovery.href : raw;

  if (href === "/business" || href.startsWith("/business?")) {
    return {
      label: CTA.discovery.label,
      href: CTA.discovery.href,
      description: input.description ?? undefined,
    };
  }

  // Legacy CMS contact-first primary → discovery browse
  if (href === "/contact" || href.startsWith("/contact?")) {
    return {
      label: CTA.discovery.label,
      href: CTA.discovery.href,
      description: input.description ?? undefined,
    };
  }

  return {
    label: (input.label ?? "").trim() || CTA.discovery.label,
    href,
    description: input.description ?? undefined,
  };
}

export function articleContactHref(
  articleSlug: string,
  sourceBlock = "article"
): string {
  return buildContactHref({
    intent: "explore",
    articleSlug,
    sourceBlock,
  });
}

/**
 * Explore article commercial CTA:
 * related published route/excursion → that URL;
 * else → contact with article context.
 * Never fall back to /business for B2C readers.
 */
export function resolveExploreCommercialHref(input: {
  relatedRouteSlug?: string | null;
  relatedExcursionSlug?: string | null;
  articleSlug?: string | null;
  /** When CMS stores an explicit CTA — only allow safe public paths */
  ctaLink?: string | null;
}): { href: string; label: string; kind: "route" | "excursion" | "contact" } {
  const raw = input.ctaLink?.trim();
  if (raw) {
    if (raw.startsWith("/business")) {
      return {
        href: articleContactHref(input.articleSlug ?? "explore"),
        label: CTA.assist.label,
        kind: "contact",
      };
    }
    if (
      raw.startsWith("/map/") ||
      raw.startsWith("/excursions/") ||
      raw.startsWith("/contact")
    ) {
      return {
        href: raw,
        label: raw.startsWith("/map/")
          ? "Открыть маршрут"
          : raw.startsWith("/excursions/")
            ? CTA.guided.label
            : CTA.assist.label,
        kind: raw.startsWith("/excursions/")
          ? "excursion"
          : raw.startsWith("/map/")
            ? "route"
            : "contact",
      };
    }
  }

  if (input.relatedExcursionSlug) {
    return {
      href: `/excursions/${input.relatedExcursionSlug}`,
      label: CTA.guided.label,
      kind: "excursion",
    };
  }
  if (input.relatedRouteSlug) {
    return {
      href: `/map/${input.relatedRouteSlug}`,
      label: "Открыть маршрут",
      kind: "route",
    };
  }
  return {
    href: articleContactHref(input.articleSlug ?? "explore"),
    label: CTA.assist.label,
    kind: "contact",
  };
}
