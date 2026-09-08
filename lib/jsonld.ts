import { getSiteUrl } from "@/lib/site-url";
import { BOOSTY_URL, TELEGRAM_URL } from "@/lib/site-links";
import { BRAND } from "@/lib/brand-constants";

const BASE_URL = getSiteUrl();

/**
 * Minimal Organization — only confirmed public facts.
 * Do not emit LocalBusiness / TravelAgency street address, phone, hours, or priceRange
 * until owner settings confirm them.
 */
export function organizationSchema(opts?: {
  name?: string;
  description?: string;
  email?: string;
  sameAs?: string[];
}) {
  const sameAs = (opts?.sameAs ?? [TELEGRAM_URL, BOOSTY_URL]).filter(Boolean);
  const email = opts?.email?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: opts?.name?.trim() || BRAND.projectName,
    url: BASE_URL,
    logo: `${BASE_URL}/icon`,
    description:
      opts?.description?.trim() ||
      BRAND.projectDescriptor,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            email,
          },
        }
      : {}),
  };
}

/** WebSite schema — no SearchAction until a real site search exists. */
export function websiteSchema(opts?: { name?: string; description?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: opts?.name?.trim() || BRAND.projectName,
    url: BASE_URL,
    inLanguage: "ru-RU",
    ...(opts?.description?.trim()
      ? { description: opts.description.trim() }
      : {}),
  };
}

export function articleSchema({
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  updatedAt,
  authorName,
}: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(imageUrl ? { image: imageUrl } : {}),
    publisher: {
      "@type": "Organization",
      name: BRAND.projectName,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon`,
      },
    },
    ...(authorName?.trim()
      ? {
          author: {
            "@type": "Person",
            name: authorName.trim(),
          },
        }
      : {}),
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
  };
}

export function eventSchema({
  title,
  description,
  url,
  startDate,
  endDate,
  location,
  imageUrl,
  offers,
}: {
  title: string;
  description: string;
  url: string;
  startDate: string;
  endDate?: string;
  location: string;
  imageUrl?: string;
  offers?: { price: string; url?: string };
}) {
  const numericPrice =
    offers?.price != null && /^\d+([.,]\d+)?$/.test(String(offers.price).trim())
      ? String(offers.price).trim().replace(",", ".")
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description,
    url,
    startDate,
    ...(endDate ? { endDate } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Иркутск",
        addressCountry: "RU",
      },
    },
    organizer: {
      "@type": "Organization",
      name: BRAND.projectName,
      url: BASE_URL,
    },
    ...(numericPrice
      ? {
          offers: {
            "@type": "Offer",
            price: numericPrice,
            priceCurrency: "RUB",
            ...(offers?.url ? { url: offers.url } : { url }),
          },
        }
      : {}),
  };
}

export function productSchema({
  title,
  description,
  url,
  price,
  imageUrl,
  sku,
  inStock,
}: {
  title: string;
  description: string;
  url: string;
  price: number;
  imageUrl?: string;
  sku?: string;
  inStock?: boolean;
}) {
  const safePrice = Number.isFinite(price) && price > 0 ? price : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    url,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(sku ? { sku } : {}),
    ...(safePrice != null
      ? {
          offers: {
            "@type": "Offer",
            price: String(safePrice),
            priceCurrency: "RUB",
            availability:
              inStock === false
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            url,
            seller: {
              "@type": "Organization",
              name: BRAND.projectName,
            },
          },
        }
      : {}),
  };
}

/**
 * Guided / self-guided experience detail.
 * Prefer TouristTrip over inventing Product/Event claims.
 * Price only when a real positive RUB amount is confirmed.
 */
export function touristTripSchema({
  title,
  description,
  url,
  duration,
  imageUrl,
  price,
}: {
  title: string;
  description: string;
  url: string;
  duration?: number;
  imageUrl?: string;
  price?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: title,
    description,
    url,
    ...(imageUrl ? { image: imageUrl } : {}),
    provider: {
      "@type": "Organization",
      name: BRAND.projectName,
      url: BASE_URL,
    },
    ...(duration && duration > 0
      ? {
          itinerary: {
            "@type": "ItemList",
            numberOfItems: 1,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: title,
              },
            ],
          },
        }
      : {}),
    ...(price != null && price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: String(price),
            priceCurrency: "RUB",
            url,
          },
        }
      : {}),
  };
}

/** Future CONTENT.1 Person helper — call only with real guide data. */
export function personSchema({
  name,
  description,
  url,
  imageUrl,
}: {
  name: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}

export function breadcrumbSchema(items: Array<{ label: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${BASE_URL}${item.href.startsWith("/") ? item.href : `/${item.href}`}`,
    })),
  };
}

/** Safe JSON-LD serialization for script tags (escape `<`). */
export function serializeJsonLd(
  data: Record<string, unknown> | Record<string, unknown>[]
): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
