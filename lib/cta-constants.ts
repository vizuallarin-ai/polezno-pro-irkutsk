/**
 * Canonical CTA destinations for B2C / B2B separation.
 * Product type + slug context only — never PII in URLs.
 */

export const CTA = {
  b2cPrimary: {
    label: "Подобрать прогулку",
    href: "/contact",
  },
  b2bPrimary: {
    label: "Обсудить программу для бизнеса",
    href: "/business",
  },
  b2bNav: {
    label: "Для бизнеса",
    href: "/business",
  },
  exploreFallback: {
    label: "Подобрать прогулку",
    href: "/contact",
  },
  routeRequest: {
    label: "Запросить маршрут",
  },
  excursionRequest: {
    label: "Запросить дату",
  },
  mapExplore: {
    label: "Читать о городе",
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
 * Header/global primary CTA must stay B2C.
 * If CMS still stores legacy /business mainCta, remap to canonical walk CTA.
 */
export function resolvePublicMainCta(input: {
  label?: string | null;
  href?: string | null;
  description?: string | null;
}): { label: string; href: string; description?: string } {
  const href = (input.href ?? "").trim() || CTA.b2cPrimary.href;
  if (href === "/business" || href.startsWith("/business?")) {
    return {
      label: CTA.b2cPrimary.label,
      href: CTA.b2cPrimary.href,
      description: input.description ?? undefined,
    };
  }
  return {
    label: (input.label ?? "").trim() || CTA.b2cPrimary.label,
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
      // B2C article must not dump readers into B2B form
      return {
        href: articleContactHref(input.articleSlug ?? "explore"),
        label: CTA.exploreFallback.label,
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
        label: CTA.exploreFallback.label,
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
      label: CTA.excursionRequest.label,
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
    label: CTA.exploreFallback.label,
    kind: "contact",
  };
}
