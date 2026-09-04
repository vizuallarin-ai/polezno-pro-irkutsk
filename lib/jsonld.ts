import { getSiteUrl } from "@/lib/site-url";
import { BOOSTY_URL, TELEGRAM_URL } from "@/lib/site-links";
import { BRAND } from "@/lib/brand-constants";

const BASE_URL = getSiteUrl();

export function organizationSchema(opts?: {
  name?: string;
  description?: string;
  email?: string;
  sameAs?: string[];
}) {
  const sameAs = (opts?.sameAs ?? [TELEGRAM_URL, BOOSTY_URL]).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: opts?.name || BRAND.projectName,
    url: BASE_URL,
    logo: `${BASE_URL}/icon`,
    description:
      opts?.description ||
      "Авторский навигатор по Иркутску: маршруты, экскурсии и программы для бизнеса.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Иркутск",
      addressRegion: "Иркутская область",
      addressCountry: "RU",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      ...(opts?.email ? { email: opts.email } : { email: "info@irkportal.ru" }),
    },
    sameAs,
  };
}

export function touristDestinationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: "Иркутск",
    description:
      "Иркутск — исторический город в Восточной Сибири на берегу реки Ангара, крупнейший туристический центр, ворота к озеру Байкал.",
    geo: {
      "@type": "GeoCoordinates",
      latitude: 52.2978,
      longitude: 104.2964,
    },
    url: BASE_URL,
    touristType: ["Культурный туризм", "Экотуризм", "Гастрономический туризм"],
  };
}

export function articleSchema({
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image: imageUrl,
    publisher: {
      "@type": "Organization",
      name: BRAND.projectName,
      url: BASE_URL,
    },
    datePublished: publishedAt,
    dateModified: updatedAt,
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
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description,
    url,
    startDate,
    endDate,
    image: imageUrl,
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
    offers: offers
      ? {
          "@type": "Offer",
          price: offers.price,
          priceCurrency: "RUB",
          url: offers.url,
          availability: "https://schema.org/InStock",
        }
      : undefined,
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
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    url,
    image: imageUrl,
    sku,
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: "RUB",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
      seller: {
        "@type": "Organization",
        name: BRAND.projectName,
      },
    },
  };
}

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
    image: imageUrl,
    touristType: "Культурный туризм",
    provider: {
      "@type": "TravelAgency",
      name: BRAND.projectName,
      url: BASE_URL,
    },
    ...(duration
      ? {
          itinerary: {
            "@type": "ItemList",
            numberOfItems: 1,
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
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
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
      item: `${BASE_URL}${item.href}`,
    })),
  };
}
